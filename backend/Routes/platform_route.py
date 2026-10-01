from fastapi import APIRouter, Depends, HTTPException

from Schema.platforms import PlatformCredentials, PlatformResponse

from Services.platform_services import (
    connect_platform,
    get_user_platforms,
    get_platform,
    delete_platform
)

from Routes.users import get_current_user


router = APIRouter(
    tags=["Platforms"]
)


@router.post("/connect")
async def connect(
    credentials: PlatformCredentials,
    current_user: dict = Depends(get_current_user)
):
    user_id = str(current_user["_id"])

    platform_id = await connect_platform(
    user_id=current_user["user_id"],
    platform=data.platform_name,
    platform_id=data.platform_id,
    external_account_id=data.external_account_id,
    access_token=data.access_token,
    refresh_token=data.refresh_token,
    token_expires_at=data.token_expires_at
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