import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    """
    Centralized Backend Configuration.
    All values are automatically loaded from Backend/.env or environment variables.
    """
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    # 🌐 Service Domains
    BACKEND_URL: str = "https://crm-fee1.onrender.com"
    FRONTEND_URL: str = "https://crm-1-peach.vercel.app"

    # 🔐 Better Auth Credentials & Endpoint
    VERCEL_AUTH_URL: str = "https://crm-1-peach.vercel.app/api/auth"
    BETTER_AUTH_API_KEY: str = "ba_1srxo579z8prokewgiqcwcwz8kjckpqt"
    BETTER_AUTH_SECRET: str = "ba_1srxo579z8prokewgiqcwcwz8kjckpqt"

    # 🛡️ CORS Origins
    CORS_ORIGINS: str = "https://crm-1-peach.vercel.app,https://crm-fee1.onrender.com,http://localhost:5173,http://localhost:3000"

    # 🗄️ Storage & Services
    DATABASE_URL: str = "sqlite+aiosqlite:///./crm.db"
    REDIS_URL: str = "redis://localhost:6379/0"
    MEILISEARCH_URL: str = "http://localhost:7700"
    MEILISEARCH_KEY: str = "masterKey"

    @property
    def cors_origins_list(self) -> List[str]:
        """Convert comma-separated CORS_ORIGINS into a clean list"""
        if not self.CORS_ORIGINS:
            return ["*"]
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

# Singleton instance available across the entire backend codebase
settings = Settings()
