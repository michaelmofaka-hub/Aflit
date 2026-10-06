import secrets

from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build

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


# Temporary OAuth state storage for V1 development.
# Production should use persistent storage with expiration.
oauth_states = {}


def create_google_flow():
    flow = Flow.from_client_config(
        GOOGLE_CLIENT_CONFIG,
        scopes=SCOPES,
        redirect_uri=REDIRECT_URI
    )

    return flow


def create_oauth_state(user_id: str):
    state = secrets.token_urlsafe(32)

    oauth_states[state] = user_id

    return state


def get_user_from_oauth_state(state: str):
    return oauth_states.get(state)


def delete_oauth_state(state: str):
    oauth_states.pop(state, None)