
from datetime import datetime, timezone

from bson import ObjectId

from Services.analytic_services import get_user_analytics
from Services.audience_services import get_audience_history
from Services.content_services import get_user_content
from Services.platform_services import (
    get_user_platforms,
    get_user_youtube
)


def make_json_safe(value):
    """
    Convert MongoDB and Python values into
    values that can safely be serialized as JSON.

    Also prevents sensitive credentials from
    entering the AI context.
    """

    sensitive_fields = {
        "access_token",
        "refresh_token",
        "password",
        "secret",
        "authorization",
        "api_key"
    }

    if isinstance(value, dict):
        return {
            key: make_json_safe(item)
            for key, item in value.items()
            if key.lower() not in sensitive_fields
        }

    if isinstance(value, list):
        return [make_json_safe(item) for item in value]

    if isinstance(value, ObjectId):
        return str(value)

    if isinstance(value, datetime):
        return value.isoformat()

    return value


async def build_creator_context(
    user_id: str,
    username: str | None = None
) -> dict:

    # 1. Retrieve connected platforms.
    platforms = await get_user_platforms(user_id)

    safe_platforms = [
        {
            "platform": platform.get("platform"),
            "account_name": platform.get("account_name"),
            "status": platform.get("status")
        }
        for platform in platforms
    ]

    # 2. Retrieve creator analytics.
    analytics = await get_user_analytics(user_id)

    analytics.sort(
        key=lambda item: item.get("recorded_at")
        or datetime.min.replace(tzinfo=timezone.utc),
        reverse=True
    )

    recent_analytics = analytics[:30]

    safe_analytics = [
        {
            "platform": item.get("platform"),
            "metrics": make_json_safe(
                item.get("metrics", {})
            ),
            "recorded_at": make_json_safe(
                item.get("recorded_at")
            )
        }
        for item in recent_analytics
    ]

    # 3. Retrieve creator content.
    content = await get_user_content(user_id)

    content.sort(
        key=lambda item: item.get("published_at")
        or datetime.min.replace(tzinfo=timezone.utc),
        reverse=True
    )

    recent_content = content[:20]

    safe_content = [
        {
            "platform": item.get("platform"),
            "title": item.get("title"),
            "description": (
                (item.get("description") or "")[:500]
            ),
            "published_at": make_json_safe(
                item.get("published_at")
            )
        }
        for item in recent_content
    ]

    # 4. Retrieve YouTube audience history.
    youtube_account = await get_user_youtube(user_id)

    audience_history = []

    if youtube_account is not None:

        audience_history = await get_audience_history(
            user_id=user_id,
            platform_id=str(youtube_account["_id"])
        )

    recent_audience = audience_history[-30:]

    safe_audience = [
        {
            "subscribers": item.get("subscribers"),
            "total_views": item.get("total_views"),
            "video_count": item.get("video_count"),
            "recorded_at": make_json_safe(
                item.get("recorded_at")
            )
        }
        for item in recent_audience
    ]

    # 5. Assemble the creator's context.
    context = {
        "creator": {
            "username": username
        },

        "connected_platforms": safe_platforms,

        "analytics": {
            "total_records_available": len(analytics),
            "recent_records": safe_analytics
        },

        "content": {
            "total_items_available": len(content),
            "recent_items": safe_content
        },

        "audience": {
            "youtube_history": safe_audience
        },

        "context_generated_at": datetime.now(
            timezone.utc
        ).isoformat()
    }

    return context
