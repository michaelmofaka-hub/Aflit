from fastapi import APIRouter, Depends, HTTPException

from Schema.content import ContentCreate, ContentResponse

from Services.content_services import (
    create_content,
    get_user_content,
    get_content,
    delete_content
)

from Routes.users import get_current_user


router = APIRouter(
    tags=["Content"]
)


@router.post("", response_model=ContentResponse)
async def create(
    content: ContentCreate,
    current_user: dict = Depends(get_current_user)
):
    user_id = str(current_user["_id"])

    content_id = await create_content(
        user_id=user_id,
        platform_id=content.platform_id,
        platform=content.platform,
        external_content_id=content.external_content_id,
        title=content.title,
        description=content.description,
        published_at=content.published_at
    )

    created_content = await get_content(
        content_id=content_id,
        user_id=user_id
    )

    return {
        "content_id": str(created_content["_id"]),
        "platform_id": created_content["platform_id"],
        "platform": created_content["platform"],
        "external_content_id": created_content["external_content_id"],
        "title": created_content["title"],
        "description": created_content["description"],
        "published_at": created_content["published_at"],
        "created_at": created_content["created_at"]
    }


@router.get("", response_model=list[ContentResponse])
async def get_all(
    current_user: dict = Depends(get_current_user)
):
    user_id = str(current_user["_id"])

    contents = await get_user_content(user_id)

    return [
        {
            "content_id": str(item["_id"]),
            "platform_id": item["platform_id"],
            "platform": item["platform"],
            "external_content_id": item["external_content_id"],
            "title": item["title"],
            "description": item["description"],
            "published_at": item["published_at"],
            "created_at": item["created_at"]
        }
        for item in contents
    ]


@router.get("/{content_id}", response_model=ContentResponse)
async def get_one(
    content_id: str,
    current_user: dict = Depends(get_current_user)
):
    user_id = str(current_user["_id"])

    content = await get_content(
        content_id=content_id,
        user_id=user_id
    )

    if content is None:
        raise HTTPException(
            status_code=404,
            detail="Content not found"
        )

    return {
        "content_id": str(content["_id"]),
        "platform_id": content["platform_id"],
        "platform": content["platform"],
        "external_content_id": content["external_content_id"],
        "title": content["title"],
        "description": content["description"],
        "published_at": content["published_at"],
        "created_at": content["created_at"]
    }


@router.delete("/{content_id}")
async def delete(
    content_id: str,
    current_user: dict = Depends(get_current_user)
):
    user_id = str(current_user["_id"])

    deleted = await delete_content(
        content_id=content_id,
        user_id=user_id
    )

    if deleted is None:
        raise HTTPException(
            status_code=404,
            detail="Content not found"
        )

    return {
        "message": "Content deleted"
    }