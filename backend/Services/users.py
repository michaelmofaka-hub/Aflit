import bcrypt
import jwt

from bson import ObjectId
from bson.errors import InvalidId
from datetime import datetime, timedelta, timezone

from database.database import database
from Config.settings import settings


def hash_password(password: str) -> str:
    password_bytes = password.encode("utf-8")
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(password_bytes, salt)

    return hashed_password.decode("utf-8")


def verify_password(password: str, stored_hash: str) -> bool:
    password_bytes = password.encode("utf-8")
    stored = stored_hash.encode("utf-8")

    return bcrypt.checkpw(password_bytes, stored)


def create_access_token(user_id: str) -> str:
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=15)

    payload = {
        "user_id": user_id,
        "token_type": "access",
        "iss": settings.jwt_issuer,
        "exp": expires_at
    }

    token = jwt.encode(
        payload,
        settings.jwt_secret,
        algorithm="HS256"
    )

    return token


def verify_access_token(token: str):
    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret,
            algorithms=["HS256"]
        )

        if payload.get("token_type") != "access":
            return None

        if payload.get("iss") != settings.jwt_issuer:
            return None

        return payload

    except jwt.PyJWTError:
        return None


def create_user(username: str, email: str, password: str) -> dict:
    hashed_password = hash_password(password)

    user = {
        "username": username,
        "email": email,
        "password": hashed_password
    }

    return user

async def update_user(user_id: str, updates: dict):
    collection = database["users"]

    try:
        object_id = ObjectId(user_id)
    except InvalidId:
        return None

    await collection.update_one(
        {"_id": object_id},
        {"$set": updates}
    )

    return await collection.find_one(
        {"_id": object_id}
    )
  
async def save_user(user: dict):
    collection = database["users"]

    result = await collection.insert_one(user)

    return str(result.inserted_id)


async def get_user_by_email(email: str):
    collection = database["users"]

    user = await collection.find_one({
        "email": email
    })

    if user is None:
        return None

    return user


async def get_user_by_id(user_id: str):
    collection = database["users"]

    try:
        object_id = ObjectId(user_id)
    except InvalidId:
        return None

    user = await collection.find_one({
        "_id": object_id
    })

    if user is None:
        return None

    return user


async def authenticate_user(email: str, password: str):
    user = await get_user_by_email(email)

    if user is None:
        return None

    is_valid = verify_password(
        password,
        user["password"]
    )

    if not is_valid:
        return None

    return user


def ensure_ownership(
    resource_user_id: str,
    current_user_id: str
):
    if resource_user_id != current_user_id:
        return False

    return True
  