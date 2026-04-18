from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    PROJECT_NAME: str = "Movie App API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Database
    DATABASE_URL: str = "postgresql://movieapp:movieapp123@localhost:5432/movieapp_db"
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",  # React frontend
        "http://127.0.0.1:3000",
        "http://localhost:8000",  # FastAPI docs
        "http://127.0.0.1:8000",
    ]
    
    # Security
    SECRET_KEY: str = "your-secret-key-change-this-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # External APIs
    TMDB_API_KEY: str = ""  # You'll need to get this from TMDB
    TMDB_BASE_URL: str = "https://api.themoviedb.org/3"
    
    class Config:
        env_file = ".env"

settings = Settings()
