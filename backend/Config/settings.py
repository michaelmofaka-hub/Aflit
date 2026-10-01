from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    mongodb_url: str
    environment: str = "development"
    jwt_issuer: str = "aflit"
    jwt_secret: str

    google_client_id: str
    google_client_secret: str

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore"
    )

settings = Settings()
