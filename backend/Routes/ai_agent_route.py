
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from Routes.users import get_current_user
from aiagent.agent import run_agent


router = APIRouter(
    prefix="/ai",
    tags=["AI Agent"]
)


class AgentRequest(BaseModel):
    message: str = Field(
        min_length=1,
        max_length=5000
    )

    conversation_id: str | None = None


class AgentResponse(BaseModel):
    conversation_id: str
    response: str


@router.post("/chat", response_model=AgentResponse)
async def chat_with_agent(
    request: AgentRequest,
    current_user: dict = Depends(get_current_user)
):

    user_id = str(current_user["_id"])
    username = current_user["username"]

    try:
        result = await run_agent(
            user_id=user_id,
            username=username,
            user_message=request.message,
            conversation_id=request.conversation_id
        )

        return result

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

    except RuntimeError:
        raise HTTPException(
            status_code=502,
            detail="AI provider is currently unavailable"
        )

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="AI agent encountered an internal error"
        )
