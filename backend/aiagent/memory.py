
from datetime import datetime, timezone

from bson import ObjectId

from database.database import database


# --------------------------------------------------
# SHORT-TERM MEMORY: CONVERSATIONS
# --------------------------------------------------

async def create_conversation(user_id: str):
    collection = database["ai_conversations"]

    conversation = {
        "user_id": user_id,
        "messages": [],
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc)
    }

    result = await collection.insert_one(conversation)

    return str(result.inserted_id)


async def get_conversation(
    conversation_id: str,
    user_id: str
):
    collection = database["ai_conversations"]

    try:
        object_id = ObjectId(conversation_id)
    except Exception:
        return None

    return await collection.find_one({
        "_id": object_id,
        "user_id": user_id
    })


async def save_message(
    conversation_id: str,
    user_id: str,
    role: str,
    content: str
):
    if role not in {"user", "assistant"}:
        raise ValueError("Invalid message role")

    collection = database["ai_conversations"]

    try:
        object_id = ObjectId(conversation_id)
    except Exception:
        return False

    result = await collection.update_one(
        {
            "_id": object_id,
            "user_id": user_id
        },
        {
            "$push": {
                "messages": {
                    "role": role,
                    "content": content,
                    "created_at": datetime.now(timezone.utc)
                }
            },
            "$set": {
                "updated_at": datetime.now(timezone.utc)
            }
        }
    )

    return result.modified_count > 0


async def get_conversation_history(
    conversation_id: str,
    user_id: str,
    limit: int = 20
):
    conversation = await get_conversation(
        conversation_id,
        user_id
    )

    if conversation is None:
        return []

    messages = conversation.get("messages", [])

    return [
        {
            "role": message["role"],
            "content": message["content"]
        }
        for message in messages[-limit:]
    ]


# --------------------------------------------------
# LONG-TERM MEMORY: CREATOR FACTS
# --------------------------------------------------

async def save_memory(
    user_id: str,
    category: str,
    content: str
):
    collection = database["ai_memories"]

    memory = {
        "user_id": user_id,
        "category": category,
        "content": content,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc)
    }

    result = await collection.insert_one(memory)

    return str(result.inserted_id)


async def get_user_memories(
    user_id: str,
    limit: int = 50
):
    collection = database["ai_memories"]

    cursor = collection.find({
        "user_id": user_id
    }).sort("updated_at", -1)

    memories = await cursor.to_list(length=limit)

    return [
        {
            "memory_id": str(memory["_id"]),
            "category": memory["category"],
            "content": memory["content"]
        }
        for memory in memories
    ]


async def delete_memory(
    memory_id: str,
    user_id: str
):
    collection = database["ai_memories"]

    try:
        object_id = ObjectId(memory_id)
    except Exception:
        return False

    result = await collection.delete_one({
        "_id": object_id,
        "user_id": user_id
    })

    return result.deleted_count > 0
