import asyncio

from database.database import database
from Services.sync_job_services import (
get_pending_sync_job,
start_sync_job,
complete_sync_job
)

async def sync_worker():
  while True:
    job = await get_pending_sync_job()

    if job is None:
    await asyncio.sleep(5)
    continue

    sync_job_id = str(job["_id"])
    user_id = job["user_id"]

    started_job = await start_sync_job(
    sync_job_id=sync_job_id,
    user_id=user_id
    )

    if started_job is None:
    continue

    try:
        # actual sync work will go here
        await asyncio.sleep(2)
    
        await complete_sync_job(
            sync_job_id=sync_job_id,
            user_id=user_id
        )
    except Exception as error:
        await fail_sync_job(
            sync_job_id=sync_job_id,
            user_id=user_id,
            error=str(error)
        )