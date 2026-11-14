
from pydantic import SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Database
    mongodb_url: str

    # Application
    environment: str = "development"

    # Authentication
    jwt_issuer: str = "aflit"
    jwt_secret: str

    # Google OAuth
    google_client_id: str
    google_client_secret: str

    # AI Agent - OpenRouter
    openrouter_api_key: SecretStr
    ai_model: str = "openrouter/free"
    openrouter_base_url: str = "https://openrouter.ai/api/v1"

    # Environment configuration
    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore"
    )


settings = Settings()
