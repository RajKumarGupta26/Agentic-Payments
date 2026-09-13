from fastapi import APIRouter
from services.blockchain import blockchain_service

router = APIRouter()


@router.get("/budget")
def get_budget():
    return blockchain_service.get_budget()


@router.get("/payments")
def get_payments():
    payments = blockchain_service.payments_list()

    return {
        "payments": payments,
        "count": len(payments),
    }


@router.get("/providers")
def get_providers():
    return {
        "providers": [
            {
                "id": "weather",
                "name": "P3 x402 Provider",
                "service": "Premium Weather Data",
                "price": 0.01,
                "currency": "USDC",
                "network": "Base Sepolia",
                "status": "online",
            },
            {
                "id": "analytics",
                "name": "P3 x402 Provider",
                "service": "Premium Analytics",
                "price": 0.02,
                "currency": "USDC",
                "network": "Base Sepolia",
                "status": "online",
            },
        ]
    }