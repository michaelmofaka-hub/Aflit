
import logging
import os
import secrets

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
    delete_platform,
    update_youtube_connection
)

from Routes.users import get_current_user


router = APIRouter(tags=["Platforms"])


# --------------------------------------------------
# CONNECT A PLATFORM
# --------------------------------------------------

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


# --------------------------------------------------
# GET ALL USER PLATFORMS
# --------------------------------------------------

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
            "status": platform["status"],
            "account_name": platform.get("account_name"),
            "external_account_id": platform.get("external_account_id")
        }
        for platform in platforms
    ]


# --------------------------------------------------
# GET ONE PLATFORM
# --------------------------------------------------

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
        "status": platform["status"],
        "account_name": platform.get("account_name"),
        "external_account_id": platform.get("external_account_id")
    }


# --------------------------------------------------
# DISCONNECT A PLATFORM
# --------------------------------------------------

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

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Platform connection not found"
        )

    return {
        "message": "Platform disconnected"
    }


# --------------------------------------------------
# START YOUTUBE OAUTH
# --------------------------------------------------

@router.get("/youtube/connect")
async def connect_youtube(
    current_user: dict = Depends(get_current_user)
):
    user_id = str(current_user["_id"])

    state = secrets.token_urlsafe(32)

    flow = create_google_flow()

    authorization_url, _ = flow.authorization_url(
        state=state,
        access_type="offline",
        include_granted_scopes="true",
        prompt="consent"
    )

    code_verifier = flow.code_verifier

    create_oauth_state(
        state,
        user_id,
        code_verifier
    )

    return {
        "authorization_url": authorization_url
    }


# --------------------------------------------------
# YOUTUBE OAUTH CALLBACK
# --------------------------------------------------


@router.get("/youtube/callback")
async def youtube_callback(
    code: str = Query(...),
    state: str = Query(...)
):
    # 1. Validate OAuth state
    oauth_data = get_user_from_oauth_state(state)

    if oauth_data is None:
        raise HTTPException(
            status_code=400,
            detail="Invalid or expired OAuth state"
        )

    user_id = oauth_data["user_id"]
    code_verifier = oauth_data["code_verifier"]

    # 2. Remove used state
    delete_oauth_state(state)

    # 3. Recreate the OAuth flow using the original PKCE verifier
    flow = create_google_flow(
        code_verifier=code_verifier
    )

    # 4. Exchange authorization code for tokens
    try:
        flow.oauth2session.scope = None
        flow.fetch_token(code=code)

    except Exception:
        logging.exception(
            "YouTube OAuth token exchange failed"
        )

        raise HTTPException(
            status_code=400,
            detail="Failed to exchange authorization code"
        )

    # 5. Verify Google granted YouTube read permission
    granted_scope = flow.oauth2session.token.get(
    "scope", []
)

    if isinstance(granted_scope, str):
        granted_scopes = set(granted_scope.split())
    elif isinstance(granted_scope, (list, tuple, set)):
        granted_scopes = set(granted_scope)
    else:
        granted_scopes = set()

    required_scope = "https://www.googleapis.com/auth/youtube.upload"

    if required_scope not in granted_scopes:
        raise HTTPException(
            status_code=403,
            detail="Google did not grant YouTube upload access"
        )

    # 6. Build YouTube API client
    youtube = build(
        "youtube",
        "v3",
        credentials=flow.credentials
    )

    # 7. Retrieve YouTube channel
    try:
        channel_response = youtube.channels().list(
            part="snippet,contentDetails,statistics",
            mine=True
        ).execute()

    except Exception:
        logging.exception(
            "YouTube channel retrieval failed"
        )

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

    # 8. Save connected YouTube account
    platform_id = await connect_platform(
        user_id=user_id,
        platform="youtube",
        platform_id="youtube",
        external_account_id=channel_id,
        account_name=channel_title,
        uploads_playlist_id=uploads_playlist_id,
        access_token=flow.credentials.token,
        refresh_token=flow.credentials.refresh_token,
        token_expires_at=flow.credentials.expiry
    )

    if platform_id is None:
        reconnected = await update_youtube_connection(
            user_id=user_id,
            external_account_id=channel_id,
            account_name=channel_title,
            uploads_playlist_id=uploads_playlist_id,
            access_token=flow.credentials.token,
            refresh_token=flow.credentials.refresh_token,
            token_expires_at=flow.credentials.expiry
        )

        if not reconnected:
            raise HTTPException(
                status_code=409,
                detail="YouTube is already connected to another account."
            )
        platform_id = reconnected

    logging.info(
        "YouTube connected successfully: user_id=%s, platform_id=%s",
        user_id,
        platform_id
    )

    # 9. Redirect user to frontend
    environment = os.getenv(
        "ENVIRONMENT",
        "development"
    ).lower()

    urls = {
        "production": "https://aflit.vercel.app/?youtube_connected=1",
        "development": "http://localhost:5173/?youtube_connected=1"
    }

    return RedirectResponse(
        url=urls.get(
            environment,
            urls["development"]
        )
    )
