
from datetime import datetime, timezone

from database.database import database


async def create_audience_snapshot(
    user_id: str,
    platform_id: str,
    channel_id: str,
    subscribers: int,
    total_views: int,
    video_count: int
):
    snapshot = {
        "user_id": user_id,
        "platform_id": platform_id,
        "channel_id": channel_id,
        "subscribers": subscribers,
        "total_views": total_views,
        "video_count": video_count,
        "recorded_at": datetime.now(timezone.utc)
    }

    collection = database["audience_snapshots"]

    result = await collection.insert_one(snapshot)

    return str(result.inserted_id)


async def get_audience_history(
    user_id: str,
    platform_id: str
):
    collection = database["audience_snapshots"]

    cursor = collection.find({
        "user_id": user_id,
        "platform_id": platform_id
    }).sort("recorded_at", 1)

    return await cursor.to_list(length=365)
