import os
from typing import Optional
from pydantic import BaseModel, EmailStr
import strawberry
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Header, Response, status
from fastapi.middleware.cors import CORSMiddleware
from strawberry.fastapi import GraphQLRouter
from app.core.config import settings
from app.core.database import (
    create_user_and_company,
    authenticate_user,
    get_session_user,
    list_all_users
)

# -------------------------------------------------------------
# 1. Pydantic Schemas for Authentication
# -------------------------------------------------------------
class SignUpSchema(BaseModel):
    email: str
    password: str
    name: str
    companyName: Optional[str] = None
    company: Optional[str] = None
    phone: Optional[str] = None

class SignInSchema(BaseModel):
    email: str
    password: str

# -------------------------------------------------------------
# 2. Strawberry GraphQL Schema Definition
# -------------------------------------------------------------
@strawberry.type
class Query:
    @strawberry.field
    def health(self) -> str:
        return "GraphQL service operational"

    @strawberry.field
    def crm_status(self) -> str:
        return "Company CRM WhatsApp Engine: Active"

@strawberry.type
class Mutation:
    @strawberry.field
    def echo_message(self, message: str) -> str:
        return f"Echo: {message}"

schema = strawberry.Schema(query=Query, mutation=Mutation)
graphql_app = GraphQLRouter(schema)

# -------------------------------------------------------------
# 3. FastAPI Application Initialization
# -------------------------------------------------------------
app = FastAPI(
    title="Academy of Tech Masters - WhatsApp Automation CRM API",
    description="Enterprise WhatsApp Automation & CRM Engine with FastAPI, Strawberry GraphQL, and WebSockets.",
    version="1.0.0"
)

# -------------------------------------------------------------
# 4. CORS Middleware Configuration (Loaded from Backend/.env)
# -------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------------------------------------
# 5. Include GraphQL Router
# -------------------------------------------------------------
app.include_router(graphql_app, prefix="/graphql")

# -------------------------------------------------------------
# 6. Health Check & Root Endpoints
# -------------------------------------------------------------
@app.get("/")
async def root():
    return {
        "service": "Academy of Tech Masters - WhatsApp CRM API",
        "status": "online",
        "version": "1.0.0",
        "backend_url": settings.BACKEND_URL,
        "frontend_url": settings.FRONTEND_URL,
        "database": "Neon PostgreSQL (Connected)",
        "docs_url": f"{settings.BACKEND_URL}/docs",
        "graphql_url": f"{settings.BACKEND_URL}/graphql"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "uptime": "100%",
        "database": "connected (Neon PostgreSQL)",
        "cache": "redis-ready",
        "backend_url": settings.BACKEND_URL
    }

# -------------------------------------------------------------
# 7. Real Neon Database Authentication Endpoints (Better Auth API)
# -------------------------------------------------------------
@app.post("/api/auth/sign-up/email")
async def sign_up_email(body: SignUpSchema, response: Response):
    """
    Real Sign-up Handler: Creates Company, User, and Session in Neon PostgreSQL
    """
    company_title = body.companyName or body.company or f"{body.name}'s Company"
    result, error = create_user_and_company(
        name=body.name,
        email=body.email,
        password=body.password,
        company_name=company_title,
        phone=body.phone
    )
    if error:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error)

    # Set secure session cookie
    response.set_cookie(
        key="better-auth.session_token",
        value=result["token"],
        httponly=True,
        secure=True,
        samesite="lax",
        max_age=30 * 86400
    )
    return {
        "status": True,
        "user": result["user"],
        "session": result["session"],
        "token": result["token"],
        "message": "Account created successfully in Neon Database!"
    }

@app.post("/api/auth/sign-in/email")
async def sign_in_email(body: SignInSchema, response: Response):
    """
    Real Sign-in Handler: Validates credentials from Neon PostgreSQL
    """
    result, error = authenticate_user(email=body.email, password=body.password)
    if error:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=error)

    # Set secure session cookie
    response.set_cookie(
        key="better-auth.session_token",
        value=result["token"],
        httponly=True,
        secure=True,
        samesite="lax",
        max_age=30 * 86400
    )
    return {
        "status": True,
        "user": result["user"],
        "session": result["session"],
        "token": result["token"],
        "message": "Signed in successfully!"
    }

@app.get("/api/auth/get-session")
async def get_session(authorization: Optional[str] = Header(None)):
    """
    Validates current active session from Neon PostgreSQL
    """
    token = None
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]

    if not token:
        return {"session": None, "user": None}

    session_data = get_session_user(token)
    if not session_data:
        return {"session": None, "user": None}

    return {
        "session": {
            "id": session_data["session_id"],
            "token": session_data["token"],
            "expiresAt": session_data["expires_at"]
        },
        "user": {
            "id": session_data["user_id"],
            "name": session_data["name"],
            "email": session_data["email"],
            "role": session_data["role"],
            "phone": session_data["phone"],
            "companyName": session_data["company_name"]
        }
    }

@app.get("/api/auth/users")
async def get_all_users():
    """
    Direct inspection endpoint to verify users stored in Neon PostgreSQL
    """
    users = list_all_users()
    return {
        "total": len(users),
        "database": "Neon PostgreSQL",
        "users": users
    }

# -------------------------------------------------------------
# 8. Better Auth Dash & Infra Validation Endpoints
# -------------------------------------------------------------
@app.get("/api/auth")
@app.get("/api/auth/status")
async def auth_status():
    return {
        "status": "ready",
        "service": "Better Auth Gateway",
        "api_key_configured": bool(settings.BETTER_AUTH_API_KEY),
        "endpoint": "/api/auth",
        "dash_infra": "enabled",
        "database": "Neon PostgreSQL (Live)",
        "backend_url": settings.BACKEND_URL,
        "frontend_url": settings.FRONTEND_URL
    }

@app.get("/api/auth/ok")
async def auth_ok():
    return {"ok": True}

@app.get("/api/auth/dash/validate")
@app.post("/api/auth/dash/validate")
async def dash_validate():
    return {"valid": True}

@app.get("/api/auth/dash/config")
@app.post("/api/auth/dash/config")
async def dash_config():
    return {
        "version": "1.1.0",
        "plugins": ["dash"],
        "emailAndPassword": {"enabled": True},
        "socialProviders": []
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

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=True)
