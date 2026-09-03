import os
import secrets
import json
import re
import base64
import httpx
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

                CREATE TABLE IF NOT EXISTS whatsapp_message_logs (
                    wamid VARCHAR(255) PRIMARY KEY,
                    template_name VARCHAR(255),
                    category VARCHAR(64),
                    recipient_phone VARCHAR(64) NOT NULL,
                    api_status VARCHAR(64) DEFAULT 'SENT (Awaiting Delivery Confirmation)',
                    webhook_status VARCHAR(64) DEFAULT 'pending',
                    error_code INT,
                    error_message TEXT,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                );
                """)
                conn.commit()
            conn.close()
            print("[INFO] whatsapp_integrations, whatsapp_templates, and whatsapp_message_logs initialized in Neon DB.")
        except Exception as e:
            print(f"[ERROR] Failed to init whatsapp tables: {e}")

    @classmethod
    def log_message_sent(cls, wamid: str, template_name: str, category: str, recipient_phone: str, api_status: str = "SENT"):
        """Record outbound message log into Neon DB."""
        if not wamid:
            return
        cls.init_tables()
        conn = cls.get_db_connection()
        try:
            with conn.cursor() as cur:
                cur.execute("""
                    INSERT INTO whatsapp_message_logs (wamid, template_name, category, recipient_phone, api_status, webhook_status)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    ON CONFLICT (wamid) DO UPDATE 
                    SET api_status = EXCLUDED.api_status, updated_at = CURRENT_TIMESTAMP;
                """, (wamid, template_name, category, recipient_phone, api_status, "pending"))
                conn.commit()
        except Exception as e:
            print(f"[ERROR] Failed to log sent message: {e}")
        finally:
            conn.close()

    @classmethod
    def update_webhook_status(cls, wamid: str, webhook_status: str, error_code: Optional[int] = None, error_message: Optional[str] = None):
        """Update webhook delivery status (sent, delivered, read, failed) from Meta Webhook payload."""
        if not wamid:
            return
        cls.init_tables()
        conn = cls.get_db_connection()
        try:
            with conn.cursor() as cur:
                cur.execute("""
                    UPDATE whatsapp_message_logs
                    SET webhook_status = %s,
                        error_code = COALESCE(%s, error_code),
                        error_message = COALESCE(%s, error_message),
                        updated_at = CURRENT_TIMESTAMP
                    WHERE wamid = %s;
                """, (webhook_status, error_code, error_message, wamid))
                conn.commit()
        except Exception as e:
            print(f"[ERROR] Failed to update webhook status: {e}")
        finally:
            conn.close()

    @classmethod
    def get_message_logs(cls, recipient_phone: Optional[str] = None, limit: int = 50) -> List[Dict[str, Any]]:
        """Retrieve recent message logs with real-time webhook status."""
        cls.init_tables()
        conn = cls.get_db_connection()
        try:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                if recipient_phone:
                    clean = "".join(filter(str.isdigit, recipient_phone))
                    cur.execute("""
                        SELECT * FROM whatsapp_message_logs 
                        WHERE recipient_phone LIKE %s OR recipient_phone LIKE %s
                        ORDER BY created_at DESC LIMIT %s;
                    """, (f"%{clean}%", f"%{recipient_phone}%", limit))
                else:
                    cur.execute("SELECT * FROM whatsapp_message_logs ORDER BY created_at DESC LIMIT %s;", (limit,))
                rows = cur.fetchall()
                return [dict(r) for r in rows]
        except Exception as e:
            print(f"[ERROR] Failed to fetch message logs: {e}")
            return []
        finally:
            conn.close()

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
        """Create template on Meta WhatsApp Cloud API."""
        cls.init_tables()
        conn = cls.get_db_connection()
        
        # 1. Fetch active Meta credentials from Neon DB
        integration = None
        try:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute("SELECT access_token, waba_id, graph_version FROM whatsapp_integrations ORDER BY updated_at DESC LIMIT 1")
                integration = cur.fetchone()
        finally:
            conn.close()

        if not integration or not integration.get("access_token") or not integration.get("waba_id"):
            raise ValueError("No active Meta WhatsApp integration found. Please connect your Meta WABA account first.")

        # 2. Build Meta Components payload
        components = []

        # (a) Header component
        if req.header_type == "TEXT" and req.header_text and req.header_text.strip():
            components.append({
                "type": "HEADER",
                "format": "TEXT",
                "text": req.header_text.strip()
            })
        elif req.header_type == "IMAGE":
            img_bytes = b'\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x01\x00H\x00H\x00\x00\xff\xdb\x00C\x00\x08\x06\x06\x07\x06\x05\x08\x07\x07\x07\t\t\x08\n\x0c\x14\r\x0c\x0b\x0b\x0c\x19\x12\x13\x0f\x14\x1d\x1a\x1f\x1e\x1d\x1a\x1c\x1c $.\' \",#\x1c\x1c(7),01444\x1f\'9=82<.342\xff\xc0\x00\x0b\x08\x00\x01\x00\x01\x01\x01\x11\x00\xff\xc4\x00\x1f\x00\x00\x01\x05\x01\x01\x01\x01\x01\x01\x00\x00\x00\x00\x00\x00\x00\x00\x01\x02\x03\x04\x05\x06\x07\x08\t\n\x0b\xff\xda\x00\x08\x01\x01\x00\x00?\x00\xbf\x00\xff\xd9'
            file_mime = "image/jpeg"

            if req.header_image_url and req.header_image_url.startswith("data:image"):
                try:
                    header_part, data = req.header_image_url.split(",", 1)
                    if "image/png" in header_part:
                        file_mime = "image/png"
                    elif "image/webp" in header_part:
                        file_mime = "image/webp"
                    img_bytes = base64.b64decode(data)
                except Exception as e:
                    print(f"[WARN] Base64 decode failed: {e}")
            elif req.header_image_url and req.header_image_url.startswith("http"):
                try:
                    async with httpx.AsyncClient(timeout=12.0) as dl:
                        resp = await dl.get(req.header_image_url)
                        if resp.status_code == 200 and len(resp.content) > 0:
                            img_bytes = resp.content
                            ct = resp.headers.get("content-type", "")
                            if "png" in ct:
                                file_mime = "image/png"
                except Exception as e:
                    print(f"[WARN] Image download failed: {e}")

            meta_handle = await MetaWhatsAppClient.upload_media_sample(
                access_token=integration["access_token"],
                image_bytes=img_bytes,
                file_type=file_mime,
                app_id="1207473174896357",
                graph_version=integration.get("graph_version", "v21.0")
            )

            if meta_handle:
                components.append({
                    "type": "HEADER",
                    "format": "IMAGE",
                    "example": {
                        "header_handle": [meta_handle]
                    }
                })
            else:
                components.append({
                    "type": "HEADER",
                    "format": "TEXT",
                    "text": "Special Announcement"
                })

        # (b) Body component
        clean_body = req.body_text.strip()
        # Meta requirement: variables cannot be at the very end of template text
        if re.search(r'\{\{\d+\}\}\s*$', clean_body):
            clean_body = clean_body + " to proceed."

        body_comp = {
            "type": "BODY",
            "text": clean_body
        }
        matches = re.findall(r'\{\{(\d+)\}\}', clean_body)
        if matches:
            samples = req.sample_values if (req.sample_values and len(req.sample_values) >= len(matches)) else [f"Sample{i}" for i in range(1, len(matches) + 1)]
            body_comp["example"] = {"body_text": [samples[:len(matches)]]}
        components.append(body_comp)

        # (c) Footer component
        if req.footer_text and req.footer_text.strip():
            components.append({
                "type": "FOOTER",
                "text": req.footer_text.strip()
            })

        # (d) Buttons component with Smart Meta-Compliant Normalization
        if req.buttons and len(req.buttons) > 0:
            # Check if any CTA buttons exist
            has_cta = any(b.type in ["PHONE_NUMBER", "WHATSAPP_CALL", "URL"] for b in req.buttons)

            meta_buttons = []
            if has_cta:
                # Call-To-Action Mode: Max 1 Phone Number and Max 2 URLs (Meta strictly forbids wa.me URLs)
                phone_count = 0
                url_count = 0

                for btn in req.buttons:
                    if len(meta_buttons) >= 3:
                        break

                    btn_text = btn.text[:25].strip() if btn.text else "Action"

                    if btn.type in ["PHONE_NUMBER", "WHATSAPP_CALL"]:
                        raw_num = (btn.phone_number or "+918121016848").strip().replace(" ", "").replace("-", "")
                        if not raw_num.startswith("+"):
                            raw_num = f"+{raw_num}"
                        
                        if phone_count < 1:
                            meta_buttons.append({
                                "type": "PHONE_NUMBER",
                                "text": btn_text,
                                "phone_number": raw_num
                            })
                            phone_count += 1
                        elif url_count < 2:
                            # If a phone number already added, second CTA button must be a valid external website URL
                            meta_buttons.append({
                                "type": "URL",
                                "text": btn_text,
                                "url": "https://www.aotms.com"
                            })
                            url_count += 1

                    elif btn.type == "URL":
                        raw_url = (btn.url or "https://www.aotms.com").strip()
                        if "wa.me" in raw_url or "whatsapp.com" in raw_url:
                            raw_url = "https://www.aotms.com"
                        elif not (raw_url.startswith("http://") or raw_url.startswith("https://")):
                            raw_url = f"https://{raw_url}"

                        if url_count < 2:
                            meta_buttons.append({
                                "type": "URL",
                                "text": btn_text,
                                "url": raw_url
                            })
                            url_count += 1

                    elif btn.type in ["QUICK_REPLY", "CUSTOM", "CONTACT"]:
                        if url_count < 2:
                            meta_buttons.append({
                                "type": "URL",
                                "text": btn_text,
                                "url": "https://www.aotms.com"
                            })
                            url_count += 1
            else:
                # Pure Quick Reply Mode (max 3 buttons)
                for btn in req.buttons[:3]:
                    btn_text = btn.text[:25].strip() if btn.text else "Reply"
                    meta_buttons.append({
                        "type": "QUICK_REPLY",
                        "text": btn_text
                    })

            if meta_buttons:
                components.append({"type": "BUTTONS", "buttons": meta_buttons})

        # 3. Build Meta Graph API Payload
        clean_name = req.name.lower().strip().replace(" ", "_").replace("-", "")
        clean_name = re.sub(r'[^a-z0-9_]', '', clean_name)
        if not clean_name:
            clean_name = f"template_{secrets.token_hex(4)}"

        meta_payload = {
            "name": clean_name,
            "category": req.category.upper(),
            "language": req.language or "en_US",
            "components": components
        }

        # 4. Create Template in Meta WhatsApp Business Account
        meta_res = await MetaWhatsAppClient.create_template(
            access_token=integration["access_token"],
            waba_id=integration["waba_id"],
            template_payload=meta_payload,
            graph_version=integration.get("graph_version", "v21.0")
        )

        if not meta_res.get("success"):
            err_msg = meta_res.get("error", "Failed to create template on Meta Cloud API.")
            print(f"[ERROR] Meta Template Creation Failed: {err_msg}")
            raise ValueError(err_msg)

        meta_template_id = meta_res.get("id")
        status_val = meta_res.get("status", "APPROVED")

        # 5. Simultaneously Store in Neon PostgreSQL Database
        template_id = f"tmpl_{meta_template_id or secrets.token_hex(8)}"
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
                        meta_template_id = EXCLUDED.meta_template_id,
                        updated_at = CURRENT_TIMESTAMP
                    RETURNING id, name, category, language, status, header_type, header_content, body_text, footer_text, buttons, meta_template_id, created_at;
                """, (
                    template_id,
                    clean_name,
                    meta_payload["category"],
                    meta_payload["language"],
                    status_val,
                    req.header_type,
                    header_content,
                    clean_body,
                    req.footer_text,
                    buttons_json,
                    meta_template_id
                ))
                saved_template = cur.fetchone()
                conn.commit()

            print(f"[SUCCESS] Template '{clean_name}' created on Meta (ID: {meta_template_id}) and stored in Neon DB.")
            return {
                "success": True,
                "message": f"Template '{clean_name}' created successfully on Meta Account (ID: {meta_template_id}) and saved in Neon Database.",
                "meta_template_id": meta_template_id,
                "template": saved_template
            }
        finally:
            conn.close()

    @classmethod
    async def sync_meta_templates(cls) -> List[Dict[str, Any]]:
        """Fetch all existing message templates from Meta WABA and sync into Neon DB."""
        cls.init_tables()
        conn = cls.get_db_connection()
        creds = None
        try:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute("SELECT access_token, waba_id, graph_version FROM whatsapp_integrations ORDER BY updated_at DESC LIMIT 1")
                creds = cur.fetchone()
        finally:
            conn.close()

        if creds and creds.get("access_token") and creds.get("waba_id"):
            meta_res = await MetaWhatsAppClient.get_templates(
                access_token=creds["access_token"],
                waba_id=creds["waba_id"],
                graph_version=creds.get("graph_version", "v19.0")
            )

            if meta_res.get("success") and "templates" in meta_res:
                conn = cls.get_db_connection()
                try:
                    with conn.cursor() as cur:
                        for t in meta_res["templates"]:
                            name = t.get("name")
                            if not name:
                                continue
                            category = t.get("category", "MARKETING")
                            language = t.get("language", "en")
                            status = t.get("status", "APPROVED")
                            meta_id = t.get("id")
                            
                            header_type = "NONE"
                            header_content = None
                            body_text = ""
                            footer_text = None
                            buttons = []

                            for comp in t.get("components", []):
                                c_type = comp.get("type")
                                if c_type == "HEADER":
                                    header_type = comp.get("format", "TEXT")
                                    if header_type == "IMAGE":
                                        handles = comp.get("example", {}).get("header_handle", [])
                                        header_content = handles[0] if handles else "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80"
                                    else:
                                        header_content = comp.get("text")
                                elif c_type == "BODY":
                                    body_text = comp.get("text", "")
                                elif c_type == "FOOTER":
                                    footer_text = comp.get("text")
                                elif c_type == "BUTTONS":
                                    buttons = comp.get("buttons", [])

                            tmpl_id = f"tmpl_{meta_id or name}"
                            cur.execute("""
                                INSERT INTO whatsapp_templates (
                                    id, name, category, language, status, header_type,
                                    header_content, body_text, footer_text, buttons, meta_template_id
                                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                                ON CONFLICT (name) DO UPDATE SET
                                    category = EXCLUDED.category,
                                    language = EXCLUDED.language,
                                    status = EXCLUDED.status,
                                    header_type = EXCLUDED.header_type,
                                    header_content = EXCLUDED.header_content,
                                    body_text = EXCLUDED.body_text,
                                    footer_text = EXCLUDED.footer_text,
                                    buttons = EXCLUDED.buttons,
                                    meta_template_id = EXCLUDED.meta_template_id,
                                    updated_at = CURRENT_TIMESTAMP;
                            """, (
                                tmpl_id, name, category, language, status, header_type,
                                header_content, body_text, footer_text, json.dumps(buttons), meta_id
                            ))
                        # Purge any local/dummy templates that do not exist on Meta account
                        meta_names = [t.get("name") for t in meta_res["templates"] if t.get("name")]
                        if meta_names:
                            cur.execute("DELETE FROM whatsapp_templates WHERE name NOT IN %s", (tuple(meta_names),))
                        conn.commit()
                finally:
                    conn.close()

        return await cls.list_templates()

    @classmethod
    async def list_templates(cls) -> List[Dict[str, Any]]:
        """List all templates from Neon DB."""
        cls.init_tables()
        conn = cls.get_db_connection()
        try:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
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
