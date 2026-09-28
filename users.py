import bcrypt
from database.connection import database

def hash_password(password: str) -> str:
  password_bytes = password.encode('utf-8')
  salt = bcrypt.gensalt()
  hashed_password = bcrypt.hashpw(password_bytes, salt)
  return hashed_password.decode('utf-8')

def verify_password(password: str, stored_hash: str) -> bool:
  password_bytes = password.encode('utf-8')
  stored = stored_hash.encode('utf-8')
  return bcrypt.checkpw(password_bytes, stored)

def create_user(username: str, email: str, password: str):
  hashed_password = hash_password(password)
  user = {
    "username": username,
    "email": email,
    "password": hashed_password
  }
  return user

async def save_user(user: dict):
  collection = database['user']
  result = await collection.insert_one(user)
  return str(result.inserted_id)

async def get_user_by_email(email: str):
  collection = database["users"]
  user = await collection.find_one({"email": email})
  if user is None:
    return None
    
async def authenticate_user(email: str, password: str):
  user = await get_user_by_email(email)
  if user is None:
    return None
  is_valid = verify_password(password, user["password"])
  if not is_valid:
    return None
  return user

if __name__=="__main__":
  import asyncio
  authenticated = asyncio.run(
    authenticate_user(
        "john@example.com",
        "mysecretpassword"
        )
    )
    
  print(f"Authenticated user: {authenticated}")