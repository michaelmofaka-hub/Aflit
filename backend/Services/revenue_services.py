
from datetime import datetime, timezone
from decimal import Decimal
from typing import Optional

from bson import ObjectId, Decimal128
from bson.errors import InvalidId

from database.database import database
from Schema.revenue import RevenueCreate

def serialize_revenue(revenue: dict):
    """
    Convert a MongoDB revenue document
    into a Python dictionary.
    """

    amount = revenue["amount"]

    if isinstance(amount, Decimal128):
        amount = amount.to_decimal()
    else:
        amount = Decimal(str(amount))

    return {
        "revenue_id": str(revenue["_id"]),
        "user_id": revenue["user_id"],
        "provider": revenue["provider"],
        "platform": revenue.get("platform"),
        "platform_id": revenue.get("platform_id"),
        "revenue_type": revenue["revenue_type"],
        "event_type": revenue["event_type"],
        "status": revenue["status"],
        "amount": amount,
        "currency": revenue["currency"],
        "external_reference": revenue.get("external_reference"),
        "earned_at": revenue["earned_at"],
        "period_start": revenue.get("period_start"),
        "period_end": revenue.get("period_end"),
        "metadata": revenue.get("metadata", {}),
        "created_at": revenue["created_at"]
    }

async def create_revenue(
    user_id: str,
    revenue: RevenueCreate
):
    """
    Create and store a revenue record.
    """

    document = revenue.model_dump()

    document["user_id"] = user_id
    document["amount"] = Decimal128(revenue.amount)

    document["created_at"] = datetime.now(timezone.utc)

    collection = database["revenue"]

    result = await collection.insert_one(document)

    created_revenue = await collection.find_one({
        "_id": result.inserted_id,
        "user_id": user_id
    })

    return serialize_revenue(created_revenue)

async def get_user_revenue(
    user_id: str,
    provider: Optional[str] = None,
    platform: Optional[str] = None,
    revenue_type: Optional[str] = None,
    status: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    limit: int = 100
):
    """
    Retrieve revenue records belonging to one user.
    Supports optional filters.
    """

    query = {
        "user_id": user_id
    }

    if provider is not None:
        query["provider"] = provider

    if platform is not None:
        query["platform"] = platform

    if revenue_type is not None:
        query["revenue_type"] = revenue_type

    if status is not None:
        query["status"] = status

    if start_date is not None or end_date is not None:

        query["earned_at"] = {}

        if start_date is not None:
            query["earned_at"]["$gte"] = start_date

        if end_date is not None:
            query["earned_at"]["$lte"] = end_date

    collection = database["revenue"]

    cursor = collection.find(query).sort(
        "earned_at", -1
    ).limit(max(1, min(limit, 500)))

    records = await cursor.to_list(length=None)

    return [
        serialize_revenue(record)
        for record in records
    ]

async def get_revenue(
    revenue_id: str,
    user_id: str
):
    """
    Retrieve one revenue record belonging to one user.
    """

    try:
        object_id = ObjectId(revenue_id)

    except InvalidId:
        return None

    collection = database["revenue"]

    revenue = await collection.find_one({
        "_id": object_id,
        "user_id": user_id
    })

    if revenue is None:
        return None

    return serialize_revenue(revenue)


async def get_revenue_summary(
    user_id: str,
    provider: Optional[str] = None,
    platform: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None
):
    """
    Calculate revenue summaries grouped by currency.
    Works across all providers and platforms.
    """

    query = {
        "user_id": user_id,
        "event_type": {"$in": ["earning", "refund"]},
        "status": {"$ne": "reversed"}
    }

    if provider is not None:
        query["provider"] = provider

    if platform is not None:
        query["platform"] = platform

    if start_date is not None or end_date is not None:
        query["earned_at"] = {}

        if start_date is not None:
            query["earned_at"]["$gte"] = start_date

        if end_date is not None:
            query["earned_at"]["$lte"] = end_date

    pipeline = [
        {"$match": query},

        {
            "$group": {
                "_id": {
                    "currency": "$currency",
                    "status": "$status",
                    "event_type": "$event_type"
                },
                "amount": {"$sum": "$amount"}
            }
        }
    ]

    collection = database["revenue"]

    cursor = collection.aggregate(pipeline)
    records = await cursor.to_list(length=None)

    summary = {}

    for record in records:

        currency = record["_id"]["currency"]
        status = record["_id"]["status"]
        event_type = record["_id"]["event_type"]

        amount = record["amount"]

        if isinstance(amount, Decimal128):
            amount = amount.to_decimal()
        else:
            amount = Decimal(str(amount))

        if currency not in summary:
            summary[currency] = {
                "total_revenue": Decimal("0"),
                "confirmed_revenue": Decimal("0"),
                "pending_revenue": Decimal("0"),
                "estimated_revenue": Decimal("0")
            }

        # Refunds reduce revenue.
        if event_type == "refund":
            amount = -amount

        summary[currency]["total_revenue"] += amount

        if status in ["confirmed", "paid"]:
            summary[currency]["confirmed_revenue"] += amount

        elif status == "pending":
            summary[currency]["pending_revenue"] += amount

        elif status == "estimated":
            summary[currency]["estimated_revenue"] += amount

    return summary
