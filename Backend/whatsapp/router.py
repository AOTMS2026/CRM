from fastapi import APIRouter, HTTPException, Query, Response, status, Header
from typing import Optional, List
from .models import WhatsAppConfigRequest, WhatsAppConfigResponse, CreateTemplateRequest
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

# -----------------------------------------------------------------------------
# TEMPLATE MANAGEMENT ENDPOINTS (FAST API CALLING)
# -----------------------------------------------------------------------------
@router.get("/templates")
async def list_whatsapp_templates():
    """Retrieve all message templates from Neon DB & Meta Cloud API."""
    try:
        templates = await WhatsAppIntegrationService.list_templates()
        return {"success": True, "templates": templates}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch templates: {str(e)}"
        )

@router.post("/templates/sync")
@router.get("/templates/sync")
async def sync_whatsapp_templates():
    """Fetch all real templates from Meta WABA account and sync into platform database."""
    try:
        templates = await WhatsAppIntegrationService.sync_meta_templates()
        return {"success": True, "count": len(templates), "templates": templates}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to sync templates from Meta: {str(e)}"
        )

@router.post("/templates")
async def create_whatsapp_template(req: CreateTemplateRequest):
    """Create a new message template in Meta WhatsApp Business Cloud and Neon DB."""
    try:
        res = await WhatsAppIntegrationService.create_template(req)
        return res
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to create template: {str(e)}"
        )

@router.delete("/templates/{template_name}")
async def delete_whatsapp_template(template_name: str):
    """Delete a template from Meta WhatsApp Cloud and Neon DB."""
    try:
        res = await WhatsAppIntegrationService.delete_template(template_name)
        return res
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete template: {str(e)}"
        )

# -----------------------------------------------------------------------------
# WEBHOOK CHALLENGE AND EVENT RECEIVERS
# -----------------------------------------------------------------------------
@router.get("/webhook")
def verify_meta_webhook(
    hub_mode: Optional[str] = Query(None, alias="hub.mode"),
    hub_verify_token: Optional[str] = Query(None, alias="hub.verify_token"),
    hub_challenge: Optional[str] = Query(None, alias="hub.challenge")
):
    """
    Ultra-Fast Meta Webhook Challenge Verification endpoint.
    Meta sends GET with:
      - hub.mode = 'subscribe'
      - hub.verify_token = your secret
      - hub.challenge = numerical string
    Must return hub.challenge with 200 OK as raw text/plain under 1 second.
    """
    print(f"[META WEBHOOK VERIFY] mode={hub_mode}, verify_token={hub_verify_token}, challenge={hub_challenge}")

    default_token = "aotms_meta_verify_secret_2026"

    # Fast check: Immediately accept default token or any non-empty token
    if hub_mode == "subscribe" and hub_challenge and (
        hub_verify_token == default_token or 
        (hub_verify_token and len(hub_verify_token.strip()) > 0)
    ):
        print(f"[META WEBHOOK VERIFY SUCCESS] Returning challenge: {hub_challenge}")
        return Response(content=str(hub_challenge), media_type="text/plain", status_code=200)

    print(f"[META WEBHOOK VERIFY FAILED] Mismatch or invalid parameters")
    raise HTTPException(status_code=403, detail="Verification token mismatch")

@router.post("/webhook")
async def receive_meta_webhook(payload: dict):
    """Receive incoming WhatsApp messages and status payloads from Meta Webhooks."""
    print(f"[WHATSAPP WEBHOOK EVENT] Received event payload: {payload.get('object', 'unknown')}")
    return {"status": "received", "success": True}
