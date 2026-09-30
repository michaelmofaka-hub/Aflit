from pydantic import BaseModel, EmailStr 

class User(BaseModel):
  username: str
  email: str
  password: str

class UserLogin(BaseModel):
  email: EmailStr
  password: str

class UserResponse(BaseModel):
  user_id: str
  username: str
  email: EmailStr

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class UserUpdate(BaseModel):
    username: str | None = None