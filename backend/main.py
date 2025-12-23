"""
Hexific Smart Contract Audit API
Main FastAPI application entry point
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import settings
from app.api import audit, assist, health


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    print("[*] Hexific API starting up...")
    print(f"   Debug mode: {settings.debug}")
    print(f"   Frontend URL: {settings.frontend_url}")
    yield
    # Shutdown
    print("[*] Hexific API shutting down...")


# Create FastAPI application
app = FastAPI(
    title="Hexific Smart Contract Audit API",
    description="""
## 🔐 AI-Powered Smart Contract Security Auditing

Hexific provides comprehensive smart contract auditing using:
- **Slither**: Static analysis for vulnerability detection
- **Claude AI**: Deep AI-powered security analysis
- **Groq AI**: Fast vulnerability explanations and assistance

### Features

#### Free Tier (3 requests/day)
- Upload ZIP files for Slither analysis
- Audit verified contracts by address
- AI-powered vulnerability explanations

#### Paid Tier (Unlimited)
- Advanced AI audit with Claude
- Comprehensive static + AI analysis
- Priority processing
    """,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(health.router)
app.include_router(audit.router)
app.include_router(assist.router)


# Run with uvicorn
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug
    )
