from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordBearer

from Services.users import authenticate_user, create_access_token, verify_access_token
from Services.users import get_user_by_email, verify_password
from Services.users import create_user, save_user
from Schema.users import User

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/users/login")
def get_current_user(token: str = Depends(oauth2_scheme)):
  payload = verify_access_token(token)
  return payload

@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return current_user

@router.post('/register')
async def register(user: User):
  new_user = create_user(user.username, user.email,   user.password)
  user_id = await save_user(new_user)
  return {"user_id": user_id}

@router.post("/login")
async def authenticate_user(email: str, password: str):
    user = await get_user_by_email(email)
    print("AUTH USER:", user)

    if user is None:
        return None
    user_id = str(user["_id"])
    token = create_access_token(user_id
                               )
    return {
            "access_token": token,
            "token_type": "bearer"
            }
    

    is_valid = verify_password(password, user["password"])

    if not is_valid:
        return None

    return user