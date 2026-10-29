from datetime import datetime
from enum import Enum

from pydantic import BaseModel


class PlatformStatus(str, Enum):
    CONNECTED = "connected"
    EXPIRED = "expired"
    DISCONNECTED = "disconnected"
    ERROR = "error"


class PlatformCredentials(BaseModel):
    platform_name: str
    platform_id: str
    external_account_id: str | None = None
    access_token: str | None = None
    refresh_token: str | None = None
    token_expires_at: datetime | None = None


class PlatformResponse(BaseModel):
    platform_id: str
    platform_name: str
    status: PlatformStatus