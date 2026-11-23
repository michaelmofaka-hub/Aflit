from typing import Literal
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile

from Publishing.base import (
    PlatformPublisher,
    PublishRequest,
    PublishingError
)
from Publishing.youtube import YouTubePublisher
from Routes.users import get_current_user
from Schema.post_drafts import PostDraftCreate
from Services.post_drafts import (
    create_post_draft,
    delete_post_draft,
    get_user_post_drafts
)


router = APIRouter(tags=["Publishing"])

PUBLISHERS: dict[str, PlatformPublisher] = {
    "youtube": YouTubePublisher()
}

MAX_VIDEO_SIZE = 256 * 1024 * 1024
ALLOWED_VIDEO_TYPES = {
    "video/mp4",
    "video/quicktime",
    "video/webm"
}


@router.post("/drafts")
async def save_draft(
    draft: PostDraftCreate,
    current_user: dict = Depends(get_current_user)
):
    if draft.post_type == "image" and not draft.media_url:
        raise HTTPException(
            status_code=422,
            detail="Add an image URL before saving this draft."
        )

    if draft.post_type == "link" and not draft.link_url:
        raise HTTPException(
            status_code=422,
            detail="Add a link URL before saving this draft."
        )

    if draft.post_type == "text" and not draft.caption.strip():
        raise HTTPException(
            status_code=422,
            detail="Add a caption before saving this text post."
        )

    draft_data = draft.model_dump()
    draft_data["created_at"] = datetime.now(timezone.utc)
    draft_id = await create_post_draft(
        user_id=str(current_user["_id"]),
        draft=draft_data
    )

    return {
        "draft_id": draft_id,
        "status": "draft",
        "created_at": draft_data["created_at"]
    }


@router.get("/drafts")
async def list_drafts(
    current_user: dict = Depends(get_current_user)
):
    drafts = await get_user_post_drafts(str(current_user["_id"]))

    return [
        {
            "draft_id": str(draft["_id"]),
            "platform": draft["platform"],
            "post_type": draft["post_type"],
            "title": draft["title"],
            "caption": draft["caption"],
            "status": draft["status"],
            "created_at": draft["created_at"]
        }
        for draft in drafts
    ]


@router.delete("/drafts/{draft_id}")
async def remove_draft(
    draft_id: str,
    current_user: dict = Depends(get_current_user)
):
    deleted = await delete_post_draft(
        user_id=str(current_user["_id"]),
        draft_id=draft_id
    )

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Draft not found."
        )

    return {"message": "Draft deleted."}


@router.post("/publish")
async def publish_post(
    platform: str = Form(...),
    platform_id: str = Form(...),
    post_type: Literal["video", "image", "text", "link"] = Form(...),
    title: str = Form(..., min_length=1, max_length=100),
    description: str = Form("", max_length=5000),
    tags: str = Form(""),
    privacy_status: Literal["private", "unlisted", "public"] = Form(
        "private"
    ),
    media_url: str | None = Form(None),
    link_url: str | None = Form(None),
    video: UploadFile | None = File(None),
    current_user: dict = Depends(get_current_user)
):
    platform_key = platform.strip().lower()
    publisher = PUBLISHERS.get(platform_key)

    try:
        if publisher is None:
            raise HTTPException(
                status_code=501,
                detail=f"Publishing to {platform} is not available yet."
            )

        if video and video.content_type not in ALLOWED_VIDEO_TYPES:
            raise HTTPException(
                status_code=415,
                detail="Choose an MP4, MOV, or WebM video."
            )

        if video:
            size = 0
            while chunk := await video.read(1024 * 1024):
                size += len(chunk)
                if size > MAX_VIDEO_SIZE:
                    raise HTTPException(
                        status_code=413,
                        detail="Videos must be 256 MB or smaller."
                    )

            await video.seek(0)

        post = PublishRequest(
            post_type=post_type,
            title=title.strip(),
            description=description,
            tags=[
                tag.strip()
                for tag in tags.split(",")
                if tag.strip()
            ][:500],
            privacy_status=privacy_status,
            video_file=video.file if video else None,
            content_type=video.content_type if video else None,
            media_url=media_url,
            link_url=link_url
        )

        result = await publisher.publish_post(
            user_id=str(current_user["_id"]),
            platform_id=platform_id,
            post=post
        )
    except PublishingError as error:
        raise HTTPException(
            status_code=error.status_code,
            detail=error.detail
        ) from error
    finally:
        if video:
            await video.close()

    return {
        "platform": result.platform,
        "content_id": result.content_id,
        "url": result.url,
        "title": result.title
    }
