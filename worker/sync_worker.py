import asyncio

from Services.sync_job_services import (
    get_pending_sync_job,
    start_sync_job,
    complete_sync_job,
    fail_sync_job
)
from Services.platform_credentials import get_valid_google_credentials
from Services.youtube_sync_service import sync_youtube


async def sync_worker():
    print("SYNC WORKER STARTED")

    while True:
        try:
            job = await get_pending_sync_job()

            if job is None:
                await asyncio.sleep(5)
                continue

            sync_job_id = str(job["_id"])
            user_id = job["user_id"]

            print(f"SYNC WORKER: Found job {sync_job_id}")

            started_job = await start_sync_job(
                sync_job_id=sync_job_id,
                user_id=user_id
            )

            if started_job is None:
                print("SYNC WORKER: Could not claim job")
                continue

            print(f"SYNC WORKER: Job {sync_job_id} is running")

            try:
                # Temporary simulation of synchronization work
                credentials = await get_valid_google_credentials(
    user_id=user_id,
    platform_id=job["platform_id"]
)

                if credentials is None:
                    raise Exception("Could not load Google credentials")

                result = await sync_youtube(
                    credentials=credentials,
                    user_id=user_id,
                    platform_id=job["platform_id"]
                )
                
                print(
                    f"SYNC WORKER: YouTube sync result: {result}"
                )
                
                if not result["success"]:
                    raise Exception("YouTube sync was unsuccessful")
                
                await complete_sync_job(
                    sync_job_id=sync_job_id,
                    user_id=user_id
                )

                raise Exception("Test Synchronization Failure")

                await complete_sync_job(
                    sync_job_id=sync_job_id,
                    user_id=user_id
                )

                print(f"SYNC WORKER: Job {sync_job_id} completed")

            except Exception as error:
                print(f"SYNC WORKER: Job {sync_job_id} failed: {error}")

                await fail_sync_job(
                    sync_job_id=sync_job_id,
                    user_id=user_id,
                    error=str(error)
                )

        except Exception as error:
            print(f"SYNC WORKER ERROR: {error}")
            await asyncio.sleep(5)