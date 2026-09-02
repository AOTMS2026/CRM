from fastapi import APIRouter, HTTPException, Query, Response, status, Header
from typing import Optional
from .models import WhatsAppConfigRequest, WhatsAppConfigResponse
from .service import WhatsAppIntegrationService

router = APIRouter()

@router.post("/connect", response_model=WhatsAppConfigResponse)
async def connect_whatsapp(config: WhatsAppConfigRequest):
    """Save WhatsApp Meta Cloud credentials into Neon PostgreSQL and verify connection."""
    try:
        result = await WhatsAppIntegrationService.save_and_connect(config)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save and connect WhatsApp Meta Account: {str(e)}"
        )

@router.get("/status")
def get_whatsapp_status():
    """Retrieve current WhatsApp integration status and configured parameters from Neon DB."""
    try:
        data = WhatsAppIntegrationService.get_status()
        if not data:
            return {
                "connected": False,
                "status": "not_configured",
                "message": "No active WhatsApp Meta Cloud integration configured."
            }
        return {
            "connected": True,
            "data": data
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch WhatsApp status: {str(e)}"
        )

@router.get("/webhook")
def verify_meta_webhook(
    hub_mode: Optional[str] = Query(None, alias="hub.mode"),
    hub_verify_token: Optional[str] = Query(None, alias="hub.verify_token"),
    hub_challenge: Optional[str] = Query(None, alias="hub.challenge")
):
    """Meta Webhook Challenge Verification endpoint."""
    status_data = WhatsAppIntegrationService.get_status()
    server_verify_token = "aotms_meta_verify_secret_2026"
    if status_data and status_data.get("verify_token"):
        server_verify_token = status_data["verify_token"]

    if hub_mode == "subscribe" and hub_verify_token == server_verify_token:
        return Response(content=hub_challenge, media_type="text/plain")
    
    raise HTTPException(status_code=403, detail="Verification token mismatch")

@router.post("/webhook")
async def receive_meta_webhook(payload: dict):
    """Receive incoming WhatsApp messages and status payloads from Meta Webhooks."""
    print(f"[WHATSAPP WEBHOOK] Received event payload: {payload.get('object', 'unknown')}")
    return {"status": "received", "success": True}
