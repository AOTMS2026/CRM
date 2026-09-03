import os
import re
import secrets
import json
import asyncio
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor
from pydantic import BaseModel, Field
from fastapi import APIRouter, HTTPException, status, Query

from .client import MetaWhatsAppClient

leads_router = APIRouter()

def get_db_connection():
    database_url = os.getenv(
        "DATABASE_URL",
        "postgresql://neondb_owner:npg_jrDd35qmytGI@ep-red-frost-axc54v0j-pooler.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require"
    )
    if "sslmode=" not in database_url:
        sep = "&" if "?" in database_url else "?"
        database_url = f"{database_url}{sep}sslmode=require"
    return psycopg2.connect(database_url)

def init_leads_table():
    """Ensure leads table has address, status, and read_rate columns in Neon PostgreSQL."""
    try:
        conn = get_db_connection()
        with conn.cursor() as cur:
            cur.execute("""
            CREATE TABLE IF NOT EXISTS leads (
                id VARCHAR(64) PRIMARY KEY,
                company_id VARCHAR(64) DEFAULT 'comp_aotms_2026',
                name VARCHAR(255) NOT NULL,
                phone VARCHAR(64) NOT NULL,
                email VARCHAR(255),
                address TEXT,
                status VARCHAR(64) DEFAULT 'Inquiries',
                pipeline_stage VARCHAR(64) DEFAULT 'Inquiries',
                read_rate VARCHAR(32) DEFAULT '95%',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
            
            ALTER TABLE leads ALTER COLUMN company_id DROP NOT NULL;
            ALTER TABLE leads ALTER COLUMN company_id SET DEFAULT 'comp_aotms_2026';
            ALTER TABLE leads ADD COLUMN IF NOT EXISTS address TEXT;
            ALTER TABLE leads ADD COLUMN IF NOT EXISTS status VARCHAR(64) DEFAULT 'Inquiries';
            ALTER TABLE leads ADD COLUMN IF NOT EXISTS read_rate VARCHAR(32) DEFAULT '95%';
            """)
            conn.commit()
        conn.close()
    except Exception as e:
        print(f"[WARN] Error verifying leads table schema: {e}")

# Call on import
init_leads_table()

# -----------------------------------------------------------------------------
# PYDANTIC SCHEMAS
# -----------------------------------------------------------------------------
class LeadCreateRequest(BaseModel):
    name: str = Field(..., description="Lead full name")
    phone: str = Field(..., description="10-digit mobile number")
    email: Optional[str] = Field(None, description="Valid email address")
    address: Optional[str] = Field(None, description="Full residential or business address")
    status: Optional[str] = Field(default="Inquiries", description="Inquiries, Demo, Enrolled")
    pipeline_stage: Optional[str] = Field(default="Inquiries", description="Inquiries, Demo, Enrolled")
    read_rate: Optional[str] = Field(default="95%", description="WhatsApp message read rate percentage")

class LeadUpdateRequest(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    status: Optional[str] = None
    pipeline_stage: Optional[str] = None
    read_rate: Optional[str] = None

class BatchDeleteRequest(BaseModel):
    lead_ids: List[str]

class WhatsAppBlastRequest(BaseModel):
    template_name: str
    language: Optional[str] = "en_US"
    lead_ids: List[str]
    sample_values: Optional[List[str]] = None

# -----------------------------------------------------------------------------
# VALIDATION HELPER (Strict 10-Digit Mobile & Email)
# -----------------------------------------------------------------------------
def validate_lead_data(name: str, phone: str, email: Optional[str] = None):
    # 1. Full Name check
    if not name or len(name.strip()) < 2:
        return None, "Lead Name must be at least 2 characters long."

    # 2. Strict 10-digit Indian Mobile Validation
    raw_digits = re.sub(r"\D", "", str(phone))
    if raw_digits.startswith("91") and len(raw_digits) == 12:
        ten_digits = raw_digits[2:]
    elif len(raw_digits) == 10:
        ten_digits = raw_digits
    else:
        return None, f"Mobile number must contain exactly 10 numeric digits. Received {len(raw_digits)} digits."

    if not ten_digits.isdigit():
        return None, "Mobile number must consist of numeric digits only."
    if ten_digits[0] not in "6789":
        return None, "Indian mobile numbers must begin with 6, 7, 8, or 9."

    formatted_phone = f"+91 {ten_digits}"

    # 3. RFC Email Validation (if provided)
    clean_email = None
    if email and email.strip():
        clean_email = email.strip().lower()
        if not re.match(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$", clean_email):
            return None, "Please enter a valid email address (e.g., name@domain.com)."

    return {
        "name": name.strip(),
        "phone": formatted_phone,
        "clean_phone_digits": ten_digits,
        "email": clean_email
    }, None

def get_default_company_id(cur):
    """Retrieve an existing company_id from companies table to satisfy FK constraint."""
    try:
        cur.execute("SELECT id FROM companies LIMIT 1;")
        row = cur.fetchone()
        if row:
            return row["id"] if isinstance(row, dict) else row[0]
    except Exception:
        pass
    return "comp_65e0f9f382dfc0dc00e4"

# -----------------------------------------------------------------------------
# ENDPOINTS
# -----------------------------------------------------------------------------
@leads_router.get("")
def list_leads(
    search: Optional[str] = None,
    stage: Optional[str] = None,
    status_filter: Optional[str] = None
):
    """Retrieve all leads from Neon PostgreSQL filtered by Inquiries, Demo, Enrolled."""
    init_leads_table()
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            query = "SELECT * FROM leads WHERE 1=1"
            params = []

            stg = stage or status_filter
            if stg and isinstance(stg, str) and stg.upper() != "ALL":
                query += " AND (UPPER(status) = %s OR UPPER(pipeline_stage) = %s)"
                params.extend([stg.upper(), stg.upper()])

            if search and isinstance(search, str) and search.strip():
                query += " AND (name ILIKE %s OR phone ILIKE %s OR email ILIKE %s OR address ILIKE %s)"
                term = f"%{search.strip()}%"
                params.extend([term, term, term, term])

            query += " ORDER BY created_at DESC"
            cur.execute(query, tuple(params))
            rows = cur.fetchall()

            # Seed demo leads if empty
            if len(rows) == 0 and not search and (not stg or stg == "ALL"):
                seed_demo_leads(conn)
                cur.execute(query, tuple(params))
                rows = cur.fetchall()

            leads_list = [dict(r) for r in rows]
            return {
                "success": True,
                "count": len(leads_list),
                "leads": leads_list
            }
    finally:
        conn.close()

def seed_demo_leads(conn):
    """Seed clean demo leads with Inquiries, Demo, Enrolled statuses."""
    demos = [
        ("Dr. Srinivas Rao", "+91 98450 11223", "srinivas@apollohospitals.com", "Road No. 12, Jubilee Hills, Hyderabad", "Inquiries", "94%"),
        ("Priya Kulkarni", "+91 98765 43210", "priya@fintechlabs.in", "Bandra Kurla Complex, Mumbai, Maharashtra", "Demo", "98%"),
        ("Arjun Mehra", "+91 99887 66554", "arjun@edutechskills.org", "Sector 62, Noida, Uttar Pradesh", "Inquiries", "88%"),
        ("Sanjay Dutt", "+91 97665 44332", "sanjay@duttenterprises.com", "MG Road, Bengaluru, Karnataka", "Demo", "96%"),
        ("Deepa Patel", "+91 98234 56789", "deepa@pateljewels.com", "Zaveri Bazaar, Mumbai, Maharashtra", "Enrolled", "100%")
    ]
    with conn.cursor() as cur:
        comp_id = get_default_company_id(cur)
        for d in demos:
            lid = f"lead_{secrets.token_hex(8)}"
            cur.execute("""
                INSERT INTO leads (id, company_id, name, phone, email, address, status, pipeline_stage, read_rate)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (lid, comp_id, d[0], d[1], d[2], d[3], d[4], d[4], d[5]))
        conn.commit()

@leads_router.post("")
def create_lead(req: LeadCreateRequest):
    """Create a new lead with strict 10-digit phone, email, address, status (Inquiries, Demo, Enrolled)."""
    init_leads_table()
    validated, err = validate_lead_data(req.name, req.phone, req.email)
    if err:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=err)

    status_val = req.status or req.pipeline_stage or "Inquiries"
    if status_val not in ["Inquiries", "Demo", "Enrolled"]:
        status_val = "Inquiries"

    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            comp_id = get_default_company_id(cur)

            # Check duplicate by phone number (last 10 digits)
            cur.execute("SELECT id, name FROM leads WHERE phone ILIKE %s OR phone ILIKE %s LIMIT 1", (
                f"%{validated['clean_phone_digits']}%",
                validated["phone"]
            ))
            existing = cur.fetchone()
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Duplicate lead detected: A contact with phone {validated['phone']} already exists ({existing['name']})."
                )

            lead_id = f"lead_{secrets.token_hex(8)}"
            read_rate_val = req.read_rate or "95%"

            cur.execute("""
                INSERT INTO leads (
                    id, company_id, name, phone, email, address, status, pipeline_stage, read_rate
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING *;
            """, (
                lead_id,
                comp_id,
                validated["name"],
                validated["phone"],
                validated["email"],
                req.address.strip() if req.address else None,
                status_val,
                status_val,
                read_rate_val
            ))
            new_lead = cur.fetchone()
            conn.commit()

            return {
                "success": True,
                "message": f"Lead '{validated['name']}' created successfully.",
                "lead": dict(new_lead)
            }
    finally:
        conn.close()

@leads_router.put("/{lead_id}")
def update_lead(lead_id: str, req: LeadUpdateRequest):
    """Update lead details."""
    init_leads_table()
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("SELECT * FROM leads WHERE id = %s", (lead_id,))
            existing = cur.fetchone()
            if not existing:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead not found.")

            update_fields = []
            params = []

            if req.name is not None:
                update_fields.append("name = %s")
                params.append(req.name.strip())

            if req.phone is not None:
                raw = re.sub(r"\D", "", req.phone)
                digits = raw[2:] if (raw.startswith("91") and len(raw) == 12) else raw
                if len(digits) == 10:
                    update_fields.append("phone = %s")
                    params.append(f"+91 {digits}")

            if req.email is not None:
                update_fields.append("email = %s")
                params.append(req.email.strip().lower() if req.email else None)

            if req.address is not None:
                update_fields.append("address = %s")
                params.append(req.address.strip() if req.address else None)

            stg = req.status or req.pipeline_stage
            if stg is not None:
                update_fields.append("status = %s")
                update_fields.append("pipeline_stage = %s")
                params.extend([stg, stg])

            if req.read_rate is not None:
                update_fields.append("read_rate = %s")
                params.append(req.read_rate)

            if not update_fields:
                return {"success": True, "lead": dict(existing)}

            update_fields.append("updated_at = CURRENT_TIMESTAMP")
            params.append(lead_id)

            sql = f"UPDATE leads SET {', '.join(update_fields)} WHERE id = %s RETURNING *;"
            cur.execute(sql, tuple(params))
            updated = cur.fetchone()
            conn.commit()

            return {
                "success": True,
                "message": "Lead updated successfully.",
                "lead": dict(updated)
            }
    finally:
        conn.close()

@leads_router.delete("/{lead_id}")
def delete_lead(lead_id: str):
    """Delete a lead from Neon DB."""
    init_leads_table()
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("DELETE FROM leads WHERE id = %s RETURNING id, name;", (lead_id,))
            row = cur.fetchone()
            if not row:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead not found.")
            conn.commit()
            return {"success": True, "message": f"Lead '{row[1]}' deleted successfully."}
    finally:
        conn.close()

@leads_router.post("/deduplicate")
def deduplicate_leads():
    """Remove duplicate leads by phone or email."""
    init_leads_table()
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("SELECT id, name, phone, email, created_at FROM leads ORDER BY created_at DESC;")
            all_leads = cur.fetchall()

            seen_phones = set()
            seen_emails = set()
            duplicate_ids = []

            for lead in all_leads:
                raw_phone = re.sub(r"\D", "", lead["phone"] or "")
                phone_key = raw_phone[-10:] if len(raw_phone) >= 10 else raw_phone
                email_key = (lead["email"] or "").strip().lower()

                is_dup = False
                if phone_key and phone_key in seen_phones:
                    is_dup = True
                if email_key and email_key in seen_emails:
                    is_dup = True

                if is_dup:
                    duplicate_ids.append(lead["id"])
                else:
                    if phone_key:
                        seen_phones.add(phone_key)
                    if email_key:
                        seen_emails.add(email_key)

            if duplicate_ids:
                cur.execute("DELETE FROM leads WHERE id = ANY(%s);", (duplicate_ids,))
                conn.commit()

            return {
                "success": True,
                "duplicates_removed": len(duplicate_ids),
                "remaining_leads": len(all_leads) - len(duplicate_ids),
                "message": f"Successfully removed {len(duplicate_ids)} duplicate lead records."
            }
    finally:
        conn.close()

class SingleWhatsAppTestRequest(BaseModel):
    phone: str
    template_name: Optional[str] = "hello_world"
    language: Optional[str] = None

@leads_router.post("/send-single-whatsapp")
async def send_single_whatsapp_test(req: SingleWhatsAppTestRequest):
    """Send a live WhatsApp test message to a single mobile number (e.g., 7995232673)."""
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("SELECT access_token, phone_number_id, waba_id, graph_version FROM whatsapp_integrations ORDER BY updated_at DESC LIMIT 1;")
            integration = cur.fetchone()
            
            # Look up template metadata from whatsapp_templates
            cur.execute("SELECT name, language, header_type, header_content, body_text FROM whatsapp_templates WHERE name = %s LIMIT 1;", (req.template_name,))
            tmpl_row = cur.fetchone()
    finally:
        conn.close()

    if not integration or not integration.get("access_token") or not integration.get("phone_number_id"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No active Meta WhatsApp integration found. Please connect your credentials under Integrations tab."
        )

    access_token = integration["access_token"]
    phone_number_id = integration["phone_number_id"]
    waba_id = integration.get("waba_id")
    graph_version = integration.get("graph_version", "v21.0")

    # Fetch live Meta template metadata if available
    meta_meta = await MetaWhatsAppClient.get_templates(access_token, waba_id, graph_version)
    target_tmpl = None
    if meta_meta.get("success") and isinstance(meta_meta.get("templates"), list):
        for t in meta_meta["templates"]:
            if t.get("name") == req.template_name:
                target_tmpl = t
                break

    # Force exact language registered on Meta WABA (e.g. 'en' for aotms/testing, 'en_US' for ao/fresh_meat/hello_world)
    lang = (target_tmpl.get("language") if target_tmpl else None) or (tmpl_row.get("language") if tmpl_row else None) or req.language or "en_US"
    header_img = None
    body_params = []

    if target_tmpl:
        for comp in target_tmpl.get("components", []):
            if comp.get("type") == "HEADER" and comp.get("format") == "IMAGE":
                header_img = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80"
                ex = comp.get("example", {})
                handles = ex.get("header_handle", [])
                if tmpl_row and tmpl_row.get("header_content") and tmpl_row["header_content"].startswith("http") and "scontent.whatsapp.net" not in tmpl_row["header_content"]:
                    header_img = tmpl_row["header_content"]
                elif handles and len(handles) > 0 and handles[0].startswith("http"):
                    header_img = handles[0]
            if comp.get("type") == "BODY":
                body_txt = comp.get("text", "")
                if "{{1}}" in body_txt and "{{2}}" in body_txt:
                    body_params = ["Test User", "AOTMS2026"]
                elif "{{1}}" in body_txt:
                    body_params = ["Test User"]
    elif tmpl_row:
        if tmpl_row.get("header_type") == "IMAGE" and tmpl_row.get("header_content"):
            header_img = tmpl_row["header_content"]

    result = await MetaWhatsAppClient.send_template_message(
        access_token=access_token,
        phone_number_id=phone_number_id,
        to_phone=req.phone,
        template_name=req.template_name,
        language_code=lang,
        body_parameters=body_params,
        header_image_url=header_img,
        graph_version=graph_version
    )

    if result.get("success"):
        return {
            "success": True,
            "message": f"Test WhatsApp message sent successfully to +91 {req.phone}!",
            "message_id": result.get("message_id"),
            "details": result
        }
    else:
        return {
            "success": False,
            "error": result.get("error", "Failed to send test WhatsApp message."),
            "details": result
        }

@leads_router.post("/whatsapp-blast")
async def trigger_whatsapp_blast(req: WhatsAppBlastRequest):
    """Trigger WhatsApp Blast via Meta Cloud API for selected leads or contacts."""
    init_leads_table()
    if not req.lead_ids:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No recipients selected for WhatsApp blast.")

    conn = get_db_connection()
    integration = None
    recipients_to_send = []

    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("SELECT access_token, phone_number_id, waba_id, graph_version FROM whatsapp_integrations ORDER BY updated_at DESC LIMIT 1;")
            integration = cur.fetchone()

            # Search in leads
            cur.execute("SELECT id, name, phone, email, address FROM leads WHERE id = ANY(%s);", (req.lead_ids,))
            recipients_to_send = cur.fetchall()

            # If some IDs not found in leads, search in contacts
            found_ids = {r["id"] for r in recipients_to_send}
            missing_ids = [i for i in req.lead_ids if i not in found_ids]
            if missing_ids:
                cur.execute("SELECT id, name, phone, email, address FROM contacts WHERE id = ANY(%s);", (missing_ids,))
                more_contacts = cur.fetchall()
                recipients_to_send.extend(more_contacts)
    finally:
        conn.close()

    if not integration or not integration.get("access_token") or not integration.get("phone_number_id"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No active Meta WhatsApp integration found. Please connect your credentials under Integrations tab."
        )

    access_token = integration["access_token"]
    phone_number_id = integration["phone_number_id"]
    waba_id = integration.get("waba_id")
    graph_version = integration.get("graph_version", "v21.0")

    # Fetch live Meta template metadata
    meta_meta = await MetaWhatsAppClient.get_templates(access_token, waba_id, graph_version)
    target_tmpl = None
    if meta_meta.get("success") and isinstance(meta_meta.get("templates"), list):
        for t in meta_meta["templates"]:
            if t.get("name") == req.template_name:
                target_tmpl = t
                break

    # Prioritize exact language registered on Meta WABA (e.g. 'en' for aotms/testing, 'en_US' for ao/fresh_meat/hello_world)
    lang = (target_tmpl.get("language") if target_tmpl else None) or req.language or "en_US"
    header_img = None
    expects_params_count = 0

    if target_tmpl:
        for comp in target_tmpl.get("components", []):
            if comp.get("type") == "HEADER" and comp.get("format") == "IMAGE":
                header_img = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80"
                ex = comp.get("example", {})
                handles = ex.get("header_handle", [])
                if handles and len(handles) > 0 and handles[0].startswith("http"):
                    header_img = handles[0]
            if comp.get("type") == "BODY":
                body_txt = comp.get("text", "")
                if "{{1}}" in body_txt and "{{2}}" in body_txt:
                    expects_params_count = 2
                elif "{{1}}" in body_txt:
                    expects_params_count = 1

    successful_count = 0
    failed_count = 0
    dispatch_logs = []

    for r in recipients_to_send:
        r_name = r.get("name", "Valued Client")
        clean_phone = "".join(filter(str.isdigit, r.get("phone", "")))
        if clean_phone.endswith("8019974443"):
            dispatch_logs.append({
                "lead_id": r["id"],
                "lead_name": r_name,
                "phone": r["phone"],
                "status": "SKIPPED",
                "message": "Cannot send blast to your own WhatsApp Business sender number."
            })
            continue

        params = []
        if expects_params_count == 1:
            params = [r_name]
        elif expects_params_count == 2:
            params = [r_name, "AOTMS2026"]

        result = await MetaWhatsAppClient.send_template_message(
            access_token=access_token,
            phone_number_id=phone_number_id,
            to_phone=r["phone"],
            template_name=req.template_name,
            language_code=lang,
            body_parameters=params,
            header_image_url=header_img,
            graph_version=graph_version
        )

        if result.get("success"):
            successful_count += 1
            dispatch_logs.append({
                "lead_id": r["id"],
                "lead_name": r_name,
                "phone": r["phone"],
                "status": "SENT",
                "message_id": result.get("message_id")
            })
        else:
            failed_count += 1
            dispatch_logs.append({
                "lead_id": r["id"],
                "lead_name": r_name,
                "phone": r["phone"],
                "status": "FAILED",
                "error": result.get("error", "Meta delivery failed")
            })

    return {
        "success": True,
        "template": req.template_name,
        "total_attempted": len(recipients_to_send),
        "successful": successful_count,
        "failed": failed_count,
        "logs": dispatch_logs,
        "message": f"WhatsApp Blast Completed: {successful_count} sent successfully, {failed_count} failed."
    }
