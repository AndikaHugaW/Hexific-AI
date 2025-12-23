"""
Audit API Endpoints
Handles smart contract auditing requests
"""
from fastapi import APIRouter, HTTPException, UploadFile, File, Request
from pydantic import BaseModel
from typing import Optional
from app.config import settings
from app.services.slither_service import slither_service
from app.services.ai_service import ai_service
from app.services.etherscan_service import etherscan_service
from app.services.supabase_service import supabase_service

router = APIRouter(prefix="/audit", tags=["Audit"])


class AuditAddressRequest(BaseModel):
    """Request model for audit by address"""
    address: str
    network: str = "mainnet"


class AuditSourceRequest(BaseModel):
    """Request model for audit by source code"""
    source_code: str
    contract_name: str = "Contract"


class AuditProRequest(BaseModel):
    """Request model for paid audit (AI-powered)"""
    address: str
    network: str = "mainnet"
    wallet_address: Optional[str] = None


# ==================== FREE TIER ENDPOINTS ====================

@router.post("/")
async def audit_zip(request: Request, file: UploadFile = File(...)):
    """
    FREE TIER: Audit smart contract from ZIP file using Slither
    
    - Accepts a ZIP file containing Solidity source files
    - Runs Slither static analysis
    - Returns vulnerability report
    """
    # Get client IP
    client_ip = request.client.host if request.client else "unknown"
    
    # Check rate limit
    rate_limit = await supabase_service.check_rate_limit(client_ip, "audit")
    if not rate_limit["allowed"]:
        raise HTTPException(
            status_code=429,
            detail={
                "error": "Rate limit exceeded",
                "message": "Free tier limit reached. Connect wallet to continue.",
                "remaining": 0,
                "limit": rate_limit.get("limit", 3)
            }
        )
    
    # Validate file
    if not file.filename.endswith(".zip"):
        raise HTTPException(
            status_code=400,
            detail="File must be a ZIP archive"
        )
    
    # Read file content
    try:
        content = await file.read()
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Failed to read file: {str(e)}"
        )
    
    # Log request
    await supabase_service.log_request(client_ip, "audit")
    
    # Run Slither analysis
    result = await slither_service.analyze_zip(content)
    
    if not result["success"]:
        raise HTTPException(
            status_code=422,
            detail=result.get("error", "Analysis failed")
        )
    
    return {
        "success": True,
        "audit_type": "slither",
        "tier": "free",
        "rate_limit": {
            "remaining": rate_limit["remaining"] - 1,
            "limit": rate_limit.get("limit", 3)
        },
        "results": result
    }


@router.post("/address-ui")
async def audit_address_ui(request: Request, body: AuditAddressRequest):
    """
    FREE TIER: Audit verified contract by address using Claude AI
    
    - Fetches source code from Etherscan
    - Runs Claude AI analysis
    - Returns AI-generated vulnerability report
    """
    # Get client IP
    client_ip = request.client.host if request.client else "unknown"
    
    # Check rate limit
    rate_limit = await supabase_service.check_rate_limit(client_ip, "audit-address-ui")
    if not rate_limit["allowed"]:
        raise HTTPException(
            status_code=429,
            detail={
                "error": "Rate limit exceeded",
                "message": "Free tier limit reached. Connect wallet to continue.",
                "remaining": 0,
                "limit": rate_limit.get("limit", 3)
            }
        )
    
    # Fetch contract source from Etherscan
    print(f"DEBUG: Fetching code for {body.address} on {body.network}...")
    contract = await etherscan_service.get_contract_source(
        body.address, 
        body.network
    )
    
    if not contract["success"]:
        print(f"DEBUG: Failed to fetch contract: {contract.get('error')}")
        raise HTTPException(
            status_code=404,
            detail=contract.get("error", "Contract not found or not verified")
        )
    
    # Log request
    await supabase_service.log_request(client_ip, "audit-address-ui")
    
    # Run AI analysis
    print(f"DEBUG: Starting AI analysis for {contract['contract_name']} using {settings.openai_model}...")
    ai_result = await ai_service.audit_with_ai(
        contract["source_code"],
        contract["contract_name"]
    )
    print(f"DEBUG: AI Analysis finished. Status: {ai_result['success']}")
    
    if not ai_result["success"]:
        raise HTTPException(
            status_code=500,
            detail=ai_result.get("error", "AI analysis failed")
        )
    
    return {
        "success": True,
        "audit_type": "ai",
        "tier": "free",
        "rate_limit": {
            "remaining": rate_limit["remaining"] - 1,
            "limit": rate_limit.get("limit", 3)
        },
        "contract": {
            "address": body.address,
            "network": body.network,
            "name": contract["contract_name"],
            "compiler": contract.get("compiler_version", ""),
            "is_proxy": contract.get("proxy", False)
        },
        "results": ai_result
    }


# ==================== PAID TIER ENDPOINTS ====================

@router.post("/pro")
async def audit_pro(request: Request, body: AuditSourceRequest):
    """
    PAID TIER: Premium smart contract audit with AI
    
    - Requires wallet connection and payment verification
    - Uses advanced AI model for deeper analysis
    - No rate limits
    """
    # Get client IP
    client_ip = request.client.host if request.client else "unknown"
    
    # For demo purposes, we'll allow the request without payment check
    # In production, you would verify payment here
    
    # Log request
    await supabase_service.log_request(client_ip, "audit-pro")
    
    # Run AI analysis
    ai_result = await ai_service.audit_with_ai(
        body.source_code,
        body.contract_name
    )
    
    if not ai_result["success"]:
        raise HTTPException(
            status_code=500,
            detail=ai_result.get("error", "AI analysis failed")
        )
    
    return {
        "success": True,
        "audit_type": "ai-pro",
        "tier": "paid",
        "results": ai_result
    }


@router.post("/address")
async def audit_address_pro(request: Request, body: AuditProRequest):
    """
    PAID TIER: Premium audit by contract address
    
    - Fetches source from Etherscan
    - Uses advanced AI analysis
    - Also runs Slither for comprehensive coverage
    """
    # Get client IP
    client_ip = request.client.host if request.client else "unknown"
    
    # Verify payment if wallet address provided
    if body.wallet_address:
        payment_status = await supabase_service.check_payment_status(body.wallet_address)
        if not payment_status["is_premium"]:
            raise HTTPException(
                status_code=402,
                detail={
                    "error": "Payment required",
                    "message": "Connect wallet and complete payment to access premium features"
                }
            )
    
    # Fetch contract source from Etherscan
    contract = await etherscan_service.get_contract_source(
        body.address, 
        body.network
    )
    
    if not contract["success"]:
        raise HTTPException(
            status_code=404,
            detail=contract.get("error", "Contract not found or not verified")
        )
    
    # Log request
    await supabase_service.log_request(client_ip, "audit-address-pro")
    
    # Run both Slither and AI analysis for comprehensive coverage
    slither_result = await slither_service.analyze_source(
        contract["source_code"],
        f"{contract['contract_name']}.sol"
    )
    
    ai_result = await ai_service.audit_with_ai(
        contract["source_code"],
        contract["contract_name"]
    )
    
    return {
        "success": True,
        "audit_type": "comprehensive",
        "tier": "paid",
        "contract": {
            "address": body.address,
            "network": body.network,
            "name": contract["contract_name"],
            "compiler": contract.get("compiler_version", ""),
            "is_proxy": contract.get("proxy", False)
        },
        "results": {
            "static_analysis": slither_result,
            "ai_analysis": ai_result
        }
    }
