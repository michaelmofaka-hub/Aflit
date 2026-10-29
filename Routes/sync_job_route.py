from fastapi import APIRouter, Depends, HTTPException

from Schema.sync_jobs import SyncJobCreate, SyncJobResponse

from Services.sync_job_services import (
    create_sync_job,
    get_user_sync_jobs,
    get_sync_job,
    delete_sync_job,
    start_sync_job,
    complete_sync_job,
    fail_sync_job,
    retry_sync_job
)

from Routes.users import get_current_user


router = APIRouter(
    tags=["Sync Jobs"]
)


@router.post("", response_model=SyncJobResponse)
async def create(
    sync_job: SyncJobCreate,
    current_user: dict = Depends(get_current_user)
):
    user_id = str(current_user["_id"])

    sync_job_id = await create_sync_job(
        user_id=user_id,
        platform_id=sync_job.platform_id,
        platform=sync_job.platform
      )
    if sync_job_id is None:
      raise HTTPException(
          status_code=404,
          detail="Platform connection not found"
      )

    created_job = await get_sync_job(
        sync_job_id=sync_job_id,
        user_id=user_id
    )

    return {
        "sync_job_id": str(created_job["_id"]),
        "platform_id": created_job["platform_id"],
        "platform": created_job["platform"],
        "status": created_job["status"],
        "retry_count": created_job["retry_count"],
        "started_at": created_job["started_at"],
        "completed_at": created_job["completed_at"],
        "error": created_job["error"],
        "created_at": created_job["created_at"]
    }

@router.post("/{sync_job_id}/start", response_model=SyncJobResponse)
async def start(
    sync_job_id: str,
    current_user: dict = Depends(get_current_user)
):
    user_id = str(current_user["_id"])

    sync_job = await start_sync_job(
        sync_job_id=sync_job_id,
        user_id=user_id
    )

    if sync_job is None:
        raise HTTPException(
            status_code=404,
            detail="Sync job cannot be started"
        )

    return {
        "sync_job_id": str(sync_job["_id"]),
        "platform_id": sync_job["platform_id"],
        "platform": sync_job["platform"],
        "status": sync_job["status"],
        "retry_count": sync_job["retry_count"],
        "started_at": sync_job["started_at"],
        "completed_at": sync_job["completed_at"],
        "error": sync_job["error"],
        "created_at": sync_job["created_at"]
    }

@router.post(
    "/{sync_job_id}/complete",
    response_model=SyncJobResponse
)
async def complete(
    sync_job_id: str,
    current_user: dict = Depends(get_current_user)
):
    user_id = str(current_user["_id"])

    sync_job = await complete_sync_job(
        sync_job_id=sync_job_id,
        user_id=user_id
    )

    if sync_job is None:
        raise HTTPException(
            status_code=404,
            detail="Sync job cannot be completed"
        )

    return {
        "sync_job_id": str(sync_job["_id"]),
        "platform_id": sync_job["platform_id"],
        "platform": sync_job["platform"],
        "status": sync_job["status"],
        "retry_count": sync_job["retry_count"],
        "started_at": sync_job["started_at"],
        "completed_at": sync_job["completed_at"],
        "error": sync_job["error"],
        "created_at": sync_job["created_at"]
    }

@router.post(
    "/{sync_job_id}/fail",
    response_model=SyncJobResponse
)
async def fail(
    sync_job_id: str,
    error: str,
    current_user: dict = Depends(get_current_user)
):
    user_id = str(current_user["_id"])

    sync_job = await fail_sync_job(
        sync_job_id=sync_job_id,
        user_id=user_id,
        error=error
    )

    if sync_job is None:
        raise HTTPException(
            status_code=404,
            detail="Sync job cannot be failed"
        )

    return {
        "sync_job_id": str(sync_job["_id"]),
        "platform_id": sync_job["platform_id"],
        "platform": sync_job["platform"],
        "status": sync_job["status"],
        "retry_count": sync_job["retry_count"],
        "started_at": sync_job["started_at"],
        "completed_at": sync_job["completed_at"],
        "error": sync_job["error"],
        "created_at": sync_job["created_at"]
    }

@router.post(
    "/{sync_job_id}/retry",
    response_model=SyncJobResponse
)
async def retry(
    sync_job_id: str,
    current_user: dict = Depends(get_current_user)
):
    user_id = str(current_user["_id"])

    sync_job = await retry_sync_job(
        sync_job_id=sync_job_id,
        user_id=user_id
    )

    if sync_job is None:
        raise HTTPException(
            status_code=400,
            detail="Sync job cannot be retried"
        )

    return {
        "sync_job_id": str(sync_job["_id"]),
        "platform_id": sync_job["platform_id"],
        "platform": sync_job["platform"],
        "status": sync_job["status"],
        "retry_count": sync_job["retry_count"],
        "started_at": sync_job["started_at"],
        "completed_at": sync_job["completed_at"],
        "error": sync_job["error"],
        "created_at": sync_job["created_at"]
    } 
  
@router.get("", response_model=list[SyncJobResponse])
async def get_all(
    current_user: dict = Depends(get_current_user)
):
    user_id = str(current_user["_id"])

    sync_jobs = await get_user_sync_jobs(user_id)

    return [
        {
            "sync_job_id": str(job["_id"]),
            "platform_id": job["platform_id"],
            "platform": job["platform"],
            "status": job["status"],
            "retry_count": job["retry_count"],
            "started_at": job["started_at"],
            "completed_at": job["completed_at"],
            "error": job["error"],
            "created_at": job["created_at"]
        }
        for job in sync_jobs
    ]


@router.get("/{sync_job_id}", response_model=SyncJobResponse)
async def get_one(
    sync_job_id: str,
    current_user: dict = Depends(get_current_user)
):
    user_id = str(current_user["_id"])

    sync_job = await get_sync_job(
        sync_job_id=sync_job_id,
        user_id=user_id
    )

    if sync_job is None:
        raise HTTPException(
            status_code=404,
            detail="Sync job not found"
        )

    return {
        "sync_job_id": str(sync_job["_id"]),
        "platform_id": sync_job["platform_id"],
        "platform": sync_job["platform"],
        "status": sync_job["status"],
        "retry_count": sync_job["retry_count"],
        "started_at": sync_job["started_at"],
        "completed_at": sync_job["completed_at"],
        "error": sync_job["error"],
        "created_at": sync_job["created_at"]
    }


@router.delete("/{sync_job_id}")
async def delete(
    sync_job_id: str,
    current_user: dict = Depends(get_current_user)
):
    user_id = str(current_user["_id"])

    deleted = await delete_sync_job(
        sync_job_id=sync_job_id,
        user_id=user_id
    )

    if deleted is None:
        raise HTTPException(
            status_code=404,
            detail="Sync job not found"
        )

    return {
        "message": "Sync job deleted"
    }