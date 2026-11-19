from datetime import datetime

from pydantic import BaseModel


class ContentCreate(BaseModel):
    platform_id: str
    platform: str
    external_content_id: str
    title: str
    description: str | None = None
    published_at: datetime


class ContentResponse(BaseModel):
    content_id: str
    platform_id: str
    platform: str
    external_content_id: str
    title: str
    description: str | None
    published_at: datetime
    created_at: datetime