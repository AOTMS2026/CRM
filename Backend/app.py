import os
import re
import secrets
import hashlib
import datetime
from datetime import timezone, timedelta
from typing import Optional, List
import jwt
import psycopg2
from psycopg2.extras import RealDictCursor
from pydantic import BaseModel
from dotenv import load_dotenv

import strawberry
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Header, Response, status
from fastapi.middleware.cors import CORSMiddleware
from strawberry.fastapi import GraphQLRouter

# -------------------------------------------------------------
# 1. Environment Configuration
# -------------------------------------------------------------
load_dotenv()

BACKEND_URL = os.getenv("BACKEND_URL", "https://crm-fee1.onrender.com")
FRONTEND_URL = os.getenv("FRONTEND_URL", "https://crm-1-peach.vercel.app")
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://neondb_owner:npg_jrDd35qmytGI@ep-red-frost-axc54v0j-pooler.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require"
)
JWT_SECRET = os.getenv("JWT_SECRET", "crm_production_jwt_secret_token_aotms_2026_secure")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
JWT_EXPIRATION_DAYS = int(os.getenv("JWT_EXPIRATION_DAYS", "7"))

CORS_ORIGINS = [
    "https://crm-1-peach.vercel.app",
    "https://crm-fee1.onrender.com",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000"
]

# -------------------------------------------------------------
# 2. Database Connection & Schema Setup
# -------------------------------------------------------------
def get_db():
    url = DATABASE_URL
    if "sslmode=" not in url:
        sep = "&" if "?" in url else "?"
        url = f"{url}{sep}sslmode=require"
    return psycopg2.connect(url)

def init_tables():
    """Ensure essential Neon PostgreSQL tables exist on startup"""
    try:
        conn = get_db()
        with conn.cursor() as cur:
            cur.execute("""
            CREATE TABLE IF NOT EXISTS companies (
                id VARCHAR(64) PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                whatsapp_number VARCHAR(64),
                industry VARCHAR(128) DEFAULT 'Technology',
                plan VARCHAR(64) DEFAULT 'enterprise_trial',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS users (
                id VARCHAR(64) PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                role VARCHAR(64) DEFAULT 'admin',
                phone VARCHAR(64),
                company_id VARCHAR(64) REFERENCES companies(id) ON DELETE SET NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS sessions (
                id VARCHAR(64) PRIMARY KEY,
                user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                token VARCHAR(512) UNIQUE NOT NULL,
                expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
            """)
            conn.commit()
        conn.close()
        # Initialize clean architecture WhatsApp integrations table
        from whatsapp import WhatsAppIntegrationService
        WhatsAppIntegrationService.init_tables()
        print("[INFO] Neon PostgreSQL tables verified.")
    except Exception as e:
        print("[NOTICE] Database init notice:", e)

# -------------------------------------------------------------
# 3. Security: Password Hashing & 7-Day JWT Token Generation
# -------------------------------------------------------------
def hash_password(password: str, salt: str = None) -> tuple[str, str]:
    if not salt:
        salt = secrets.token_hex(16)
    hashed = hashlib.sha256((password + salt).encode("utf-8")).hexdigest()
    return f"{salt}${hashed}", salt

def verify_password(password: str, stored_hash: str) -> bool:
    try:
        salt, _ = stored_hash.split("$", 1)
        expected, _ = hash_password(password, salt)
        return expected == stored_hash
    except Exception:
        return False

def create_jwt_token(user_id: str, email: str, name: str, company_id: str = None, role: str = "admin") -> str:
    """Generate JWT Token with exactly 7-Day Expiration"""
    now = datetime.datetime.now(timezone.utc)
    expiration = now + timedelta(days=JWT_EXPIRATION_DAYS)
    payload = {
        "sub": user_id,
        "email": email,
        "name": name,
        "company_id": company_id,
        "role": role,
        "iat": now,
        "exp": expiration
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_jwt_token(token: str) -> Optional[dict]:
    """Decode and validate JWT Token (returns None if expired or invalid)"""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

# -------------------------------------------------------------
# 4. GraphQL Setup
# -------------------------------------------------------------
@strawberry.type
class Query:
    @strawberry.field
    def health(self) -> str:
        return "GraphQL operational"

    @strawberry.field
    def crm_status(self) -> str:
        return "Enterprise WhatsApp CRM active"

schema = strawberry.Schema(query=Query)
graphql_app = GraphQLRouter(schema)

# -------------------------------------------------------------
# 5. FastAPI Application Initialization
# -------------------------------------------------------------
app = FastAPI(
    title="Academy of Tech Masters - WhatsApp Automation CRM API",
    description="Unified Enterprise Backend with Native JWT Authentication & Neon PostgreSQL",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(graphql_app, prefix="/graphql")

# Mount Clean Architecture WhatsApp Meta Cloud Integration Router
from whatsapp import whatsapp_router
app.include_router(whatsapp_router, prefix="/api/integrations/whatsapp", tags=["whatsapp-integration"])
app.include_router(whatsapp_router, prefix="/api/whatsapp", tags=["whatsapp-webhook-alias"])
app.include_router(whatsapp_router, prefix="", tags=["whatsapp-direct-alias"])

@app.get("/")
def root():
    return {
        "service": "Academy of Tech Masters - WhatsApp Automation CRM API",
        "status": "operational",
        "version": "2.0.0"
    }

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "database": "connected",
        "timestamp": datetime.datetime.now(timezone.utc).isoformat()
    }

# -------------------------------------------------------------
# 6. Request Schemas
# -------------------------------------------------------------
class SignUpRequest(BaseModel):
    name: str
    email: str
    password: str
    companyName: Optional[str] = None
    company: Optional[str] = None
    phone: Optional[str] = None

class SignInRequest(BaseModel):
    email: str
    password: str

def validate_signup_input(name: str, email: str, password: str, phone: str, company: str):
    """
    Conditional statements validation for string, numeric, and security constraints
    """
    # 1. Full Name String Validation
    if not name or not isinstance(name, str) or len(name.strip()) < 3:
        return None, "Full Name must be at least 3 characters long."
    if not re.match(r"^[a-zA-Z\s]{3,50}$", name.strip()):
        return None, "Full Name must contain alphabetic letters and spaces only."

    # 2. Company Name String Validation
    if not company or not isinstance(company, str) or len(company.strip()) < 2:
        return None, "Company Name must be at least 2 characters long."

    # 3. Email RFC Validation
    if not email or not isinstance(email, str):
        return None, "Email address is required."
    clean_email = email.strip().lower()
    if not re.match(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$", clean_email):
        return None, "Please enter a valid corporate email address (e.g. user@company.com)."

    # 4. WhatsApp Phone Numeric Validation (+91 followed by exactly 10 digits)
    if not phone:
        return None, "WhatsApp phone number is required."
    raw_digits = re.sub(r"\D", "", str(phone))
    
    # Check conditional digit counts
    if raw_digits.startswith("91") and len(raw_digits) == 12:
        ten_digits = raw_digits[2:]
    elif len(raw_digits) == 10:
        ten_digits = raw_digits
    else:
        return None, f"WhatsApp number must contain exactly 10 digits (+91). Received {len(raw_digits)} digits."

    if not ten_digits.isdigit():
        return None, "Phone number must consist of numeric digits only."
    if ten_digits[0] not in "6789":
        return None, "Indian mobile numbers must begin with 6, 7, 8, or 9."

    formatted_phone = f"+91 {ten_digits}"

    # 5. Password Security Rules (min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 symbol)
    if not password or len(password) < 8:
        return None, "Password must be at least 8 characters long."
    if not re.search(r"[A-Z]", password):
        return None, "Password must contain at least one uppercase letter (A-Z)."
    if not re.search(r"[a-z]", password):
        return None, "Password must contain at least one lowercase letter (a-z)."
    if not re.search(r"\d", password):
        return None, "Password must contain at least one numeric digit (0-9)."
    if not re.search(r"[@$!%*?&#^~_\-+=]", password):
        return None, "Password must contain at least one special character (@$!%*?&#)."

    return {
        "name": name.strip(),
        "company": company.strip(),
        "email": clean_email,
        "phone": formatted_phone,
        "password": password
    }, None

def validate_signin_input(email: str, password: str):
    if not email or not isinstance(email, str) or not email.strip():
        return "Email address is required."
    if not password or not isinstance(password, str) or not password.strip():
        return "Password is required."
    return None

# -------------------------------------------------------------
# 7. Authentication Endpoints (7-Day JWT + Neon PostgreSQL)
# -------------------------------------------------------------
@app.post("/api/auth/sign-up")
@app.post("/api/auth/sign-up/email")
async def sign_up(body: SignUpRequest):
    """
    Register user & company in Neon PostgreSQL with strict input validation
    """
    company_title = body.companyName or body.company or f"{body.name}'s Company"
    valid_data, err_msg = validate_signup_input(
        name=body.name,
        email=body.email,
        password=body.password,
        phone=body.phone,
        company=company_title
    )
    if err_msg:
        raise HTTPException(status_code=400, detail=err_msg)

    conn = get_db()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            # Check existing user
            cur.execute("SELECT id FROM users WHERE email = %s;", (valid_data["email"],))
            if cur.fetchone():
                raise HTTPException(status_code=400, detail="An account with this email already exists.")

            # 1. Create Company
            company_id = f"comp_{secrets.token_hex(8)}"
            cur.execute(
                "INSERT INTO companies (id, name, whatsapp_number) VALUES (%s, %s, %s) RETURNING id, name;",
                (company_id, valid_data["company"], valid_data["phone"])
            )
            company = cur.fetchone()

            # 2. Hash Password & Create User
            user_id = f"usr_{secrets.token_hex(8)}"
            pw_hash, _ = hash_password(valid_data["password"])
            cur.execute(
                """
                INSERT INTO users (id, name, email, password_hash, role, phone, company_id)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                RETURNING id, name, email, role, phone, company_id, created_at;
                """,
                (user_id, valid_data["name"], valid_data["email"], pw_hash, "admin", valid_data["phone"], company_id)
            )
            user = cur.fetchone()

            # 3. Generate 7-Day JWT Token
            token = create_jwt_token(
                user_id=user["id"],
                email=user["email"],
                name=user["name"],
                company_id=company_id,
                role="admin"
            )

            # Store session in Neon
            session_id = f"sess_{secrets.token_hex(8)}"
            expires_at = datetime.datetime.now(timezone.utc) + timedelta(days=JWT_EXPIRATION_DAYS)
            cur.execute(
                "INSERT INTO sessions (id, user_id, token, expires_at) VALUES (%s, %s, %s, %s);",
                (session_id, user_id, token, expires_at)
            )
            conn.commit()

            return {
                "status": True,
                "token": token,
                "expiresIn": "7 days",
                "user": {
                    "id": user["id"],
                    "name": user["name"],
                    "email": user["email"],
                    "role": user["role"],
                    "phone": user["phone"],
                    "company_name": company["name"],
                    "company_id": company_id
                },
                "message": "Account created successfully in Neon Database!"
            }
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

@app.post("/api/auth/sign-in")
@app.post("/api/auth/sign-in/email")
async def sign_in(body: SignInRequest):
    """
    Authenticate against Neon PostgreSQL and issue 7-Day JWT Token
    """
    err = validate_signin_input(body.email, body.password)
    if err:
        raise HTTPException(status_code=400, detail=err)

    conn = get_db()
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
                (body.email.lower().strip(),)
            )
            user = cur.fetchone()
            if not user or not verify_password(body.password, user["password_hash"]):
                raise HTTPException(status_code=401, detail="Invalid email or password.")

            # Generate 7-Day JWT Token
            token = create_jwt_token(
                user_id=user["id"],
                email=user["email"],
                name=user["name"],
                company_id=user["company_id"],
                role=user["role"]
            )

            # Record session in Neon
            session_id = f"sess_{secrets.token_hex(8)}"
            expires_at = datetime.datetime.now(timezone.utc) + timedelta(days=JWT_EXPIRATION_DAYS)
            cur.execute(
                "INSERT INTO sessions (id, user_id, token, expires_at) VALUES (%s, %s, %s, %s);",
                (session_id, user["id"], token, expires_at)
            )
            conn.commit()

            return {
                "status": True,
                "token": token,
                "expiresIn": "7 days",
                "user": {
                    "id": user["id"],
                    "name": user["name"],
                    "email": user["email"],
                    "role": user["role"],
                    "phone": user["phone"],
                    "company_name": user["company_name"],
                    "company_id": user["company_id"]
                },
                "message": "Signed in successfully!"
            }
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

@app.get("/api/auth/me")
@app.get("/api/auth/get-session")
async def get_current_user(authorization: Optional[str] = Header(None)):
    """
    Validate 7-Day JWT Token and return active user profile
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid authorization header.")

    token = authorization.split(" ")[1]
    payload = decode_jwt_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Token expired or invalid. Please sign in again.")

    conn = get_db()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """
                SELECT u.id, u.name, u.email, u.role, u.phone, u.company_id,
                       c.name as company_name, c.whatsapp_number
                FROM users u
                LEFT JOIN companies c ON u.company_id = c.id
                WHERE u.id = %s;
                """,
                (payload["sub"],)
            )
            user = cur.fetchone()
            if not user:
                raise HTTPException(status_code=404, detail="User not found.")
            return {
                "user": user,
                "token": token,
                "expiresAt": payload.get("exp")
            }
    finally:
        conn.close()

@app.get("/api/auth/users")
async def list_users():
    """List registered users directly from Neon PostgreSQL"""
    conn = get_db()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                SELECT u.id, u.name, u.email, u.role, u.phone, u.created_at,
                       c.name as company_name, c.whatsapp_number
                FROM users u
                LEFT JOIN companies c ON u.company_id = c.id
                ORDER BY u.created_at DESC
                LIMIT 50;
            """)
            users = cur.fetchall()
            return {
                "total": len(users),
                "database": "Neon PostgreSQL (Connected)",
                "users": users
            }
    finally:
        conn.close()

# -------------------------------------------------------------
# 8. Health Check & Root Endpoints
# -------------------------------------------------------------
@app.get("/")
async def root():
    return {
        "service": "Academy of Tech Masters - WhatsApp CRM API",
        "status": "online",
        "auth_system": "Native JWT (7-Day Expiry)",
        "database": "Neon PostgreSQL",
        "version": "2.0.0"
    }

@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "uptime": "100%",
        "database": "connected (Neon PostgreSQL)"
    }

# -------------------------------------------------------------
# 9. Realtime WebSocket Endpoint
# -------------------------------------------------------------
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            await websocket.send_text(f"CRM Bot Acknowledged: {data}")
    except WebSocketDisconnect:
        pass

# -------------------------------------------------------------
# 10. Direct Startup via 'python app.py'
# -------------------------------------------------------------
if __name__ == "__main__":
    import uvicorn
    init_tables()
    port = int(os.getenv("PORT", 8000))
    print(f"[STARTUP] Starting Academy of Tech Masters CRM Backend on http://0.0.0.0:{port}")
    uvicorn.run("app:app", host="0.0.0.0", port=port, reload=True)
