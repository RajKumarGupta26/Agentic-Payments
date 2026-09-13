from fastapi import APIRouter
from services.blockchain import blockchain_service

router = APIRouter()


@router.get("/audit")
def get_audit():
    return {
        "events": blockchain_service.audit_list(),
        "count": len(blockchain_service.audit_list()),
    }
