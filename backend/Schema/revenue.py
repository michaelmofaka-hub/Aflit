
from datetime import datetime
from decimal import Decimal
from typing import Literal, Optional

from pydantic import BaseModel, Field


RevenueType = Literal[
    "advertising",
    "membership",
    "tip",
    "product_sale",
    "sponsorship",
    "other"
]

RevenueStatus = Literal[
    "estimated",
    "pending",
    "confirmed",
    "paid",
    "reversed"
]

RevenueEventType = Literal[
    "earning",
    "refund",
    "adjustment"
]


class RevenueCreate(BaseModel):
    provider: str
    platform: Optional[str] = None
    platform_id: Optional[str] = None

    revenue_type: RevenueType
    event_type: RevenueEventType = "earning"
    status: RevenueStatus = "confirmed"

    amount: Decimal = Field(gt=0)
    currency: str = Field(min_length=3, max_length=3)

    external_reference: Optional[str] = None

    earned_at: datetime
    period_start: Optional[datetime] = None
    period_end: Optional[datetime] = None

    metadata: dict = Field(default_factory=dict)


class RevenueResponse(BaseModel):
    revenue_id: str
    provider: str
    platform: Optional[str] = None
    platform_id: Optional[str] = None

    revenue_type: RevenueType
    event_type: RevenueEventType
    status: RevenueStatus

    amount: Decimal
    currency: str

    external_reference: Optional[str] = None

    earned_at: datetime
    period_start: Optional[datetime] = None
    period_end: Optional[datetime] = None

    metadata: dict = Field(default_factory=dict)
    created_at: datetime
