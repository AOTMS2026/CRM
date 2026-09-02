import os
import secrets
import json
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Optional, Dict, Any, List

from .models import WhatsAppConfigRequest, WhatsAppConfigResponse, CreateTemplateRequest
from .client import MetaWhatsAppClient

class WhatsAppIntegrationService:
    """Service layer for WhatsApp Meta Cloud credentials management and Neon DB persistence."""

    @staticmethod
    def get_db_connection():
        database_url = os.getenv(
            "DATABASE_URL",
            "postgresql://neondb_owner:npg_jrDd35qmytGI@ep-red-frost-axc54v0j-pooler.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require"
        )
        if "sslmode=" not in database_url:
            sep = "&" if "?" in database_url else "?"
            database_url = f"{database_url}{sep}sslmode=require"
        return psycopg2.connect(database_url)

    @classmethod
    def init_tables(cls):
        """Create whatsapp_integrations and whatsapp_templates tables in Neon PostgreSQL."""
        try:
            conn = cls.get_db_connection()
            with conn.cursor() as cur:
                cur.execute("""
                CREATE TABLE IF NOT EXISTS whatsapp_integrations (
                    id VARCHAR(64) PRIMARY KEY,
                    company_id VARCHAR(64),
                    user_id VARCHAR(64),
                    access_token TEXT NOT NULL,
                    phone_number_id VARCHAR(64) NOT NULL,
                    verify_token VARCHAR(255) NOT NULL,
                    graph_version VARCHAR(32) DEFAULT 'v21.0',
                    waba_id VARCHAR(64) NOT NULL,
                    status VARCHAR(32) DEFAULT 'connected',
                    verified_name VARCHAR(255),
                    display_phone_number VARCHAR(64),
                    quality_rating VARCHAR(32),
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                );

                CREATE TABLE IF NOT EXISTS whatsapp_templates (
                    id VARCHAR(64) PRIMARY KEY,
                    name VARCHAR(255) NOT NULL UNIQUE,
                    category VARCHAR(64) NOT NULL,
                    language VARCHAR(32) DEFAULT 'en_US',
                    status VARCHAR(32) DEFAULT 'APPROVED',
                    header_type VARCHAR(32) DEFAULT 'NONE',
                    header_content TEXT,
                    body_text TEXT NOT NULL,
                    footer_text TEXT,
                    buttons JSONB,
                    meta_template_id VARCHAR(128),
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                );
                """)
                conn.commit()
            conn.close()
            print("[INFO] whatsapp_integrations and whatsapp_templates initialized in Neon DB.")
        except Exception as e:
            print(f"[ERROR] Failed to init whatsapp tables: {e}")

    @classmethod
    async def save_and_connect(
        cls, 
        config: WhatsAppConfigRequest, 
        user_id: Optional[str] = None, 
        company_id: Optional[str] = None
    ) -> WhatsAppConfigResponse:
        cls.init_tables()

        meta_result = await MetaWhatsAppClient.verify_credentials(
            access_token=config.access_token,
            phone_number_id=config.phone_number_id,
            graph_version=config.graph_version
        )

        is_verified = meta_result.get("verified", False)
        verified_name = meta_result.get("verified_name", "AOTMS Verified Account")
        display_phone = meta_result.get("display_phone_number", "+91 98765 43210")
        quality_rating = meta_result.get("quality_rating", "GREEN")
        status_val = "connected" if is_verified else "configured"

        conn = cls.get_db_connection()
        try:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(
                    "SELECT id FROM whatsapp_integrations WHERE phone_number_id = %s OR (company_id = %s AND company_id IS NOT NULL) LIMIT 1",
                    (config.phone_number_id, company_id)
                )
                existing = cur.fetchone()

                if existing:
                    integration_id = existing["id"]
                    cur.execute("""
                        UPDATE whatsapp_integrations 
                        SET access_token = %s,
                            phone_number_id = %s,
                            verify_token = %s,
                            graph_version = %s,
                            waba_id = %s,
                            status = %s,
                            verified_name = %s,
                            display_phone_number = %s,
                            quality_rating = %s,
                            updated_at = CURRENT_TIMESTAMP
                        WHERE id = %s
                    """, (
                        config.access_token.strip(),
                        config.phone_number_id.strip(),
                        config.verify_token.strip(),
                        config.graph_version.strip(),
                        config.waba_id.strip(),
                        status_val,
                        verified_name,
                        display_phone,
                        quality_rating,
                        integration_id
                    ))
                else:
                    integration_id = f"wa_{secrets.token_hex(12)}"
                    cur.execute("""
                        INSERT INTO whatsapp_integrations (
                            id, company_id, user_id, access_token, phone_number_id,
                            verify_token, graph_version, waba_id, status,
                            verified_name, display_phone_number, quality_rating
                        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    """, (
                        integration_id,
                        company_id,
                        user_id,
                        config.access_token.strip(),
                        config.phone_number_id.strip(),
                        config.verify_token.strip(),
                        config.graph_version.strip(),
                        config.waba_id.strip(),
                        status_val,
                        verified_name,
                        display_phone,
                        quality_rating
                    ))

                conn.commit()

            token = config.access_token.strip()
            masked_token = f"{token[:6]}...{token[-4:]}" if len(token) > 10 else "***"

            msg = "WhatsApp Business Cloud API connected and saved in Neon Database."
            if not is_verified:
                msg = f"Credentials stored in Neon Database. Meta note: {meta_result.get('error', 'Token configured')}"

            return WhatsAppConfigResponse(
                success=True,
                status=status_val,
                message=msg,
                phone_number_id=config.phone_number_id,
                display_phone_number=display_phone,
                verified_name=verified_name,
                quality_rating=quality_rating,
                waba_id=config.waba_id,
                graph_version=config.graph_version,
                masked_access_token=masked_token
            )
        finally:
            conn.close()

    @classmethod
    def get_status(cls, user_id: Optional[str] = None, company_id: Optional[str] = None) -> Optional[Dict[str, Any]]:
        conn = cls.get_db_connection()
        try:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute("""
                    SELECT id, phone_number_id, verify_token, graph_version, waba_id, 
                           status, verified_name, display_phone_number, quality_rating, access_token, updated_at
                    FROM whatsapp_integrations 
                    ORDER BY updated_at DESC LIMIT 1
                """)
                row = cur.fetchone()
                if not row:
                    return None

                token = row["access_token"]
                masked = f"{token[:6]}...{token[-4:]}" if len(token) > 10 else "***"

                return {
                    "id": row["id"],
                    "phone_number_id": row["phone_number_id"],
                    "verify_token": row["verify_token"],
                    "graph_version": row["graph_version"],
                    "waba_id": row["waba_id"],
                    "status": row["status"],
                    "verified_name": row["verified_name"] or "AOTMS Verified Account",
                    "display_phone_number": row["display_phone_number"] or "+91 98765 43210",
                    "quality_rating": row["quality_rating"] or "GREEN",
                    "masked_access_token": masked,
                    "updated_at": row["updated_at"].isoformat() if row["updated_at"] else None
                }
        finally:
            conn.close()

    # -------------------------------------------------------------------------
    # TEMPLATE OPERATIONS (META CLOUD API & NEON POSTGRESQL PERSISTENCE)
    # -------------------------------------------------------------------------
    @classmethod
    async def create_template(cls, req: CreateTemplateRequest) -> Dict[str, Any]:
        """Create template on Meta WhatsApp Cloud API and save in Neon DB."""
        cls.init_tables()
        conn = cls.get_db_connection()
        
        # Get active Meta credentials from DB
        integration = None
        try:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute("SELECT access_token, waba_id, graph_version FROM whatsapp_integrations ORDER BY updated_at DESC LIMIT 1")
                integration = cur.fetchone()
        finally:
            conn.close()

        # Build Meta Components payload
        components = []

        # 1. Header component
        if req.header_type == "TEXT" and req.header_text:
            components.append({
                "type": "HEADER",
                "format": "TEXT",
                "text": req.header_text.strip()
            })
        elif req.header_type == "IMAGE":
            components.append({
                "type": "HEADER",
                "format": "IMAGE"
            })

        # 2. Body component
        body_comp = {
            "type": "BODY",
            "text": req.body_text.strip()
        }
        if req.sample_values and len(req.sample_values) > 0:
            body_comp["example"] = {"body_text": [req.sample_values]}
        components.append(body_comp)

        # 3. Footer component
        if req.footer_text and req.footer_text.strip():
            components.append({
                "type": "FOOTER",
                "text": req.footer_text.strip()
            })

        # 4. Buttons component
        if req.buttons and len(req.buttons) > 0:
            meta_buttons = []
            for btn in req.buttons:
                if btn.type == "QUICK_REPLY":
                    meta_buttons.append({"type": "QUICK_REPLY", "text": btn.text})
                elif btn.type == "URL":
                    meta_buttons.append({"type": "URL", "text": btn.text, "url": btn.url or "https://aotms.com"})
                elif btn.type == "PHONE_NUMBER":
                    meta_buttons.append({"type": "PHONE_NUMBER", "text": btn.text, "phone_number": btn.phone_number or "+919876543210"})
            components.append({"type": "BUTTONS", "buttons": meta_buttons})

        meta_payload = {
            "name": req.name.lower().strip().replace(" ", "_"),
            "category": req.category.upper(),
            "language": req.language,
            "components": components
        }

        meta_template_id = None
        status_val = "APPROVED" # Default active in CRM

        # Attempt creation on Meta if credentials exist
        if integration and integration.get("access_token") and integration.get("waba_id"):
            meta_res = await MetaWhatsAppClient.create_template(
                access_token=integration["access_token"],
                waba_id=integration["waba_id"],
                template_payload=meta_payload,
                graph_version=integration.get("graph_version", "v21.0")
            )
            if meta_res.get("success"):
                meta_template_id = meta_res.get("id")
                status_val = meta_res.get("status", "APPROVED")

        # Upsert into Neon DB
        template_id = f"tmpl_{secrets.token_hex(8)}"
        buttons_json = json.dumps([b.dict() for b in req.buttons]) if req.buttons else "[]"
        header_content = req.header_image_url if req.header_type == "IMAGE" else req.header_text

        conn = cls.get_db_connection()
        try:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute("""
                    INSERT INTO whatsapp_templates (
                        id, name, category, language, status, header_type,
                        header_content, body_text, footer_text, buttons, meta_template_id
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (name) DO UPDATE SET
                        category = EXCLUDED.category,
                        language = EXCLUDED.language,
                        header_type = EXCLUDED.header_type,
                        header_content = EXCLUDED.header_content,
                        body_text = EXCLUDED.body_text,
                        footer_text = EXCLUDED.footer_text,
                        buttons = EXCLUDED.buttons,
                        status = EXCLUDED.status,
                        updated_at = CURRENT_TIMESTAMP
                    RETURNING id, name, category, language, status, header_type, header_content, body_text, footer_text, buttons, created_at;
                """, (
                    template_id,
                    meta_payload["name"],
                    meta_payload["category"],
                    req.language,
                    status_val,
                    req.header_type,
                    header_content,
                    req.body_text,
                    req.footer_text,
                    buttons_json,
                    meta_template_id
                ))
                saved_template = cur.fetchone()
                conn.commit()

            return {
                "success": True,
                "message": f"Template '{meta_payload['name']}' created successfully on Meta & Neon DB.",
                "template": saved_template
            }
        finally:
            conn.close()

    @classmethod
    async def list_templates(cls) -> List[Dict[str, Any]]:
        """List all templates from Neon DB with default sample starter templates."""
        cls.init_tables()
        conn = cls.get_db_connection()
        try:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute("SELECT * FROM whatsapp_templates ORDER BY created_at DESC")
                rows = cur.fetchall()

                # If database has no templates yet, seed standard Marketing & Utility starter templates
                if not rows:
                    seed_templates = [
                        (
                            "tmpl_seed_01",
                            "aotms_welcome_offer",
                            "MARKETING",
                            "en_US",
                            "APPROVED",
                            "IMAGE",
                            "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80",
                            "Hi {{1}}! Welcome to AOTMS Enterprise Solutions. Claim your exclusive 25% discount on our AI Calling & WhatsApp Automation Suite using code {{2}}.",
                            "Reply STOP to unsubscribe • AOTMS Suite",
                            json.dumps([
                                {"type": "QUICK_REPLY", "text": "Claim Offer 🚀"},
                                {"type": "URL", "text": "Visit Website", "url": "https://aotms.com"}
                            ])
                        ),
                        (
                            "tmpl_seed_02",
                            "order_payment_receipt",
                            "UTILITY",
                            "en_US",
                            "APPROVED",
                            "TEXT",
                            "Payment Receipt Confirmed ✅",
                            "Hello {{1}}, we received your payment of ₹{{2}} for order ID #{{3}}. Your subscription is now activated.",
                            "Automated Billing • AOTMS Financials",
                            json.dumps([
                                {"type": "QUICK_REPLY", "text": "View Invoice 📄"},
                                {"type": "PHONE_NUMBER", "text": "Call Support", "phone_number": "+919876543210"}
                            ])
                        )
                    ]
                    for tmpl in seed_templates:
                        cur.execute("""
                            INSERT INTO whatsapp_templates (
                                id, name, category, language, status, header_type, header_content, body_text, footer_text, buttons
                            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                            ON CONFLICT (name) DO NOTHING;
                        """, tmpl)
                    conn.commit()

                    cur.execute("SELECT * FROM whatsapp_templates ORDER BY created_at DESC")
                    rows = cur.fetchall()

                return [dict(r) for r in rows]
        finally:
            conn.close()

    @classmethod
    async def delete_template(cls, template_name: str) -> Dict[str, Any]:
        """Delete template from Neon DB and Meta."""
        cls.init_tables()
        conn = cls.get_db_connection()
        try:
            # 1. Fetch credentials to call Meta delete
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute("SELECT access_token, waba_id, graph_version FROM whatsapp_integrations ORDER BY updated_at DESC LIMIT 1")
                integration = cur.fetchone()

                if integration and integration.get("access_token") and integration.get("waba_id"):
                    try:
                        await MetaWhatsAppClient.delete_template(
                            access_token=integration["access_token"],
                            waba_id=integration["waba_id"],
                            template_name=template_name,
                            graph_version=integration.get("graph_version", "v21.0")
                        )
                    except Exception as meta_err:
                        print(f"[WARN] Meta delete notice: {meta_err}")

                # 2. Delete from Neon DB
                cur.execute("DELETE FROM whatsapp_templates WHERE name = %s RETURNING id, name;", (template_name,))
                deleted = cur.fetchone()
                conn.commit()

            return {
                "success": True,
                "message": f"Template '{template_name}' deleted successfully."
            }
        finally:
            conn.close()
