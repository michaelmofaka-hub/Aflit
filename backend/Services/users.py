import bcrypt
<<<<<<< HEAD
import jwt
from datetime import datetime, timedelta, timezone
=======
>>>>>>> 45d31a2d1106c8c3f4f2e75739398e9c1b2ada98
from database.database import database
from Config.settings import settings

def hash_password(password: str) -> str:
  password_bytes = password.encode('utf-8')
  salt = bcrypt.gensalt()
  hashed_password = bcrypt.hashpw(password_bytes, salt)
  return hashed_password.decode('utf-8')

def verify_password(password: str, stored_hash: str) -> bool:
  password_bytes = password.encode('utf-8')
  stored = stored_hash.encode('utf-8')
  return bcrypt.checkpw(password_bytes, stored)

<<<<<<< HEAD
def create_access_token(user_id: str) -> str:
  """it simply returns a token of type string"""
  expires_at = datetime.now(timezone.utc) +                 timedelta(minutes=15)
  payload = {
    "user_id": user_id,
    "exp": expires_at
  }
  token = jwt.encode(payload, settings.jwt_secret,          algorithm="HS256")
  return token
  
def verify_access_token(token: str):
    payload = jwt.decode(
        token,
        settings.jwt_secret,
        algorithms=["HS256"]
    )
    return payload

def create_user(username: str, email: str, password: str) -> dict:
=======
def create_user(username: str, email: str, password: str):
>>>>>>> 45d31a2d1106c8c3f4f2e75739398e9c1b2ada98
  hashed_password = hash_password(password)
  user = {
    "username": username,
    "email": email,
    "password": hashed_password
  }
  return user

async def save_user(user: dict):
<<<<<<< HEAD
  collection = database["users"]
=======
  collection = database['user']
>>>>>>> 45d31a2d1106c8c3f4f2e75739398e9c1b2ada98
  result = await collection.insert_one(user)
  return str(result.inserted_id)

async def get_user_by_email(email: str):
  collection = database["users"]
  user = await collection.find_one({"email": email})
  if user is None:
    return None
<<<<<<< HEAD
  return user

=======
    
>>>>>>> 45d31a2d1106c8c3f4f2e75739398e9c1b2ada98
async def authenticate_user(email: str, password: str):
  user = await get_user_by_email(email)
  if user is None:
    return None
  is_valid = verify_password(password, user["password"])
  if not is_valid:
    return None
  return user

if __name__=="__main__":
<<<<<<< HEAD
  token = create_access_token('supertoken')
  print(token)
=======
  import asyncio
  authenticated = asyncio.run(
    authenticate_user(
        "john@example.com",
        "mysecretpassword"
        )
    )
    
  print(f"Authenticated user: {authenticated}")
>>>>>>> 45d31a2d1106c8c3f4f2e75739398e9c1b2ada98
