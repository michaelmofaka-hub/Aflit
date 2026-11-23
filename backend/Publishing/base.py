from dataclasses import dataclass
from typing import BinaryIO, Protocol


@dataclass
class PublishResult:
    platform: str
    content_id: str
    url: str
    title: str


@dataclass
class PublishRequest:
    post_type: str
    title: str
    description: str
    tags: list[str]
    privacy_status: str
    video_file: BinaryIO | None
    content_type: str | None
    media_url: str | None
    link_url: str | None


class PublishingError(Exception):
    def __init__(self, status_code: int, detail: str):
        super().__init__(detail)
        self.status_code = status_code
        self.detail = detail


class PlatformPublisher(Protocol):
    async def publish_post(
        self,
        *,
        user_id: str,
        platform_id: str,
        post: PublishRequest
    ) -> PublishResult:
        ...
