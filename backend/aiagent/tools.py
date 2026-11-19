
from aiagent.context import build_creator_context


# --------------------------------------------------
# 1. TOOL DEFINITIONS
# --------------------------------------------------

TOOL_DEFINITIONS = [
    {
        "type": "function",
        "function": {
            "name": "get_creator_overview",
            "description": (
                "Retrieve the authenticated creator's overview, "
                "including connected platforms, analytics, "
                "recent content and audience history."
            ),
            "parameters": {
                "type": "object",
                "properties": {},
                "required": []
            }
        }
    }
]


# --------------------------------------------------
# 2. TOOL IMPLEMENTATIONS
# --------------------------------------------------

async def get_creator_overview(user_id: str) -> dict:
    """
    Retrieve the authenticated creator's data.
    """

    context = await build_creator_context(user_id)

    return context


# --------------------------------------------------
# 3. TOOL REGISTRY
# --------------------------------------------------

TOOL_FUNCTIONS = {
    "get_creator_overview": get_creator_overview
}
