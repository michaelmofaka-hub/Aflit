from datetime import datetime

from pydantic import BaseModel, Field


class AIInsightCreate(BaseModel):
    source: str
    insight: str
    recommendation: str
    created_at: datetime


class AIInsightResponse(BaseModel):
    insight_id: str
    source: str
    insight: str
    recommendation: str
    outcome: str | None = None
    outcome_recorded_at: datetime | None = None
    created_at: datetime


class AIInsightOutcome(BaseModel):
    outcome: str = Field(
        min_length=1
    )