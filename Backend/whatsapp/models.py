from typing import Optional, List, Dict, Any
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

class TemplateButton(BaseModel):
    type: str = "QUICK_REPLY" # "QUICK_REPLY", "URL", "PHONE_NUMBER"
    text: str
    url: Optional[str] = None
    phone_number: Optional[str] = None

class CreateTemplateRequest(BaseModel):
    name: str = Field(..., description="Template name, lowercase with underscores, e.g. welcome_offer")
    category: str = Field(default="MARKETING", description="MARKETING, UTILITY, or AUTHENTICATION")
    language: str = Field(default="en_US", description="Language code e.g. en_US, te_IN")
    header_type: str = Field(default="NONE", description="NONE, TEXT, or IMAGE")
    header_text: Optional[str] = None
    header_image_url: Optional[str] = None
    body_text: str = Field(..., description="Body text with {{1}}, {{2}} variables")
    footer_text: Optional[str] = None
    buttons: Optional[List[TemplateButton]] = None
    sample_values: Optional[List[str]] = None
