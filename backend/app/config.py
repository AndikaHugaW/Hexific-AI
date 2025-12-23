"""
Configuration settings for Hexific API
"""
import os
from dotenv import load_dotenv
from pydantic_settings import BaseSettings

load_dotenv()

class Settings(BaseSettings):
    # API Keys
    openai_api_key: str = os.getenv("OPENAI_API_KEY", "")
    openai_base_url: str = os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1")
    openai_model: str = os.getenv("OPENAI_MODEL", "gpt-oss:20b")
    
    groq_api_key: str = os.getenv("GROQ_API_KEY", "")
    etherscan_api_key: str = os.getenv("ETHERSCAN_API_KEY", "")
    
    # Supabase
    supabase_url: str = os.getenv("SUPABASE_URL", "")
    supabase_key: str = os.getenv("SUPABASE_KEY", "")
    
    # Server
    host: str = os.getenv("HOST", "0.0.0.0")
    port: int = int(os.getenv("PORT", "8000"))
    debug: bool = os.getenv("DEBUG", "true").lower() == "true"
    
    # CORS
    frontend_url: str = os.getenv("FRONTEND_URL", "http://localhost:3000")
    
    # Rate Limiting
    free_daily_limit: int = 3
    
    model_config = {
        "env_file": ".env",
        "extra": "ignore"
    }

settings = Settings()
