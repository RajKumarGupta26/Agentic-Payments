from uuid import uuid4
from datetime import datetime, timezone

from models import AgentTask


def run_agent_task(data: AgentTask):

    task = (data.task or "").strip().lower()

    if "analytics" in task:
        service_id = "analytics"
        service_name = "Premium Analytics Data"
        amount = 0.02
        demo_data = {
            "metric": "Agent Payment Volume",
            "value": 1284,
            "period": "24h",
            "trend": "+18.4%"
        }
    else:
        service_id = "weather"
        service_name = "Premium Weather Data"
        amount = 0.01
        demo_data = {
            "location": "Gurugram",
            "temperature": 29,
            "unit": "C",
            "condition": "Clear"
        }

    request_id = str(uuid4())

    # Stable demo transaction
    tx_hash = (
        "0x4a0e07bebbe2e2775b9974db9d3dd0a2"
        "ffaa9a7bc86360f8fdc4a3134053b427"
    )

    payer = "0x5CcD88E4C4061D8c272480163dD44359dF782bFc"

    # Deterministic-looking delivery proof
    content_hash = (
        "a0d1c77aab1b08c9d85845d2129e9546"
        "de69c85b7ac86ba276267d011f7eef2d"
    )

    result = {
        "status": "available",
        "service": service_name,
        "service_id": service_id,
        "data": demo_data,
        "provider": "P3 x402 Provider",
        "attempt": 1,
        "request_id": request_id,
        "idempotency_key": str(uuid4()),

        "payment": {
            "success": True,
            "status": "settled",
            "payer": payer,
            "transaction": tx_hash,
            "network": "eip155:84532",
            "amount": amount,
            "currency": "USDC"
        },

        "delivery_proof": {
            "algorithm": "SHA-256",
            "content_hash": content_hash,
            "verified": True,
            "content": demo_data
        },

        "timestamp": datetime.now(
            timezone.utc
        ).isoformat()
    }

    print("[P4 DEMO] Agent task completed.")
    print("[P4 DEMO] Payment confirmed.")
    print("[P4 DEMO] Delivery proof verified.")

    return result