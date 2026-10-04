from google_auth_oauthlib.flow import Flow

from Config.settings import settings


GOOGLE_CLIENT_CONFIG = {
    "web": {
        "client_id": settings.google_client_id,
        "client_secret": settings.google_client_secret,
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
    }
}


SCOPES = [
    "https://www.googleapis.com/auth/youtube.readonly"
]


REDIRECT_URI = "http://127.0.0.1:8000/platform/youtube/callback"


def create_google_flow():
    flow = Flow.from_client_config(
        GOOGLE_CLIENT_CONFIG,
        scopes=SCOPES,
        redirect_uri=REDIRECT_URI
    )

    return flow