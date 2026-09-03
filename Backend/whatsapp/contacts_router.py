import os
import re
import secrets
import json
import base64
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor
from pydantic import BaseModel, Field
from fastapi import APIRouter, HTTPException, status, Query, UploadFile, File, Response

from .client import MetaWhatsAppClient

contacts_router = APIRouter()

def get_db_connection():
    database_url = os.getenv(
        "DATABASE_URL",
        "postgresql://neondb_owner:npg_jrDd35qmytGI@ep-red-frost-axc54v0j-pooler.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require"
    )
    if "sslmode=" not in database_url:
        sep = "&" if "?" in database_url else "?"
        database_url = f"{database_url}{sep}sslmode=require"
    return psycopg2.connect(database_url)

def init_contacts_table():
    """Ensure contacts table exists in Neon PostgreSQL."""
    try:
        conn = get_db_connection()
        with conn.cursor() as cur:
            cur.execute("""
            CREATE TABLE IF NOT EXISTS contacts (
                id VARCHAR(64) PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                phone VARCHAR(64) NOT NULL,
                email VARCHAR(255),
                address TEXT,
                image_url TEXT,
                status VARCHAR(64) DEFAULT 'Active',
                read_rate VARCHAR(32) DEFAULT '100%',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
            """)
            conn.commit()
        conn.close()
    except Exception as e:
        print(f"[WARN] Error verifying contacts table schema: {e}")

# Call on import
init_contacts_table()

# -----------------------------------------------------------------------------
# PYDANTIC SCHEMAS
# -----------------------------------------------------------------------------
class ContactCreateRequest(BaseModel):
    name: str = Field(..., description="Contact full name")
    phone: str = Field(..., description="10-digit mobile number")
    email: Optional[str] = Field(None, description="Valid email address")
    address: Optional[str] = Field(None, description="Full residential or business address")
    image_url: Optional[str] = Field(None, description="Meta account profile picture URL or base64")
    status: Optional[str] = Field(default="Active", description="Active, Inactive, VIP")
    read_rate: Optional[str] = Field(default="100%", description="WhatsApp message read rate")

class BulkImportRequest(BaseModel):
    contacts: List[ContactCreateRequest]

# -----------------------------------------------------------------------------
# VALIDATION HELPER
# -----------------------------------------------------------------------------
def validate_contact_data(name: str, phone: str, email: Optional[str] = None):
    if not name or len(name.strip()) < 2:
        return None, "Contact Name must be at least 2 characters long."

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

# -----------------------------------------------------------------------------
# ENDPOINTS
# -----------------------------------------------------------------------------
@contacts_router.get("")
def list_contacts(search: Optional[str] = None):
    """List all contacts from Neon PostgreSQL."""
    init_contacts_table()
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            query = "SELECT * FROM contacts WHERE 1=1"
            params = []

            if search and isinstance(search, str) and search.strip():
                query += " AND (name ILIKE %s OR phone ILIKE %s OR email ILIKE %s OR address ILIKE %s)"
                term = f"%{search.strip()}%"
                params.extend([term, term, term, term])

            query += " ORDER BY created_at DESC"
            cur.execute(query, tuple(params))
            rows = cur.fetchall()

            # Seed demo contacts if empty
            if len(rows) == 0 and not search:
                seed_demo_contacts(conn)
                cur.execute(query, tuple(params))
                rows = cur.fetchall()

            return {
                "success": True,
                "count": len(rows),
                "contacts": [dict(r) for r in rows]
            }
    finally:
        conn.close()

def seed_demo_contacts(conn):
    """Seed sample contacts with Meta images."""
    demos = [
        ("Aotms Admin Contact", "+91 80199 74443", "contact@aotms.com", "Hitech City, Hyderabad, Telangana", "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150", "Active", "100%"),
        ("Vikramaditya Verma", "+91 98111 22233", "vikram@enterprise.in", "Cyber City, Gurugram, Haryana", "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150", "Active", "98%"),
        ("Ananya Sharma", "+91 97222 33344", "ananya@techleaders.org", "Koramangala, Bengaluru, Karnataka", "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150", "VIP", "100%")
    ]
    with conn.cursor() as cur:
        for d in demos:
            cid = f"contact_{secrets.token_hex(8)}"
            cur.execute("""
                INSERT INTO contacts (id, name, phone, email, address, image_url, status, read_rate)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """, (cid, d[0], d[1], d[2], d[3], d[4], d[5], d[6]))
        conn.commit()

@contacts_router.post("")
def create_contact(req: ContactCreateRequest):
    """Create a new contact in Neon DB with strict 10-digit phone & image URL."""
    init_contacts_table()
    validated, err = validate_contact_data(req.name, req.phone, req.email)
    if err:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=err)

    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            # Check duplicate
            cur.execute("SELECT id, name FROM contacts WHERE phone ILIKE %s LIMIT 1", (f"%{validated['clean_phone_digits']}%",))
            existing = cur.fetchone()
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Contact with phone {validated['phone']} already exists ({existing['name']})."
                )

            cid = f"contact_{secrets.token_hex(8)}"
            cur.execute("""
                INSERT INTO contacts (id, name, phone, email, address, image_url, status, read_rate)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING *;
            """, (
                cid,
                validated["name"],
                validated["phone"],
                validated["email"],
                req.address.strip() if req.address else None,
                req.image_url,
                req.status or "Active",
                req.read_rate or "100%"
            ))
            new_contact = cur.fetchone()
            conn.commit()

            return {
                "success": True,
                "message": f"Contact '{validated['name']}' saved successfully.",
                "contact": dict(new_contact)
            }
    finally:
        conn.close()

@contacts_router.post("/import-excel")
def import_excel_contacts(req: BulkImportRequest):
    """Bulk import contacts parsed from uploaded Excel / CSV sheet into Neon DB."""
    init_contacts_table()
    if not req.contacts:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No contacts provided in import payload.")

    conn = get_db_connection()
    imported_count = 0
    skipped_count = 0
    errors = []

    try:
        with conn.cursor() as cur:
            for item in req.contacts:
                val, err = validate_contact_data(item.name, item.phone, item.email)
                if err:
                    skipped_count += 1
                    errors.append(f"Skipped {item.name or 'Unknown'}: {err}")
                    continue

                # Check duplicate
                cur.execute("SELECT id FROM contacts WHERE phone ILIKE %s LIMIT 1", (f"%{val['clean_phone_digits']}%",))
                if cur.fetchone():
                    skipped_count += 1
                    continue

                cid = f"contact_{secrets.token_hex(8)}"
                cur.execute("""
                    INSERT INTO contacts (id, name, phone, email, address, image_url, status, read_rate)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                """, (
                    cid,
                    val["name"],
                    val["phone"],
                    val["email"],
                    item.address,
                    item.image_url,
                    item.status or "Active",
                    item.read_rate or "100%"
                ))
                imported_count += 1
            conn.commit()

        return {
            "success": True,
            "imported_count": imported_count,
            "skipped_count": skipped_count,
            "errors": errors,
            "message": f"Successfully imported {imported_count} contacts from Excel sheet."
        }
    finally:
        conn.close()

@contacts_router.get("/download-sample-csv")
def download_sample_csv():
    """Generates a downloadable demo CSV Excel template file for bulk contact imports."""
    csv_content = (
        "Name,Phone,Email,Address,Status,ReadRate\n"
        "Dr. Srinivas Rao,9845011223,srinivas@apollohospitals.com,\"Jubilee Hills, Hyderabad\",Active,100%\n"
        "Priya Kulkarni,9876543210,priya@fintechlabs.in,\"BKC, Mumbai\",VIP,98%\n"
        "Arjun Mehra,9988766554,arjun@edutechskills.org,\"Noida Sector 62\",Active,95%\n"
        "Deepa Patel,9823456789,deepa@pateljewels.com,\"Zaveri Bazaar, Mumbai\",Active,100%\n"
    )
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=whatsapp_contacts_sample_template.csv"}
    )

@contacts_router.delete("/{contact_id}")
def delete_contact(contact_id: str):
    """Delete contact from Neon DB."""
    init_contacts_table()
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("DELETE FROM contacts WHERE id = %s RETURNING id, name;", (contact_id,))
            row = cur.fetchone()
            if not row:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contact not found.")
            conn.commit()
            return {"success": True, "message": f"Contact '{row[1]}' deleted successfully."}
    finally:
        conn.close()
