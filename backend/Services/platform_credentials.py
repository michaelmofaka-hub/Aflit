from bson import ObjectId
from bson.errors import InvalidId

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials

from Config.settings import settings
from database.database import database


YOUTUBE_SCOPES = [
    "https://www.googleapis.com/auth/youtube.readonly"
]


async def get_platform_credentials(
    user_id: str,
    platform_id: str
):
    collection = database["platform"]

    try:
        object_id = ObjectId(platform_id)
    except InvalidId:
        return None

    platform = await collection.find_one({
        "_id": object_id,
        "user_id": user_id,
        "platform": "youtube",
        "status": "connected"
    })

    if platform is None:
        return None

    return {
        "access_token": platform.get("access_token"),
        "refresh_token": platform.get("refresh_token"),
        "token_expires_at": platform.get("token_expires_at")
    }


def create_google_credentials(token_data: dict):
    if token_data is None:
        return None

    access_token = token_data.get("access_token")

    if not access_token:
        return None

    return Credentials(
        token=access_token,
        refresh_token=token_data.get("refresh_token"),
        token_uri="https://oauth2.googleapis.com/token",
        client_id=settings.google_client_id,
        client_secret=settings.google_client_secret,
        scopes=YOUTUBE_SCOPES
    )


async def get_google_credentials(
    user_id: str,
    platform_id: str
):
    token_data = await get_platform_credentials(
        user_id=user_id,
        platform_id=platform_id
    )

    if token_data is None:
        return None

    return create_google_credentials(token_data)


def refresh_google_credentials(credentials):
    if credentials is None:
        return None

    if credentials.valid:
        return credentials

    if not credentials.expired:
        return None

    if not credentials.refresh_token:
        return None

    credentials.refresh(Request())

    return credentials


async def update_access_token(
    user_id: str,
    platform_id: str,
    access_token: str,
    token_expires_at=None
):
    if not access_token:
        return False

    collection = database["platform"]

    try:
        object_id = ObjectId(platform_id)
    except InvalidId:
        return False

    update_data = {
        "access_token": access_token
    }

    if token_expires_at is not None:
        update_data["token_expires_at"] = token_expires_at

    result = await collection.update_one(
        {
            "_id": object_id,
            "user_id": user_id,
            "platform": "youtube"
        },
        {
            "$set": update_data
        }
    )

    return result.modified_count > 0


async def get_valid_google_credentials(
    user_id: str,
    platform_id: str
):
    credentials = await get_google_credentials(
        user_id=user_id,
        platform_id=platform_id
    )

    if credentials is None:
        return None

    if credentials.valid:
        return credentials

    was_expired = credentials.expired

    if not was_expired:
        return None

    credentials = refresh_google_credentials(credentials)

    if credentials is None:
        return None

    if credentials.token is None:
        return None

    await update_access_token(
        user_id=user_id,
        platform_id=platform_id,
        access_token=credentials.token,
        token_expires_at=credentials.expiry
    )

    return credentials