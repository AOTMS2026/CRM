import httpx
from typing import Dict, Any, Optional

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
        Verify credentials by querying Meta Graph API for the registered Phone Number details.
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
