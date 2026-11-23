import asyncio

from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from googleapiclient.http import MediaIoBaseUpload

from Publishing.base import (
    PublishRequest,
    PublishResult,
    PublishingError
)
from Services.platform_credentials import get_valid_google_credentials


class YouTubePublisher:
    async def publish_post(
        self,
        *,
        user_id: str,
        platform_id: str,
        post: PublishRequest
    ) -> PublishResult:
        if post.post_type != "video":
            raise PublishingError(
                501,
                "YouTube publishing is currently available for video posts only."
            )

        if post.video_file is None or post.content_type is None:
            raise PublishingError(
                422,
                "Choose a video to upload."
            )

        credentials = await get_valid_google_credentials(
            user_id=user_id,
            platform_id=platform_id
        )

        if credentials is None:
            raise PublishingError(
                403,
                "Reconnect YouTube and grant Aflit permission to upload videos."
            )

        youtube = build(
            "youtube",
            "v3",
            credentials=credentials
        )
        media = MediaIoBaseUpload(
            post.video_file,
            mimetype=post.content_type,
            chunksize=8 * 1024 * 1024,
            resumable=True
        )

        request = youtube.videos().insert(
            part="snippet,status",
            body={
                "snippet": {
                    "title": post.title,
                    "description": post.description,
                    "tags": post.tags,
                    "categoryId": "22"
                },
                "status": {
                    "privacyStatus": post.privacy_status
                }
            },
            media_body=media
        )

        try:
            response = await asyncio.to_thread(request.execute)
        except HttpError as error:
            if error.resp.status in (401, 403):
                raise PublishingError(
                    403,
                    "YouTube declined the upload. Reconnect YouTube and verify that upload access is approved for your account."
                ) from error

            raise PublishingError(
                502,
                "YouTube could not publish this video. Please try again."
            ) from error

        content_id = response.get("id")
        if not content_id:
            raise PublishingError(
                502,
                "YouTube did not confirm that the video was published."
            )

        return PublishResult(
            platform="youtube",
            content_id=content_id,
            url=f"https://www.youtube.com/watch?v={content_id}",
            title=post.title
        )
