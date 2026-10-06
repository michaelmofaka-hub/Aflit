from datetime import datetime, timezone

from bson import ObjectId
from bson.errors import InvalidId

from database.database import database


async def create_ai_insight(
    user_id: str,
    source: str,
    insight: str,
    recommendation: str
):
    insight_data = {
    "user_id": user_id,
    "source": source,
    "insight": insight,
    "recommendation": recommendation,
    "outcome": None,
    "outcome_recorded_at": None,
    "created_at": datetime.now(timezone.utc)
}
    collection = database["ai_insights"]

    result = await collection.insert_one(insight_data)

    return str(result.inserted_id)


async def get_user_ai_insights(user_id: str):
    collection = database["ai_insights"]

    cursor = collection.find({
        "user_id": user_id
    })

    return await cursor.to_list(length=None)


async def get_ai_insight(
    insight_id: str,
    user_id: str
):
    collection = database["ai_insights"]

    try:
        object_id = ObjectId(insight_id)
    except InvalidId:
        return None

    insight = await collection.find_one({
        "_id": object_id,
        "user_id": user_id
    })

    return insight

async def record_ai_insight_outcome(
    insight_id: str,
    user_id: str,
    outcome: str
):
    collection = database["ai_insights"]

    try:
        object_id = ObjectId(insight_id)
    except InvalidId:
        return None

    result = await collection.update_one(
        {
            "_id": object_id,
            "user_id": user_id
        },
        {
            "$set": {
                "outcome": outcome,
                "outcome_recorded_at": datetime.now(timezone.utc)
            }
        }
    )

    if result.modified_count == 0:
        return None

    return await get_ai_insight(
        insight_id=insight_id,
        user_id=user_id
    )