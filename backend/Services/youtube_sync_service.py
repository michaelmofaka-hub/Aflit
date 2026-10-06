from datetime import datetime, timezone

from Services.youtube_services import (
    get_my_channel,
    get_channel_videos,
    get_video_analytics,
    normalize_video,
    normalize_video_analytics
)

from Services.content_services import create_content
from Services.analytic_services import create_analytics


async def sync_youtube(
    credentials,
    user_id: str,
    platform_id: str
):
    channel = await get_my_channel(credentials)

    if channel is None:
        return {
    "success": True,
    "content_synced": content_synced,
    "analytics_synced": analytics_synced
}

    uploads_playlist_id = (
        channel["contentDetails"]
        ["relatedPlaylists"]
        ["uploads"]
    )

    all_videos = []
    page_token = None

    while True:
        videos_page = await get_channel_videos(
          credentials=credentials,
          uploads_playlist_id=uploads_playlist_id,
          page_token=page_token
      )

        all_videos.extend(videos_page["items"])

        page_token = videos_page["next_page_token"]

        if page_token is None:
            break

        videos = all_videos
        videos = videos_page["items"]

        content_synced = 0
        analytics_synced = 0

    # Maps YouTube video ID -> Aflit MongoDB content ID
    content_map = {}

    video_ids = []

    for video in videos:
        normalized_video = normalize_video(
            video=video,
            platform_id=platform_id
        )

        external_content_id = normalized_video[
            "external_content_id"
        ]

        content_id = await create_content(
            user_id=user_id,
            platform_id=platform_id,
            platform="youtube",
            external_content_id=external_content_id,
            title=normalized_video["title"],
            description=normalized_video["description"],
            published_at=normalized_video["published_at"]
        )

        if content_id is not None:
            content_synced += 1

            content_map[external_content_id] = content_id

            video_ids.append(external_content_id)

    analytics = await get_video_analytics(
        credentials=credentials,
        video_ids=video_ids
    )

    for video in analytics:
        content_id = content_map.get(video["id"])

        if content_id is None:
            continue

        normalized_analytics = normalize_video_analytics(
            video=video,
            content_id=content_id,
            platform_id=platform_id
        )

        await create_analytics(
            user_id=user_id,
            content_id=content_id,
            platform_id=platform_id,
            platform="youtube",
            metrics=normalized_analytics["metrics"],
            recorded_at=datetime.now(timezone.utc)
        )

        analytics_synced += 1

    return {
    "success": True,
    "content_synced": content_synced,
    "analytics_synced": analytics_synced
}