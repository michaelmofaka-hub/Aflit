from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from bson import ObjectId

from Services.users import authenticate_user, create_access_token, verify_access_token, ensure_ownership
from Services.users import get_user_by_email, verify_password, get_user_by_id
from Services.users import create_user, save_user
from Schema.users import User, UserLogin

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/users/login")
async def get_current_user(token: str = Depends(oauth2_scheme)):
  payload = verify_access_token(token)
  
  user = await get_user_by_id(payload["user_id"])
  if user is None:
    raise HTTPException(
      status_code=401,
      detail="invalid or expired token"
    )
  return user

@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
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

@router.post('/register')
async def register(user: User):
  new_user = create_user(user.username, user.email,   user.password)
  user_id = await save_user(new_user)
  return {"user_id": user_id}

@router.post("/login")
async def login(user: UserLogin):
    user_record = await get_user_by_email(user.email)

    if user_record is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    is_valid = verify_password(
        user.password,
        user_record["password"]
    )

    if not is_valid:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    user_id = str(user_record["_id"])
    token = create_access_token(user_id)

    return {
        "access_token": token,
        "token_type": "bearer"
    }