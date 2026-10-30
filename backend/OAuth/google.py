import secrets

import os

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

ENVIRONMENT = os.getenv("ENVIRONMENT", "development").lower()

if ENVIRONMENT == "production":
    REDIRECT_URI = "https://aflit.onrender.com/platform/youtube/callback"
else:
    REDIRECT_URI = "http://127.0.0.1:8000/platform/youtube/callback"
  
oauth_states = {}


def create_google_flow(code_verifier: str | None = None):
    flow = Flow.from_client_config(
        GOOGLE_CLIENT_CONFIG,
        scopes=SCOPES,
        code_verifier=code_verifier,
        redirect_uri=REDIRECT_URI
    )

    return flow


def create_oauth_state(state: str, user_id: str, code_verifier: str):
    state = secrets.token_urlsafe(32)

    oauth_states[state] = {
    "user_id": user_id,
    "code_verifier": code_verifier
}

    return state


def get_user_from_oauth_state(state: str):
    return oauth_states.get(state)


def delete_oauth_state(state: str):
    oauth_states.pop(state, None)