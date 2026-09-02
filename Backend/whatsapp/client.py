import httpx
from typing import Dict, Any, Optional, List

class MetaWhatsAppClient:
    """Client for Meta Graph API WhatsApp Business Cloud interactions."""
    
    BASE_URL = "https://graph.facebook.com"

    @classmethod
    async def verify_credentials(
        cls, 
        access_token: str, 
        phone_number_id: str, 
        graph_version: str = "v21.0"
    ) -> Dict[str, Any]:
        """
        Verify credentials by querying Meta Graph API for registered Phone Number details.
        Endpoint: GET /{graph_version}/{phone_number_id}
        """
        url = f"{cls.BASE_URL}/{graph_version}/{phone_number_id}"
        headers = {
            "Authorization": f"Bearer {access_token.strip()}",
            "Content-Type": "application/json"
        }
        params = {
            "fields": "id,verified_name,display_phone_number,quality_rating,code_verification_status"
        }

        try:
            async with httpx.AsyncClient(timeout=12.0) as client:
                response = await client.get(url, headers=headers, params=params)
                data = response.json()

                if response.status_code == 200:
                    return {
                        "verified": True,
                        "phone_number_id": data.get("id", phone_number_id),
                        "verified_name": data.get("verified_name", "WhatsApp Business Account"),
                        "display_phone_number": data.get("display_phone_number", ""),
                        "quality_rating": data.get("quality_rating", "GREEN"),
                        "raw": data
                    }
                else:
                    error_msg = data.get("error", {}).get("message", "Meta Graph API verification failed.")
                    return {
                        "verified": False,
                        "error": error_msg,
                        "raw": data
                    }
        except httpx.RequestError as exc:
            return {
                "verified": False,
                "error": f"Network error connecting to Meta Graph API: {str(exc)}"
            }

    @classmethod
    async def create_template(
        cls,
        access_token: str,
        waba_id: str,
        template_payload: Dict[str, Any],
        graph_version: str = "v21.0"
    ) -> Dict[str, Any]:
        """
        Create a message template on Meta WhatsApp Cloud API.
        Endpoint: POST /{graph_version}/{waba_id}/message_templates
        """
        url = f"{cls.BASE_URL}/{graph_version}/{waba_id}/message_templates"
        headers = {
            "Authorization": f"Bearer {access_token.strip()}",
            "Content-Type": "application/json"
        }

        try:
            async with httpx.AsyncClient(timeout=35.0) as client:
                response = await client.post(url, headers=headers, json=template_payload)
                data = response.json()

                if response.status_code in [200, 201]:
                    return {
                        "success": True,
                        "id": data.get("id"),
                        "status": data.get("status", "PENDING"),
                        "category": data.get("category", template_payload.get("category")),
                        "raw": data
                    }
                else:
                    err_obj = data.get("error", {})
                    user_msg = err_obj.get("error_user_msg") or err_obj.get("message", "Failed to create template on Meta Graph API.")
                    user_title = err_obj.get("error_user_title")
                    full_err = f"{user_title}: {user_msg}" if user_title else user_msg
                    return {
                        "success": False,
                        "error": full_err,
                        "raw": data
                    }
        except httpx.RequestError as exc:
            return {
                "success": False,
                "error": f"Network error contacting Meta Graph API: {str(exc)}"
            }

    @classmethod
    async def get_templates(
        cls,
        access_token: str,
        waba_id: str,
        graph_version: str = "v21.0"
    ) -> Dict[str, Any]:
        """
        List message templates directly from Meta WABA account.
        Endpoint: GET /{graph_version}/{waba_id}/message_templates
        """
        url = f"{cls.BASE_URL}/{graph_version}/{waba_id}/message_templates"
        headers = {
            "Authorization": f"Bearer {access_token.strip()}",
            "Content-Type": "application/json"
        }
        params = {"limit": 100}

        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                response = await client.get(url, headers=headers, params=params)
                data = response.json()

                if response.status_code == 200:
                    return {
                        "success": True,
                        "templates": data.get("data", [])
                    }
                else:
                    return {
                        "success": False,
                        "error": data.get("error", {}).get("message", "Failed to fetch templates from Meta.")
                    }
        except httpx.RequestError as exc:
            return {
                "success": False,
                "error": str(exc)
            }

    @classmethod
    async def delete_template(
        cls,
        access_token: str,
        waba_id: str,
        template_name: str,
        graph_version: str = "v21.0"
    ) -> Dict[str, Any]:
        """
        Delete a message template from Meta WABA account.
        Endpoint: DELETE /{graph_version}/{waba_id}/message_templates?name={template_name}
        """
        url = f"{cls.BASE_URL}/{graph_version}/{waba_id}/message_templates"
        headers = {
            "Authorization": f"Bearer {access_token.strip()}",
            "Content-Type": "application/json"
        }
        params = {"name": template_name}

        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                response = await client.delete(url, headers=headers, params=params)
                data = response.json()

                if response.status_code == 200:
                    return {"success": True, "data": data}
                else:
                    return {
                        "success": False,
                        "error": data.get("error", {}).get("message", "Failed to delete template from Meta.")
                    }
        except httpx.RequestError as exc:
            return {
                "success": False,
                "error": str(exc)
            }
