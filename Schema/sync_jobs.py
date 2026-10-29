from datetime import datetime
from enum import Enum

from pydantic import BaseModel


class SyncJobStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


class SyncJobCreate(BaseModel):
    platform_id: str
    platform: str


class SyncJobResponse(BaseModel):
    sync_job_id: str
    platform_id: str
    platform: str
    status: SyncJobStatus
    retry_count: int
    started_at: datetime | None
    completed_at: datetime | None
    error: str | None
    created_at: datetime