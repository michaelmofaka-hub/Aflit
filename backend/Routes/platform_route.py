from fastapi import APIRouter, Depends

from Schema.platforms import platform_credentials
from Services.platform_services import connect_platform
from Routes.users import get_current_user


router = APIRouter(
    prefix="/platforms",
    tags=["Platforms"]
)


@router.post("/connect")
async def connect(
    credentials: platform_credentials,
    current_user: dict = Depends(get_current_user)
):
    user_id = str(current_user["_id"])

    platform_id = await connect_platform(
        user_id=user_id,
        platform=credentials.platform_name,
        platform_id=credentials.platform_id
    )

    return {
        "message": "Platform connected",
        "platform_id": platform_id
    }