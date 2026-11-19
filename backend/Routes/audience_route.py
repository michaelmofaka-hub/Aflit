
from fastapi import APIRouter, Depends, HTTPException

from Routes.users import get_current_user
from Services.platform_services import get_user_youtube
from Services.audience_services import get_audience_history

router = APIRouter(tags=["Audience"])


@router.get("/youtube/history")
async def youtube_audience_history(
    current_user: dict = Depends(get_current_user)
):
    user_id = str(current_user["_id"])

    youtube_account = await get_user_youtube(user_id)

    if youtube_account is None:
        raise HTTPException(
            status_code=404,
            detail="YouTube account not connected"
        )

    platform_id = str(youtube_account["_id"])

    history = await get_audience_history(
        user_id=user_id,
        platform_id=platform_id
    )

    return [
        {
            "snapshot_id": str(item["_id"]),
            "channel_id": item["channel_id"],
            "subscribers": item["subscribers"],
            "total_views": item["total_views"],
            "video_count": item["video_count"],
            "recorded_at": item["recorded_at"]
        }
        for item in history
    ]
