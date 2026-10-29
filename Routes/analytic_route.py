from fastapi import APIRouter, Depends, HTTPException

from Schema.analytics import AnalyticsCreate, AnalyticsResponse

from Services.analytic_services import (
    create_analytics,
    get_user_analytics,
    get_analytics,
    delete_analytics
)

from Routes.users import get_current_user


router = APIRouter(
    tags=["Analytics"]
)


@router.post("", response_model=AnalyticsResponse)
async def create(
    analytics: AnalyticsCreate,
    current_user: dict = Depends(get_current_user)
):
    user_id = str(current_user["_id"])

    analytics_id = await create_analytics(
        user_id=user_id,
        content_id=analytics.content_id,
        platform_id=analytics.platform_id,
        platform=analytics.platform,
        metrics=analytics.metrics.model_dump(),
        recorded_at=analytics.recorded_at
    )

    created_analytics = await get_analytics(
        analytics_id=analytics_id,
        user_id=user_id
    )

    return {
        "analytics_id": str(created_analytics["_id"]),
        "content_id": created_analytics["content_id"],
        "platform_id": created_analytics["platform_id"],
        "platform": created_analytics["platform"],
        "metrics": created_analytics["metrics"],
        "recorded_at": created_analytics["recorded_at"],
        "created_at": created_analytics["created_at"]
    }


@router.get("", response_model=list[AnalyticsResponse])
async def get_all(
    current_user: dict = Depends(get_current_user)
):
    user_id = str(current_user["_id"])

    analytics_list = await get_user_analytics(user_id)

    return [
        {
            "analytics_id": str(item["_id"]),
            "content_id": item["content_id"],
            "platform_id": item["platform_id"],
            "platform": item["platform"],
            "metrics": item["metrics"],
            "recorded_at": item["recorded_at"],
            "created_at": item["created_at"]
        }
        for item in analytics_list
    ]


@router.get("/{analytics_id}", response_model=AnalyticsResponse)
async def get_one(
    analytics_id: str,
    current_user: dict = Depends(get_current_user)
):
    user_id = str(current_user["_id"])

    analytics = await get_analytics(
        analytics_id=analytics_id,
        user_id=user_id
    )

    if analytics is None:
        raise HTTPException(
            status_code=404,
            detail="Analytics not found"
        )

    return {
        "analytics_id": str(analytics["_id"]),
        "content_id": analytics["content_id"],
        "platform_id": analytics["platform_id"],
        "platform": analytics["platform"],
        "metrics": analytics["metrics"],
        "recorded_at": analytics["recorded_at"],
        "created_at": analytics["created_at"]
    }


@router.delete("/{analytics_id}")
async def delete(
    analytics_id: str,
    current_user: dict = Depends(get_current_user)
):
    user_id = str(current_user["_id"])

    deleted = await delete_analytics(
        analytics_id=analytics_id,
        user_id=user_id
    )

    if deleted is None:
        raise HTTPException(
            status_code=404,
            detail="Analytics not found"
        )

    return {
        "message": "Analytics deleted"
    }