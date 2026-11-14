
from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Response,
    Cookie
)
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pymongo.errors import DuplicateKeyError

from Services.users import (
    create_user,
    save_user,
    get_user_by_email,
    get_user_by_id,
    verify_access_token,
    ensure_ownership,
    authenticate_user,
    update_user,
    create_access_token,
    create_refresh_token,
    verify_refresh_token,
    save_refresh_token,
    is_refresh_token_active,
    revoke_refresh_token
)

from Schema.users import (
    User,
    UserLogin,
    UserResponse,
    TokenResponse,
    UserUpdate
)

from Config.settings import settings


router = APIRouter()

bearer_scheme = HTTPBearer()

REFRESH_COOKIE = "aflit_refresh"
REFRESH_MAX_AGE = 7 * 24 * 60 * 60


# --------------------------------------------------
# REFRESH COOKIE MANAGEMENT
# --------------------------------------------------

def set_refresh_cookie(response: Response, token: str):
    is_production = settings.environment.lower() == "production"

    response.set_cookie(
        key=REFRESH_COOKIE,
        value=token,
        httponly=True,
        secure=is_production,
        samesite="none" if is_production else "lax",
        max_age=REFRESH_MAX_AGE,
        path="/users"
    )


def clear_refresh_cookie(response: Response):
    is_production = settings.environment.lower() == "production"

    response.delete_cookie(
        key=REFRESH_COOKIE,
        path="/users",
        secure=is_production,
        httponly=True,
        samesite="none" if is_production else "lax"
    )


# --------------------------------------------------
# AUTHENTICATION
# --------------------------------------------------

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)
):
    token = credentials.credentials

    payload = verify_access_token(token)

    if payload is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token"
        )

    user_id = payload.get("user_id")

    if not user_id:
        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )

    user = await get_user_by_id(user_id)

    if user is None:
        raise HTTPException(
            status_code=401,
            detail="User no longer exists"
        )

    return user


# --------------------------------------------------
# USER PROFILE
# --------------------------------------------------

@router.get("/me", response_model=UserResponse)
async def get_me(
    current_user: dict = Depends(get_current_user)
):
    return {
        "user_id": str(current_user["_id"]),
        "username": current_user["username"],
        "email": current_user["email"]
    }


@router.get("/check-owner/{resource_user_id}")
async def check_owner(
    resource_user_id: str,
    current_user: dict = Depends(get_current_user)
):
    current_user_id = str(current_user["_id"])

    if not ensure_ownership(resource_user_id, current_user_id):
        raise HTTPException(
            status_code=403,
            detail="You do not own this resource"
        )

    return {"message": "Access allowed"}


@router.get("/profile", response_model=UserResponse)
async def get_profile(
    current_user: dict = Depends(get_current_user)
):
    return {
        "user_id": str(current_user["_id"]),
        "username": current_user["username"],
        "email": current_user["email"]
    }


@router.patch("/profile", response_model=UserResponse)
async def update_profile(
    user_update: UserUpdate,
    current_user: dict = Depends(get_current_user)
):
    updated_user = await update_user(
        str(current_user["_id"]),
        {"username": user_update.username}
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


# --------------------------------------------------
# REGISTRATION
# --------------------------------------------------

@router.post("/register", response_model=UserResponse)
async def register(user: User):
    existing_user = await get_user_by_email(user.email)

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


# --------------------------------------------------
# LOGIN
# --------------------------------------------------

@router.post("/login", response_model=TokenResponse)
async def login(
    user: UserLogin,
    response: Response
):
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

    access_token = create_access_token(user_id)
    refresh_token = create_refresh_token(user_id)

    await save_refresh_token(
        user_id,
        refresh_token
    )

    set_refresh_cookie(
        response,
        refresh_token
    )

    return {
        "access_token": access_token
    }


# --------------------------------------------------
# REFRESH SESSION
# --------------------------------------------------

@router.post("/refresh", response_model=TokenResponse)
async def refresh_session(
    response: Response,
    refresh_token: str | None = Cookie(
        default=None,
        alias=REFRESH_COOKIE
    )
):
    if not refresh_token:
        raise HTTPException(
            status_code=401,
            detail="Refresh session missing"
        )

    payload = verify_refresh_token(refresh_token)

    if payload is None:
        clear_refresh_cookie(response)

        raise HTTPException(
            status_code=401,
            detail="Invalid or expired refresh session"
        )

    user_id = payload.get("user_id")

    if not user_id:
        clear_refresh_cookie(response)

        raise HTTPException(
            status_code=401,
            detail="Invalid refresh session"
        )

    active = await is_refresh_token_active(
        user_id,
        refresh_token
    )

    if not active:
        clear_refresh_cookie(response)

        raise HTTPException(
            status_code=401,
            detail="Refresh session revoked or expired"
        )

    user = await get_user_by_id(user_id)

    if user is None:
        await revoke_refresh_token(user_id, refresh_token)
        clear_refresh_cookie(response)

        raise HTTPException(
            status_code=401,
            detail="User no longer exists"
        )

    # Rotate the refresh token.
    await revoke_refresh_token(
        user_id,
        refresh_token
    )

    new_refresh_token = create_refresh_token(user_id)
    new_access_token = create_access_token(user_id)

    await save_refresh_token(
        user_id,
        new_refresh_token
    )

    set_refresh_cookie(
        response,
        new_refresh_token
    )

    return {
        "access_token": new_access_token
    }


# --------------------------------------------------
# LOGOUT
# --------------------------------------------------

@router.post("/logout")
async def logout(
    response: Response,
    refresh_token: str | None = Cookie(
        default=None,
        alias=REFRESH_COOKIE
    )
):
    if refresh_token:
        payload = verify_refresh_token(refresh_token)

        if payload and payload.get("user_id"):
            await revoke_refresh_token(
                payload["user_id"],
                refresh_token
            )

    clear_refresh_cookie(response)

    return {
        "message": "Logged out successfully"
    }
