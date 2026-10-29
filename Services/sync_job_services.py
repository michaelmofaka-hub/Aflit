from datetime import datetime, timezone

from bson import ObjectId
from bson.errors import InvalidId

from database.database import database


async def get_user_platform(
    platform_id: str,
    user_id: str
):
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


async def create_sync_job(
    user_id: str,
    platform_id: str,
    platform: str
):
    platform_data = await get_user_platform(
        platform_id=platform_id,
        user_id=user_id
    )

    if platform_data is None:
        return None

    sync_job = {
        "user_id": user_id,
        "platform_id": platform_id,
        "platform": platform_data["platform"],
        "status": "pending",
        "retry_count": 0,
        "started_at": None,
        "completed_at": None,
        "error": None,
        "created_at": datetime.now(timezone.utc)
    }

    collection = database["sync_jobs"]

    result = await collection.insert_one(sync_job)

    return str(result.inserted_id)


async def get_pending_sync_job():
    collection = database["sync_jobs"]

    job = await collection.find_one({
        "status": "pending"
    })

    return job


async def start_sync_job(
    sync_job_id: str,
    user_id: str
):
    collection = database["sync_jobs"]

    try:
        object_id = ObjectId(sync_job_id)
    except InvalidId:
        return None

    result = await collection.update_one(
        {
            "_id": object_id,
            "user_id": user_id,
            "status": "pending"
        },
        {
            "$set": {
                "status": "running",
                "started_at": datetime.now(timezone.utc)
            }
        }
    )

    if result.modified_count == 0:
        return None

    return await get_sync_job(
        sync_job_id=sync_job_id,
        user_id=user_id
    )


async def complete_sync_job(
    sync_job_id: str,
    user_id: str
):
    collection = database["sync_jobs"]

    try:
        object_id = ObjectId(sync_job_id)
    except InvalidId:
        return None

    result = await collection.update_one(
        {
            "_id": object_id,
            "user_id": user_id,
            "status": "running"
        },
        {
            "$set": {
                "status": "completed",
                "completed_at": datetime.now(timezone.utc)
            }
        }
    )

    if result.modified_count == 0:
        return None

    return await get_sync_job(
        sync_job_id=sync_job_id,
        user_id=user_id
    )


async def fail_sync_job(
    sync_job_id: str,
    user_id: str,
    error: str
):
    collection = database["sync_jobs"]

    try:
        object_id = ObjectId(sync_job_id)
    except InvalidId:
        return None

    result = await collection.update_one(
        {
            "_id": object_id,
            "user_id": user_id,
            "status": "running"
        },
        {
            "$set": {
                "status": "failed",
                "error": error
            }
        }
    )

    if result.modified_count == 0:
        return None

    return await get_sync_job(
        sync_job_id=sync_job_id,
        user_id=user_id
    )


async def retry_sync_job(
    sync_job_id: str,
    user_id: str
):
    collection = database["sync_jobs"]

    try:
        object_id = ObjectId(sync_job_id)
    except InvalidId:
        return None

    result = await collection.update_one(
        {
            "_id": object_id,
            "user_id": user_id,
            "status": "failed",
            "retry_count": {
                "$lt": 2
            }
        },
        {
            "$set": {
                "status": "pending",
                "started_at": None,
                "completed_at": None,
                "error": None
            },
            "$inc": {
                "retry_count": 1
            }
        }
    )

    if result.modified_count == 0:
        return None

    return await get_sync_job(
        sync_job_id=sync_job_id,
        user_id=user_id
    )


async def get_user_sync_jobs(
    user_id: str
):
    collection = database["sync_jobs"]

    cursor = collection.find({
        "user_id": user_id
    })

    return await cursor.to_list(length=None)


async def get_sync_job(
    sync_job_id: str,
    user_id: str
):
    collection = database["sync_jobs"]

    try:
        object_id = ObjectId(sync_job_id)
    except InvalidId:
        return None

    sync_job = await collection.find_one({
        "_id": object_id,
        "user_id": user_id
    })

    return sync_job


async def delete_sync_job(
    sync_job_id: str,
    user_id: str
):
    collection = database["sync_jobs"]

    try:
        object_id = ObjectId(sync_job_id)
    except InvalidId:
        return None

    result = await collection.delete_one({
        "_id": object_id,
        "user_id": user_id
    })

    if result.deleted_count == 0:
        return None

    return True