from fastapi import APIRouter

from models import AgentTask
from services.agent_service import run_agent_task


router = APIRouter()

latest_result = None


@router.post("/task")
def create_agent_task(data: AgentTask):

    global latest_result

    result = run_agent_task(data)

    latest_result = result

    return {
        "success": True,
        "status": "completed",
        "message": "AI agent completed payment and delivered service.",
        "service": result["service_id"],
        "request_id": result["request_id"],
        "result": result
    }


@router.post("/result")
def receive_agent_result(data: dict):

    global latest_result

    latest_result = data

    return {
        "success": True,
        "message": "Agent result received by P4 dashboard"
    }


@router.get("/result")
def get_agent_result():

    return {
        "result": latest_result
    }