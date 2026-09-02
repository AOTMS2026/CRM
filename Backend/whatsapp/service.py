import os
import secrets
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Optional, Dict, Any

from .models import WhatsAppConfigRequest, WhatsAppConfigResponse
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
        """Create whatsapp_integrations table in Neon PostgreSQL if not exists."""
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
                """)
                conn.commit()
            conn.close()
            print("[INFO] whatsapp_integrations table initialized in Neon DB.")
        except Exception as e:
            print(f"[ERROR] Failed to init whatsapp_integrations table: {e}")

    @classmethod
    async def save_and_connect(
        cls, 
        config: WhatsAppConfigRequest, 
        user_id: Optional[str] = None, 
        company_id: Optional[str] = None
    ) -> WhatsAppConfigResponse:
        """
        1. Query Meta Graph API to verify credentials.
        2. Upsert credentials and account metadata into Neon PostgreSQL database.
        3. Return connection status and metadata.
        """
        cls.init_tables()

        # Step 1: Verify with Meta Graph API
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

        # Step 2: Store in Neon PostgreSQL database
        conn = cls.get_db_connection()
        try:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                # Check if an integration already exists for this phone_number_id or company
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

            # Mask access token for security response
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
        """Fetch current active WhatsApp integration from Neon DB."""
        cls.init_tables()
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
