from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from pymongo.errors import DuplicateKeyError

from Services.users import (
    create_user,
    save_user,
    get_user_by_email,
    verify_password,
    get_user_by_id,
    create_access_token,
    verify_access_token,
    ensure_ownership,
    authenticate_user,
    update_user
)

from Schema.users import (
    User,
    UserLogin,
    UserResponse,
    TokenResponse,
    UserUpdate
)

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/users/login"
)


async def get_current_user(
    token: str = Depends(oauth2_scheme)
):
    payload = verify_access_token(token)

    if payload is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token"
        )

    if "user_id" not in payload:
        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )

    user = await get_user_by_id(
        payload["user_id"]
    )

    if user is None:
        raise HTTPException(
            status_code=401,
            detail="User no longer exists"
        )

    return user


@router.get(
    "/me",
    response_model=UserResponse
)
async def get_me(
    current_user: dict = Depends(get_current_user)
):
    return {
        "user_id": str(current_user["_id"]),
        "username": current_user["username"],
        "email": current_user["email"]
    }


@router.get(
    "/check-owner/{resource_user_id}"
)
async def check_owner(
    resource_user_id: str,
    current_user: dict = Depends(get_current_user)
):
    current_user_id = str(current_user["_id"])

    if not ensure_ownership(
        resource_user_id,
        current_user_id
    ):
        raise HTTPException(
            status_code=403,
            detail="You do not own this resource"
        )

    return {
        "message": "Access allowed"
    }


@router.post(
    "/register",
    response_model=UserResponse
)
async def register(user: User):
    existing_user = await get_user_by_email(
        user.email
    )

    if existing_user is not None:
        raise HTTPException(
            status_code=409,
            detail="Email already registered"
        )

    new_user = create_user(
        user.username,
        user.email,
        user.password
    )

    try:
        user_id = await save_user(new_user)

    except DuplicateKeyError:
        raise HTTPException(
            status_code=409,
            detail="Email already registered"
        )

    return {
        "user_id": user_id,
        "username": user.username,
        "email": user.email
    }


@router.post(
    "/login",
    response_model=TokenResponse
)
async def login(user: UserLogin):
    user_record = await authenticate_user(
        user.email,
        user.password
    )

    if user_record is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    user_id = str(user_record["_id"])

    token = create_access_token(
        user_id
    )

    return {
        "access_token": token
    }

@router.get(
    "/profile",
    response_model=UserResponse
)
async def get_profile(
    current_user: dict = Depends(get_current_user)
):
    return {
        "user_id": str(current_user["_id"]),
        "username": current_user["username"],
        "email": current_user["email"]
    }

@router.patch(
    "/profile",
    response_model=UserResponse
)
async def update_profile(
    user_update: UserUpdate,
    current_user: dict = Depends(get_current_user)
):
    updated_user = await update_user(
        str(current_user["_id"]),
        {
            "username": user_update.username
        }
    )

    if updated_user is None:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return {
        "user_id": str(updated_user["_id"]),
        "username": updated_user["username"],
        "email": updated_user["email"]
    }