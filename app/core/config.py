from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "Rapidito API"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = False

    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""

    DATABASE_URL: str | None = None

    @property
    def db_url(self) -> str:
        return self.DATABASE_URL or self.SUPABASE_URL

    CORS_ORIGINS: list[str] = ["*"]

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
