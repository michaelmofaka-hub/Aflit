import unittest
from unittest.mock import AsyncMock, patch

from fastapi import FastAPI
from fastapi.testclient import TestClient

from Publishing.base import PublishResult
from Routes.publishing_route import PUBLISHERS, router
from Routes.users import get_current_user


class PublishingRouteTests(unittest.TestCase):
    def setUp(self):
        app = FastAPI()
        app.include_router(router, prefix="/posts")
        app.dependency_overrides[get_current_user] = lambda: {
            "_id": "test-user"
        }
        self.client = TestClient(app)

    @patch(
        "Routes.publishing_route.create_post_draft",
        new_callable=AsyncMock
    )
    def test_saves_each_supported_draft_format(self, create_draft):
        create_draft.return_value = "draft-id"
        drafts = [
            {
                "platform": "youtube",
                "post_type": "video",
                "title": "Video"
            },
            {
                "platform": "instagram",
                "post_type": "image",
                "title": "Image",
                "media_url": "https://example.com/image.jpg"
            },
            {
                "platform": "facebook",
                "post_type": "text",
                "title": "Text",
                "caption": "A text post"
            },
            {
                "platform": "tiktok",
                "post_type": "link",
                "title": "Link",
                "link_url": "https://example.com"
            }
        ]

        for draft in drafts:
            with self.subTest(post_type=draft["post_type"]):
                response = self.client.post(
                    "/posts/drafts",
                    json=draft
                )

                self.assertEqual(response.status_code, 200)
                self.assertEqual(response.json()["status"], "draft")

        self.assertEqual(create_draft.await_count, 4)

    def test_image_draft_requires_media_url(self):
        response = self.client.post(
            "/posts/drafts",
            json={
                "platform": "instagram",
                "post_type": "image",
                "title": "Missing media"
            }
        )

        self.assertEqual(response.status_code, 422)

    def test_platform_adapter_rejects_unsupported_post_format(self):
        response = self.client.post(
            "/posts/publish",
            data={
                "platform": "youtube",
                "platform_id": "platform-id",
                "post_type": "image",
                "title": "Image post"
            }
        )

        self.assertEqual(response.status_code, 501)

    def test_publishes_video_using_registered_platform_adapter(self):
        publisher = AsyncMock()
        publisher.publish_post.return_value = PublishResult(
            platform="youtube",
            content_id="video-id",
            url="https://www.youtube.com/watch?v=video-id",
            title="Launch video"
        )

        with patch.dict(PUBLISHERS, {"youtube": publisher}):
            response = self.client.post(
                "/posts/publish",
                data={
                    "platform": "youtube",
                    "platform_id": "platform-id",
                    "post_type": "video",
                    "title": "Launch video",
                    "privacy_status": "private"
                },
                files={
                    "video": (
                        "launch.mp4",
                        b"video content",
                        "video/mp4"
                    )
                }
            )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["content_id"], "video-id")
        publisher.publish_post.assert_awaited_once()


if __name__ == "__main__":
    unittest.main()
