from datetime import datetime, timezone

from bson import ObjectId
from bson.errors import InvalidId

from database.database import database


async def create_analytics(
    user_id: str,
    content_id: str,
    platform_id: str,
    platform: str,
    metrics: dict,
    recorded_at: datetime
):
    analytics = {
        "user_id": user_id,
        "content_id": content_id,
        "platform_id": platform_id,
        "platform": platform,
        "metrics": metrics,
        "recorded_at": recorded_at,
        "created_at": datetime.now(timezone.utc)
    }

    collection = database["analytics"]

    result = await collection.insert_one(analytics)

    return str(result.inserted_id)


async def get_user_analytics(user_id: str):
    collection = database["analytics"]

    cursor = collection.find({
        "user_id": user_id
    })

    return await cursor.to_list(length=None)


async def get_analytics(
    analytics_id: str,
    user_id: str
):
    collection = database["analytics"]

    try:
        object_id = ObjectId(analytics_id)
    except InvalidId:
        return None

    analytics = await collection.find_one({
        "_id": object_id,
        "user_id": user_id
    })

    return analytics


async def delete_analytics(
    analytics_id: str,
    user_id: str
):
    collection = database["analytics"]

    try:
        object_id = ObjectId(analytics_id)
    except InvalidId:
        return None

    result = await collection.delete_one({
        "_id": object_id,
        "user_id": user_id
    })

    if result.deleted_count == 0:
        return None

    return True