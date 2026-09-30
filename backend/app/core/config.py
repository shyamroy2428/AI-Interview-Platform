from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+psycopg2://interview:interview@db:5432/interview"
    JWT_SECRET: str = "change-me"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 1440
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-2.0-flash"
    CORS_ORIGINS: str = "http://localhost:5173"
    UPLOAD_DIR: str = "/app/uploads"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
