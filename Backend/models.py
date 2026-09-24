from pydantic import BaseModel, Field
from typing import Optional, Literal


class AgentTask(BaseModel):
    task: str = Field(..., min_length=1)
    provider: Optional[str] = None
    amount: Optional[float] = None


class Payment(BaseModel):
    id: str
    provider: str
    service: str
    amount: float
    currency: str = "ETH"
    status: Literal["confirmed", "blocked", "pending", "failed"]
    nonce: str
    tx_hash: Optional[str] = None
    timestamp: str
    delivery_status: Literal["verified", "pending", "failed", "not_delivered"]


class AuditEvent(BaseModel):
    id: str
    type: str
    message: str
    severity: Literal["info", "success", "warning", "danger"]
    timestamp: str
    nonce: Optional[str] = None
    tx_hash: Optional[str] = None
