"""
AI Assistant API Endpoints
Handles AI-powered vulnerability assistance
"""
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import Optional
from app.services.ai_service import ai_service
from app.services.supabase_service import supabase_service

router = APIRouter(prefix="/ai-assist", tags=["AI Assistant"])


class AssistRequest(BaseModel):
    """Request model for AI assistance"""
    vulnerability: str
    code_snippet: Optional[str] = None
    context: Optional[str] = None


class ChatRequest(BaseModel):
    """Request model for general chat"""
    message: str
    history: Optional[list] = None


@router.post("/")
async def ai_assist(request: Request, body: AssistRequest):
    """
    FREE TIER: Get AI assistance for understanding vulnerabilities
    
    - Uses Groq for fast inference
    - 3 free requests per day
    - Explains vulnerabilities and provides fix suggestions
    """
    # Get client IP
    client_ip = request.client.host if request.client else "unknown"
    
    # Check rate limit
    rate_limit = await supabase_service.check_rate_limit(client_ip, "ai-assist")
    if not rate_limit["allowed"]:
        raise HTTPException(
            status_code=429,
            detail={
                "error": "Rate limit exceeded",
                "message": "Free AI assist limit reached. Connect wallet to continue.",
                "remaining": 0,
                "limit": rate_limit.get("limit", 3)
            }
        )
    
    # Log request
    await supabase_service.log_request(client_ip, "ai-assist")
    
    # Build full query with context if provided
    full_vulnerability = body.vulnerability
    if body.context:
        full_vulnerability = f"{body.context}\n\n{body.vulnerability}"
    
    # Get AI assistance using Groq (fast)
    result = await ai_service.assist_with_groq(
        full_vulnerability,
        body.code_snippet
    )
    
    if not result["success"]:
        raise HTTPException(
            status_code=500,
            detail=result.get("error", "AI assistance failed")
        )
    
    return {
        "success": True,
        "tier": "free",
        "rate_limit": {
            "remaining": rate_limit["remaining"] - 1,
            "limit": rate_limit.get("limit", 3)
        },
        "response": result["response"],
        "model": result.get("model", "unknown")
    }


@router.post("/chat")
async def ai_chat(request: Request, body: ChatRequest):
    """
    General chat endpoint for security questions
    
    - Answer general smart contract security questions
    - No code analysis, just knowledge sharing
    """
    # Get client IP
    client_ip = request.client.host if request.client else "unknown"
    
    # Check rate limit (shared with ai-assist)
    rate_limit = await supabase_service.check_rate_limit(client_ip, "ai-assist")
    if not rate_limit["allowed"]:
        raise HTTPException(
            status_code=429,
            detail={
                "error": "Rate limit exceeded",
                "message": "Free AI chat limit reached. Connect wallet to continue.",
                "remaining": 0,
                "limit": rate_limit.get("limit", 3)
            }
        )
    
    # Log request
    await supabase_service.log_request(client_ip, "ai-assist")
    
    # Get AI response using Groq
    result = await ai_service.assist_with_groq(body.message)
    
    if not result["success"]:
        raise HTTPException(
            status_code=500,
            detail=result.get("error", "AI chat failed")
        )
    
    return {
        "success": True,
        "tier": "free",
        "rate_limit": {
            "remaining": rate_limit["remaining"] - 1,
            "limit": rate_limit.get("limit", 3)
        },
        "response": result["response"],
        "model": result.get("model", "unknown")
    }


@router.get("/status")
async def ai_status(request: Request):
    """
    Check AI service status and rate limit
    """
    # Get client IP
    client_ip = request.client.host if request.client else "unknown"
    
    # Check rate limit
    rate_limit = await supabase_service.check_rate_limit(client_ip, "ai-assist")
    
    return {
        "success": True,
        "service": "ai-assist",
        "status": "operational",
        "rate_limit": {
            "remaining": rate_limit["remaining"],
            "used": rate_limit.get("used", 0),
            "limit": rate_limit.get("limit", 3),
            "allowed": rate_limit["allowed"]
        }
    }
