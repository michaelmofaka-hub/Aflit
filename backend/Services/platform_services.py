
from bson import ObjectId
from bson.errors import InvalidId
from pymongo.errors import DuplicateKeyError

from database.database import database


async def connect_platform(
    user_id: str,
    platform: str,
    platform_id: str,
    external_account_id: str | None = None,
    account_name: str | None = None,
    uploads_playlist_id: str | None = None,
    access_token: str | None = None,
    refresh_token: str | None = None,
    token_expires_at=None
):
    platform_data = {
        "user_id": user_id,
        "platform": platform,
        "platform_id": platform_id,
        "external_account_id": external_account_id,
        "account_name": account_name,
        "uploads_playlist_id": uploads_playlist_id,
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_expires_at": token_expires_at,
        "status": "connected"
    }

    collection = database["platform"]

    try:
        result = await collection.insert_one(platform_data)

    except DuplicateKeyError:
        return None

    return str(result.inserted_id)


async def get_user_platforms(user_id: str):
    collection = database["platform"]

    cursor = collection.find({"user_id": user_id})

    platforms = await cursor.to_list(length=None)

    return platforms


async def get_platform(platform_id: str, user_id: str):
    collection = database["platform"]

    try:
        object_id = ObjectId(platform_id)

    except InvalidId:
        return None

    platform = await collection.find_one({
        "_id": object_id,
        "user_id": user_id
    })

    return platform


async def delete_platform(platform_id: str, user_id: str):
    collection = database["platform"]

    try:
        object_id = ObjectId(platform_id)

    except InvalidId:
        return None

    result = await collection.delete_one({
        "_id": object_id,
        "user_id": user_id
    })

    return result.deleted_count


async def get_user_youtube(user_id: str):
    collection = database["platform"]

    return await collection.find_one({
        "user_id": user_id,
        "platform": "youtube",
        "status": "connected"
    })
