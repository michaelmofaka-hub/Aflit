import httpx
from datetime import datetime
from googleapiclient.discovery import build


YOUTUBE_CHANNEL_URL = "https://www.googleapis.com/youtube/v3/channels"


async def get_authenticated_channel(access_token: str):
    async with httpx.AsyncClient() as client:
        response = await client.get(
            YOUTUBE_CHANNEL_URL,
            headers={
                "Authorization": f"Bearer {access_token}"
            },
            params={
                "part": "id,snippet",
                "mine": "true"
            }
        )

        response.raise_for_status()

        data = response.json()

        if not data.get("items"):
            return None

        return data["items"][0]

def create_youtube_client(credentials):
    return build(
        "youtube",
        "v3",
        credentials=credentials
    )

async def get_my_channel(credentials):
    youtube = create_youtube_client(credentials)

    response = youtube.channels().list(
        part="snippet,contentDetails,statistics",
        mine=True
    ).execute()

    if not response.get("items"):
        return None

    return response["items"][0]

async def get_channel_videos(
    credentials,
    uploads_playlist_id: str,
    page_token: str | None = None
):
    youtube = create_youtube_client(credentials)

    response = youtube.playlistItems().list(
        part="snippet,contentDetails",
        playlistId=uploads_playlist_id,
        maxResults=50,
        pageToken=page_token
    ).execute()

    return {
        "items": response.get("items", []),
        "next_page_token": response.get("nextPageToken")
    }

def normalize_video(video: dict, platform_id: str):
    snippet = video["snippet"]
    content_details = video["contentDetails"]

    return {
        "platform_id": platform_id,
        "platform": "youtube",
        "external_content_id": content_details["videoId"],
        "title": snippet["title"],
        "description": snippet.get("description"),
        "published_at": datetime.fromisoformat(
    snippet["publishedAt"].replace("Z", "+00:00")
)
    }

def normalize_video_analytics(
    video: dict,
    content_id: str,
    platform_id: str
):
    statistics = video.get("statistics", {})

    return {
        "content_id": content_id,
        "platform_id": platform_id,
        "platform": "youtube",
        "metrics": {
            "views": int(statistics.get("viewCount", 0)),
            "likes": int(statistics.get("likeCount", 0)),
            "comments": int(statistics.get("commentCount", 0)),
            "shares": 0,
            "saves": 0
        }
    }
    
async def get_video_analytics(
    credentials,
    video_ids: list[str]
):
    youtube = create_youtube_client(credentials)

    if not video_ids:
        return []

    response = youtube.videos().list(
        part="statistics",
        id=",".join(video_ids)
    ).execute()

    return response.get("items", [])