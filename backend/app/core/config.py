from __future__ import annotations

from pathlib import Path
from typing import List

from pydantic import AliasChoices, Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


def _normalize_smtp_password(value: str) -> str:
    return value.replace(" ", "").replace("\t", "").strip()


class Settings(BaseSettings):
    app_name: str = "Datastraw Operations"
    environment: str = "development"
    database_url: str = "sqlite:///./datastraw.db"
    mysql_host: str = "localhost"
    mysql_port: int = 3306
    mysql_database: str = "datastraw"
    mysql_user: str = "root"
    mysql_password: str = ""
    cors_origins: str = Field(
        default="http://localhost:5173,http://127.0.0.1:5173",
        validation_alias=AliasChoices("CORS_ORIGINS", "cors_origins"),
    )
    ai_provider: str = "disabled"
    openai_api_key: str = Field(
        default="",
        validation_alias=AliasChoices("OPENAI_API_KEY", "AI_API_KEY"),
        serialization_alias="OPENAI_API_KEY",
    )
    openai_model: str = "gpt-4o-mini"
    smtp_host: str = "localhost"
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""
    otp_expiration_minutes: int = 5
    max_otp_attempts: int = 5
    otp_resend_cooldown_seconds: int = 30
    session_expiration_minutes: int = 60 * 8
    debug: bool = False

    model_config = SettingsConfigDict(
        env_file=Path(__file__).resolve().parents[2] / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
        populate_by_name=True,
    )

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, value):
        if isinstance(value, (list, tuple, set)):
            return ",".join(str(item).strip() for item in value if str(item).strip())
        return value

    @field_validator("smtp_password", mode="before")
    @classmethod
    def normalize_smtp_password(cls, value):
        if isinstance(value, str):
            return _normalize_smtp_password(value)
        return value

    @property
    def has_openai_config(self) -> bool:
        return self.ai_provider.lower() in {"openai", "enabled"} and bool(self.openai_api_key.strip())


settings = Settings()
