from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.agent import router as agent_router
from routes.payments import router as payments_router
from routes.audit import router as audit_router

app = FastAPI(
    title="AgentPay P4 Backend",
    version="1.0.0",
    description="Backend/API layer for the AgentPay hackathon dashboard."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(agent_router, prefix="/api/agent", tags=["Agent"])
app.include_router(payments_router, prefix="/api", tags=["Payments"])
app.include_router(audit_router, prefix="/api", tags=["Audit"])


@app.get("/")
def root():
    return {
        "name": "AgentPay P4 Backend",
        "status": "running",
        "message": "Backend + dashboard API is ready"
    }


@app.get("/api/health")
def health():
    return {"status": "ok"}
