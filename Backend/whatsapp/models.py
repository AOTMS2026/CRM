from typing import Optional
from pydantic import BaseModel, Field

class WhatsAppConfigRequest(BaseModel):
    access_token: str = Field(..., description="Meta System User Permanent Access Token")
    phone_number_id: str = Field(..., description="Meta Phone Number ID")
    verify_token: str = Field(..., description="Webhook verification secret token")
    graph_version: str = Field(default="v21.0", description="Meta Graph API Version")
    waba_id: str = Field(..., description="Meta WhatsApp Business Account ID")

class WhatsAppConfigResponse(BaseModel):
    success: bool
    status: str
    message: str
    phone_number_id: Optional[str] = None
    display_phone_number: Optional[str] = None
    verified_name: Optional[str] = None
    quality_rating: Optional[str] = None
    waba_id: Optional[str] = None
    graph_version: Optional[str] = None
    masked_access_token: Optional[str] = None
