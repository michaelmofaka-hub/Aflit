import httpx


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