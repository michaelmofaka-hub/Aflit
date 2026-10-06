from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import RedirectResponse

from googleapiclient.discovery import build

from OAuth.google import (
    create_google_flow,
    create_oauth_state,
    get_user_from_oauth_state,
    delete_oauth_state
)

from Schema.platforms import (
    PlatformCredentials,
    PlatformResponse
)

from Services.platform_services import (
    connect_platform,
    get_user_platforms,
    get_platform,
    delete_platform
)

from Routes.users import get_current_user


router = APIRouter(tags=["Platforms"])


@router.post("/connect")
async def connect(
    credentials: PlatformCredentials,
    current_user: dict = Depends(get_current_user)
):
    user_id = str(current_user["_id"])

    platform_id = await connect_platform(
        user_id=user_id,
        platform=credentials.platform_name,
        platform_id=credentials.platform_id,
        external_account_id=credentials.external_account_id,
        access_token=credentials.access_token,
        refresh_token=credentials.refresh_token,
        token_expires_at=credentials.token_expires_at
    )

    if platform_id is None:
        raise HTTPException(
            status_code=409,
            detail=f"{credentials.platform_name} is already connected"
        )

    return {
        "message": "Platform connected",
        "platform_id": platform_id
    }


@router.get("", response_model=list[PlatformResponse])
async def get_platforms(
    current_user: dict = Depends(get_current_user)
):
    user_id = str(current_user["_id"])

    platforms = await get_user_platforms(user_id)

    return [
        {
            "platform_id": str(platform["_id"]),
            "platform_name": platform["platform"],
            "status": platform["status"]
        }
        for platform in platforms
    ]


@router.get("/{platform_id}", response_model=PlatformResponse)
async def get_one_platform(
    platform_id: str,
    current_user: dict = Depends(get_current_user)
):
    user_id = str(current_user["_id"])

    platform = await get_platform(
        platform_id=platform_id,
        user_id=user_id
    )

    if platform is None:
        raise HTTPException(
            status_code=404,
            detail="Platform connection not found"
        )

    return {
        "platform_id": str(platform["_id"]),
        "platform_name": platform["platform"],
        "status": platform["status"]
    }


@router.delete("/{platform_id}")
async def disconnect_platform(
    platform_id: str,
    current_user: dict = Depends(get_current_user)
):
    user_id = str(current_user["_id"])

    deleted = await delete_platform(
        platform_id=platform_id,
        user_id=user_id
    )

    if deleted is None:
        raise HTTPException(
            status_code=404,
            detail="Platform connection not found"
        )

    return {
        "message": "Platform disconnected"
    }


@router.get("/youtube/connect")
async def connect_youtube(
    current_user: dict = Depends(get_current_user)
):
    user_id = str(current_user["_id"])

    state = create_oauth_state(user_id)

    flow = create_google_flow()

    authorization_url, _ = flow.authorization_url(
        state=state,
        access_type="offline",
        include_granted_scopes="true",
        prompt="consent"
    )

    return RedirectResponse(
        url=authorization_url
    )


@router.get("/youtube/callback")
async def youtube_callback(
    code: str = Query(...),
    state: str = Query(...)
):
    user_id = get_user_from_oauth_state(state)

    if user_id is None:
        raise HTTPException(
            status_code=400,
            detail="Invalid or expired OAuth state"
        )

    delete_oauth_state(state)

    flow = create_google_flow()

    try:
        flow.fetch_token(code=code)
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Failed to exchange authorization code"
        )

    youtube = build(
        "youtube",
        "v3",
        credentials=flow.credentials
    )

    try:
        channel_response = youtube.channels().list(
            part="snippet,contentDetails,statistics",
            mine=True
        ).execute()
    except Exception:
        raise HTTPException(
            status_code=502,
            detail="Failed to retrieve YouTube channel"
        )

    if not channel_response.get("items"):
        raise HTTPException(
            status_code=404,
            detail="No YouTube channel found"
        )

    channel = channel_response["items"][0]

    channel_id = channel["id"]
    channel_title = channel["snippet"]["title"]

    uploads_playlist_id = (
        channel["contentDetails"]
        ["relatedPlaylists"]
        ["uploads"]
    )

    platform_id = await connect_platform(
        user_id=user_id,
        platform="youtube",
        platform_id="youtube",
        external_account_id=channel_id,
        access_token=flow.credentials.token,
        refresh_token=flow.credentials.refresh_token,
        token_expires_at=flow.credentials.expiry
    )

    if platform_id is None:
        raise HTTPException(
            status_code=409,
            detail="YouTube is already connected"
        )

    return {
        "message": "YouTube connected successfully",
        "platform_id": platform_id,
        "channel_id": channel_id,
        "channel_title": channel_title,
        "uploads_playlist_id": uploads_playlist_id
    }