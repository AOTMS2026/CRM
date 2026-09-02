import os
import hashlib
import secrets
import datetime
import psycopg2
from psycopg2.extras import RealDictCursor
from app.core.config import settings

# Clean connection string for psycopg2 (strip query params that might interfere if needed)
def get_db_connection():
    # settings.DATABASE_URL from Backend/.env
    url = settings.DATABASE_URL
    # Ensure sslmode=require for Neon
    if "sslmode=" not in url:
        sep = "&" if "?" in url else "?"
        url = f"{url}{sep}sslmode=require"
    return psycopg2.connect(url)

def hash_password(password: str, salt: str = None) -> tuple[str, str]:
    """Secure SHA-256 password hashing with salt"""
    if not salt:
        salt = secrets.token_hex(16)
    hashed = hashlib.sha256((password + salt).encode('utf-8')).hexdigest()
    return f"{salt}${hashed}", salt

def verify_password(password: str, stored_hash: str) -> bool:
    """Verify password against stored salt$hash"""
    try:
        salt, _ = stored_hash.split('$', 1)
        expected, _ = hash_password(password, salt)
        return expected == stored_hash
    except Exception:
        return False

def create_user_and_company(name: str, email: str, password: str, company_name: str = None, phone: str = None):
    """
    Creates Company, User, Account, and initial Session in Neon PostgreSQL
    """
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            # 1. Check if user already exists
            cur.execute("SELECT id, email FROM users WHERE email = %s;", (email.lower().strip(),))
            if cur.fetchone():
                return None, "User with this email already exists."

            # 2. Create Company
            company_id = f"comp_{secrets.token_hex(10)}"
            c_name = company_name if company_name else f"{name}'s Workspace"
            cur.execute(
                "INSERT INTO companies (id, name, whatsapp_number) VALUES (%s, %s, %s) RETURNING id, name;",
                (company_id, c_name, phone)
            )
            company = cur.fetchone()

            # 3. Hash Password & Create User
            user_id = f"usr_{secrets.token_hex(10)}"
            pw_hash, _ = hash_password(password)
            cur.execute(
                """
                INSERT INTO users (id, name, email, password_hash, role, phone, company_id)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                RETURNING id, name, email, role, phone, company_id, created_at;
                """,
                (user_id, name, email.lower().strip(), pw_hash, "admin", phone, company_id)
            )
            user = cur.fetchone()

            # 4. Create Account record (Better Auth credential provider)
            account_id = f"acc_{secrets.token_hex(10)}"
            cur.execute(
                """
                INSERT INTO accounts (id, user_id, account_id, provider_id, password)
                VALUES (%s, %s, %s, %s, %s);
                """,
                (account_id, user_id, email.lower().strip(), "credential", pw_hash)
            )

            # 5. Create Session (Valid for 30 days)
            session_token = f"sess_{secrets.token_urlsafe(32)}"
            expires_at = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=30)
            session_id = f"s_{secrets.token_hex(10)}"
            cur.execute(
                """
                INSERT INTO sessions (id, user_id, token, expires_at)
                VALUES (%s, %s, %s, %s)
                RETURNING id, token, expires_at;
                """,
                (session_id, user_id, session_token, expires_at)
            )
            session = cur.fetchone()

            conn.commit()
            return {
                "user": user,
                "company": company,
                "session": session,
                "token": session_token
            }, None
    except Exception as e:
        conn.rollback()
        return None, str(e)
    finally:
        conn.close()

def authenticate_user(email: str, password: str):
    """
    Validates email & password in Neon PostgreSQL and issues a new session
    """
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """
                SELECT u.id, u.name, u.email, u.password_hash, u.role, u.phone, u.company_id,
                       c.name as company_name, c.whatsapp_number
                FROM users u
                LEFT JOIN companies c ON u.company_id = c.id
                WHERE u.email = %s;
                """,
                (email.lower().strip(),)
            )
            user = cur.fetchone()
            if not user:
                return None, "Invalid email or password."

            if not verify_password(password, user["password_hash"]):
                return None, "Invalid email or password."

            # Create new Session
            session_token = f"sess_{secrets.token_urlsafe(32)}"
            expires_at = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=30)
            session_id = f"s_{secrets.token_hex(10)}"
            cur.execute(
                """
                INSERT INTO sessions (id, user_id, token, expires_at)
                VALUES (%s, %s, %s, %s)
                RETURNING id, token, expires_at;
                """,
                (session_id, user["id"], session_token, expires_at)
            )
            session = cur.fetchone()
            conn.commit()

            # Remove sensitive hash before returning
            del user["password_hash"]
            return {
                "user": user,
                "session": session,
                "token": session_token
            }, None
    except Exception as e:
        conn.rollback()
        return None, str(e)
    finally:
        conn.close()

def get_session_user(token: str):
    """
    Validates token and returns user from Neon PostgreSQL
    """
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """
                SELECT s.id as session_id, s.token, s.expires_at,
                       u.id as user_id, u.name, u.email, u.role, u.phone, u.company_id,
                       c.name as company_name, c.whatsapp_number
                FROM sessions s
                JOIN users u ON s.user_id = u.id
                LEFT JOIN companies c ON u.company_id = c.id
                WHERE s.token = %s AND s.expires_at > CURRENT_TIMESTAMP;
                """,
                (token,)
            )
            row = cur.fetchone()
            return row
    finally:
        conn.close()

def list_all_users():
    """
    Debug & admin helper to inspect stored users in Neon
    """
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """
                SELECT u.id, u.name, u.email, u.role, u.phone, u.created_at,
                       c.name as company_name, c.whatsapp_number
                FROM users u
                LEFT JOIN companies c ON u.company_id = c.id
                ORDER BY u.created_at DESC
                LIMIT 50;
                """
            )
            return cur.fetchall()
    finally:
        conn.close()
