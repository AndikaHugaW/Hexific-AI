"""
Supabase Database Service
Handles rate limiting and request logging
"""
from datetime import datetime, timedelta
from typing import Optional
from supabase import create_client, Client
from app.config import settings

class SupabaseService:
    def __init__(self):
        self.client: Optional[Client] = None
        self._initialize()
    
    def _initialize(self):
        """Initialize Supabase client"""
        if settings.supabase_url and settings.supabase_key:
            try:
                self.client = create_client(
                    settings.supabase_url,
                    settings.supabase_key
                )
            except Exception as e:
                print(f"Failed to initialize Supabase: {e}")
                self.client = None
    
    async def log_request(self, ip_address: str, service_type: str) -> bool:
        """
        Log a request to the database
        
        Args:
            ip_address: Client IP address
            service_type: Type of service (audit, audit-address, ai-assist)
        
        Returns:
            True if logged successfully, False otherwise
        """
        if not self.client:
            return False
        
        try:
            self.client.table("request_logs").insert({
                "ip_address": ip_address,
                "service_type": service_type,
                "created_at": datetime.utcnow().isoformat()
            }).execute()
            return True
        except Exception as e:
            print(f"Failed to log request: {e}")
            return False
    
    async def check_rate_limit(self, ip_address: str, service_type: str) -> dict:
        """
        Check if user has exceeded their daily rate limit
        
        Args:
            ip_address: Client IP address
            service_type: Type of service
        
        Returns:
            dict with 'allowed' (bool) and 'remaining' (int) keys
        """
        if not self.client:
            # If no database, allow all requests (for development)
            return {"allowed": True, "remaining": settings.free_daily_limit}
        
        try:
            # Get requests from last 24 hours
            yesterday = (datetime.utcnow() - timedelta(hours=24)).isoformat()
            
            result = self.client.table("request_logs").select("*").eq(
                "ip_address", ip_address
            ).eq(
                "service_type", service_type
            ).gte(
                "created_at", yesterday
            ).execute()
            
            request_count = len(result.data) if result.data else 0
            remaining = max(0, settings.free_daily_limit - request_count)
            
            return {
                "allowed": request_count < settings.free_daily_limit,
                "remaining": remaining,
                "used": request_count,
                "limit": settings.free_daily_limit
            }
        except Exception as e:
            print(f"Failed to check rate limit: {e}")
            return {"allowed": True, "remaining": settings.free_daily_limit}
    
    async def check_payment_status(self, wallet_address: str) -> dict:
        """
        Check if a wallet has paid for premium access
        
        Args:
            wallet_address: Ethereum wallet address
        
        Returns:
            dict with payment status info
        """
        if not self.client:
            return {"is_premium": False, "expires_at": None}
        
        try:
            result = self.client.table("payments").select("*").eq(
                "wallet_address", wallet_address.lower()
            ).gte(
                "expires_at", datetime.utcnow().isoformat()
            ).execute()
            
            if result.data and len(result.data) > 0:
                return {
                    "is_premium": True,
                    "expires_at": result.data[0].get("expires_at"),
                    "plan": result.data[0].get("plan", "pro")
                }
            
            return {"is_premium": False, "expires_at": None}
        except Exception as e:
            print(f"Failed to check payment status: {e}")
            return {"is_premium": False, "expires_at": None}


# Singleton instance
supabase_service = SupabaseService()
