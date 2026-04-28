import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "Agro-Tech platform"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super-secret-key-change-in-production")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days

    POSTGRES_USER: str = os.getenv("POSTGRES_USER", "user")
    POSTGRES_PASSWORD: str = os.getenv("POSTGRES_PASSWORD", "password")
    POSTGRES_DB: str = os.getenv("POSTGRES_DB", "agritech")
    POSTGRES_SERVER: str = os.getenv("POSTGRES_SERVER", "localhost")
    POSTGRES_PORT: str = os.getenv("POSTGRES_PORT", "5432")

    DATABASE_URL: str = "postgresql+asyncpg://neondb_owner:npg_gTsOWRGY93Ij@ep-orange-base-a1klwas0-pooler.ap-southeast-1.aws.neon.tech/neondb?ssl=require"

    # Razorpay
    RAZORPAY_KEY_ID: str = "rzp_test_your_key_id"
    RAZORPAY_KEY_SECRET: str = "your_key_secret"

    # Stripe
    STRIPE_PUBLISHABLE_KEY: str = "pk_test_your_publishable_key"
    STRIPE_SECRET_KEY: str = "sk_test_your_secret_key"
    STRIPE_WEBHOOK_SECRET: str = "whsec_your_webhook_secret"

    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    
    # Cloudinary
    CLOUDINARY_CLOUD_NAME: str = os.getenv("CLOUDINARY_CLOUD_NAME", "")
    CLOUDINARY_API_KEY: str = os.getenv("CLOUDINARY_API_KEY", "")
    CLOUDINARY_API_SECRET: str = os.getenv("CLOUDINARY_API_SECRET", "")

    # CORS
    CORS_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001,http://localhost:5173,http://127.0.0.1:5173,https://agent-69f0ad1e3170e2b14bc--deluxe-youtiao-84b87d.netlify.app"

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip().rstrip("/") for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:
        return self.DATABASE_URL

    model_config = SettingsConfigDict(case_sensitive=True, env_file=".env", extra="ignore")

settings = Settings()
