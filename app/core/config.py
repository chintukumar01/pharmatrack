from dotenv import load_dotenv
import os

load_dotenv()

class Settings:
    DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./pharmacy.db")
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production")
    ALGORITHM = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES = 30

    EMAIL_FROM = os.getenv("EMAIL_FROM")
    EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")
    ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "admin@example.com")  # Default fallback


settings = Settings()

# Debug: Print admin email on startup
if settings.ADMIN_EMAIL:
    print(f"[CONFIG] Admin email loaded: {settings.ADMIN_EMAIL}")
else:
    print("[CONFIG] Admin email not set! Please set ADMIN_EMAIL environment variable")
    # Use a default email for development if not set
    settings.ADMIN_EMAIL = "admin@example.com"
