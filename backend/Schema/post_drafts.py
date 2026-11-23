from typing import Literal

from pydantic import BaseModel, Field


class PostDraftCreate(BaseModel):
    platform: Literal["youtube", "tiktok", "instagram", "facebook"]
    post_type: Literal["video", "image", "text", "link"]
    title: str = Field(min_length=1, max_length=100)
    caption: str = Field(default="", max_length=5000)
    tags: list[str] = Field(default_factory=list, max_length=30)
    media_url: str | None = Field(default=None, max_length=2048)
    link_url: str | None = Field(default=None, max_length=2048)
