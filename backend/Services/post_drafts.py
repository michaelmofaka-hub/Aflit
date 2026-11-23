from bson import ObjectId
from bson.errors import InvalidId

from database.database import database


async def create_post_draft(user_id: str, draft: dict):
    result = await database["post_drafts"].insert_one({
        **draft,
        "user_id": user_id,
        "status": "draft"
    })

    return str(result.inserted_id)


async def get_user_post_drafts(user_id: str):
    cursor = database["post_drafts"].find(
        {"user_id": user_id}
    ).sort("created_at", -1)

    return await cursor.to_list(length=100)


async def delete_post_draft(user_id: str, draft_id: str):
    try:
        object_id = ObjectId(draft_id)
    except InvalidId:
        return False

    result = await database["post_drafts"].delete_one({
        "_id": object_id,
        "user_id": user_id
    })

    return result.deleted_count > 0
