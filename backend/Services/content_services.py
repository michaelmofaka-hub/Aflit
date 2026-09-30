from datetime import datetime, timezone

from bson import ObjectId
from bson.errors import InvalidId

from database.database import database


async def create_content(
    user_id: str,
    platform_id: str,
    platform: str,
    external_content_id: str,
    title: str,
    description: str | None,
    published_at
):
    content = {
        "user_id": user_id,
        "platform_id": platform_id,
        "platform": platform,
        "external_content_id": external_content_id,
        "title": title,
        "description": description,
        "published_at": published_at,
        "created_at": datetime.now(timezone.utc)
    }

    collection = database["content"]

    result = await collection.insert_one(content)

    return str(result.inserted_id)


async def get_user_content(user_id: str):
    collection = database["content"]

    cursor = collection.find({
        "user_id": user_id
    })

    return await cursor.to_list(length=None)


async def get_content(
    content_id: str,
    user_id: str
):
    collection = database["content"]

    try:
        object_id = ObjectId(content_id)
    except InvalidId:
        return None

    content = await collection.find_one({
        "_id": object_id,
        "user_id": user_id
    })

    return content


async def delete_content(
    content_id: str,
    user_id: str
):
    collection = database["content"]

    try:
        object_id = ObjectId(content_id)
    except InvalidId:
        return None

    result = await collection.delete_one({
        "_id": object_id,
        "user_id": user_id
    })

    if result.deleted_count == 0:
        return None

    return True