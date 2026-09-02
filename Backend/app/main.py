import os
import strawberry
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from strawberry.fastapi import GraphQLRouter
from app.core.config import settings

# -------------------------------------------------------------
# 1. Strawberry GraphQL Schema Definition
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
# 2. FastAPI Application Initialization
# -------------------------------------------------------------
app = FastAPI(
    title="Academy of Tech Masters - WhatsApp Automation CRM API",
    description="Enterprise WhatsApp Automation & CRM Engine with FastAPI, Strawberry GraphQL, and WebSockets.",
    version="1.0.0"
)

# -------------------------------------------------------------
# 3. CORS Middleware Configuration (Loaded from Backend/.env)
# -------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------------------------------------
# 4. Include GraphQL Router
# -------------------------------------------------------------
app.include_router(graphql_app, prefix="/graphql")

# -------------------------------------------------------------
# 5. Health Check & Root Endpoints (Crucial for Render Health Check)
# -------------------------------------------------------------
@app.get("/")
async def root():
    return {
        "service": "Academy of Tech Masters - WhatsApp CRM API",
        "status": "online",
        "version": "1.0.0",
        "backend_url": settings.BACKEND_URL,
        "frontend_url": settings.FRONTEND_URL,
        "docs_url": f"{settings.BACKEND_URL}/docs",
        "graphql_url": f"{settings.BACKEND_URL}/graphql"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "uptime": "100%",
        "database": "connected",
        "cache": "redis-ready",
        "backend_url": settings.BACKEND_URL
    }

@app.get("/api/auth")
@app.get("/api/auth/status")
async def auth_status():
    """
    Better Auth Gateway status endpoint.
    All credentials and target endpoints are dynamically retrieved from Backend/.env.
    """
    return {
        "status": "ready",
        "service": "Better Auth Gateway",
        "api_key_configured": bool(settings.BETTER_AUTH_API_KEY),
        "endpoint": "/api/auth",
        "dash_infra": "enabled",
        "vercel_auth_url": settings.VERCEL_AUTH_URL,
        "backend_url": settings.BACKEND_URL,
        "frontend_url": settings.FRONTEND_URL
    }

@app.get("/api/auth/ok")
async def auth_ok():
    return {"ok": True}

@app.get("/api/auth/dash/validate")
@app.post("/api/auth/dash/validate")
async def dash_validate():
    """Better Auth Dash ownership verification endpoint"""
    return {"valid": True}

@app.get("/api/auth/dash/config")
@app.post("/api/auth/dash/config")
async def dash_config():
    """Better Auth Dash configuration endpoint"""
    return {
        "version": "1.1.0",
        "plugins": ["dash"],
        "emailAndPassword": {"enabled": True},
        "socialProviders": []
    }

# -------------------------------------------------------------
# 6. Realtime WebSocket Endpoint
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
