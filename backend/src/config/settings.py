"""
Application settings using Pydantic Settings (Pattern: Singleton)
"""
from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings"""

    # Telegram
    telegram_bot_token: str
    telegram_webhook_url: str | None = None

    # Database
    database_url: str

    # API
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    secret_key: str

    # Environment
    environment: str = "development"

    # Mini App
    mini_app_url: str

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"
    )


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance (Singleton pattern)"""
    return Settings()
