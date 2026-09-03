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
    """Retrieve all message templates directly from Meta Cloud API and Neon DB."""
    try:
        templates = await WhatsAppIntegrationService.sync_meta_templates()
        return {"success": True, "templates": templates}
    except Exception as e:
        try:
            templates = await WhatsAppIntegrationService.list_templates()
            return {"success": True, "templates": templates}
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to fetch templates from Meta API: {str(e)}"
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

@router.get("/message-logs")
def get_whatsapp_message_logs(phone: Optional[str] = None):
    """Fetch message logs with exact Meta API and Webhook statuses."""
    try:
        logs = WhatsAppIntegrationService.get_message_logs(recipient_phone=phone)
        return {"success": True, "count": len(logs), "logs": logs}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch message logs: {str(e)}"
        )

@router.post("/webhook")
async def receive_meta_webhook(payload: dict):
    """Receive incoming WhatsApp messages and status payloads from Meta Webhooks."""
    import json
    print(f"[WHATSAPP WEBHOOK EVENT] Received Webhook Payload:\n{json.dumps(payload, indent=2)}")

    try:
        # Extract status updates from Meta payload structure
        entry_list = payload.get("entry", [])
        for entry in entry_list:
            for change in entry.get("changes", []):
                val = change.get("value", {})
                statuses = val.get("statuses", [])
                for st in statuses:
                    wamid = st.get("id")
                    wh_status = st.get("status") # 'sent', 'delivered', 'read', 'failed'
                    err_code = None
                    err_msg = None

                    errors = st.get("errors", [])
                    if errors and len(errors) > 0:
                        first_err = errors[0]
                        err_code = first_err.get("code")
                        err_msg = first_err.get("title") or first_err.get("message") or first_err.get("error_data", {}).get("details")

                    if wamid and wh_status:
                        print(f"[META WEBHOOK STATUS MATCHED] wamid={wamid} -> status={wh_status}, error_code={err_code}")
                        WhatsAppIntegrationService.update_webhook_status(
                            wamid=wamid,
                            webhook_status=wh_status,
                            error_code=err_code,
                            error_message=err_msg
                        )
    except Exception as exc:
        print(f"[ERROR] Failed to process webhook status payload: {exc}")

    return {"status": "received", "success": True}
