from datetime import datetime

from pydantic import BaseModel


class AnalyticsMetrics(BaseModel):
    views: int = 0
    likes: int = 0
    comments: int = 0
    shares: int = 0
    saves: int = 0


class AnalyticsCreate(BaseModel):
    content_id: str
    platform_id: str
    platform: str
    metrics: AnalyticsMetrics
    recorded_at: datetime


class AnalyticsResponse(BaseModel):
    analytics_id: str
    content_id: str
    platform_id: str
    platform: str
    metrics: AnalyticsMetrics
    recorded_at: datetime
    created_at: datetime