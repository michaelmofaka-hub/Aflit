from fastapi import APIRouter, Depends, HTTPException

from Routes.users import get_current_user

from Services.insight_engine import (
    analyze_engagement,
    generate_insight
)

from Services.ai_insight_services import (
    create_ai_insight,
    get_user_ai_insights,
    record_ai_insight_outcome
)


router = APIRouter(tags=["AI Insights"])


@router.post("")
async def create_insight(
    views: int,
    likes: int,
    comments: int,
    current_user: dict = Depends(get_current_user)
):
    analysis = analyze_engagement(
        views=views,
        likes=likes,
        comments=comments
    )

    if analysis is None:
        raise HTTPException(
            status_code=400,
            detail="Views must be greater than zero"
        )

    result = generate_insight(analysis)

    user_id = str(current_user["_id"])

    insight_id = await create_ai_insight(
        user_id=user_id,
        source="analytics",
        insight=result["insight"],
        recommendation=result["recommendation"]
    )

    return {
        "insight_id": insight_id,
        "analysis": analysis,
        "insight": result["insight"],
        "recommendation": result["recommendation"]
    }

@router.get("")
async def get_insights(
    current_user: dict = Depends(get_current_user)
):
    user_id = str(current_user["_id"])

    insights = await get_user_ai_insights(
        user_id=user_id
    )

    return [
        {
            "insight_id": str(insight["_id"]),
            "source": insight["source"],
            "insight": insight["insight"],
            "recommendation": insight["recommendation"],
            "created_at": insight["created_at"]
        }
        for insight in insights
    ]

@router.patch("/{insight_id}/outcome")
async def record_outcome(
    insight_id: str,
    outcome: str,
    current_user: dict = Depends(get_current_user)
):
    user_id = str(current_user["_id"])

    insight = await record_ai_insight_outcome(
        insight_id=insight_id,
        user_id=user_id,
        outcome=outcome
    )

    if insight is None:
        raise HTTPException(
            status_code=404,
            detail="AI insight not found"
        )

    return {
        "message": "Insight outcome recorded",
        "insight_id": str(insight["_id"]),
        "outcome": insight["outcome"],
        "outcome_recorded_at": insight["outcome_recorded_at"]
    }