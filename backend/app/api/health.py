"""
Health Check API Endpoints
"""
from fastapi import APIRouter
from datetime import datetime

router = APIRouter(tags=["Health"])


@router.get("/")
async def root():
    """Root endpoint - API info"""
    return {
        "name": "Hexific Smart Contract Audit API",
        "version": "1.0.0",
        "description": "AI-powered smart contract security auditing",
        "endpoints": {
            "audit": "/audit - Smart contract auditing",
            "ai_assist": "/ai-assist - AI vulnerability assistance",
            "docs": "/docs - API documentation"
        }
    }


@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "hexific-api"
    }
