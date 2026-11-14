
import httpx

from Config.settings import settings


async def generate_response(
    messages: list[dict],
    tools: list[dict] | None = None
) -> dict:

    api_key = settings.openrouter_api_key.get_secret_value()

    url = f"{settings.openrouter_base_url}/chat/completions"

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "X-Title": "Aflit AI Agent"
    }

    payload = {
        "model": settings.ai_model,
        "messages": messages,
        "temperature": 0.7,
        "max_tokens": 1500
    }

    # Add tools only when the agent provides them.
    if tools:
        payload["tools"] = tools
        payload["tool_choice"] = "auto"

    async with httpx.AsyncClient(timeout=60.0) as client:

        try:
            response = await client.post(
                url,
                headers=headers,
                json=payload
            )

            response.raise_for_status()

            data = response.json()

            return data["choices"][0]["message"]

        except httpx.HTTPStatusError as error:
            raise RuntimeError(
                f"AI provider returned an error: "
                f"{error.response.status_code} "
                f"{error.response.text[:500]}"
            ) from error

        except httpx.RequestError as error:
            raise RuntimeError(
                f"Could not connect to AI provider: {error}"
            ) from error
