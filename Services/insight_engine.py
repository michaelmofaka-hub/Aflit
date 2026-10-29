def analyze_engagement(
    views: int,
    likes: int,
    comments: int
):
    if views <= 0:
        return None

    like_rate = likes / views
    comment_rate = comments / views

    if like_rate >= 0.10:
        pattern = "high_like_engagement"

    elif like_rate >= 0.05:
        pattern = "good_like_engagement"

    else:
        pattern = "low_like_engagement"

    return {
        "pattern": pattern,
        "like_rate": like_rate,
        "comment_rate": comment_rate
    }


def generate_insight(analysis: dict):
    pattern = analysis["pattern"]

    if pattern == "high_like_engagement":
        return {
            "insight": (
                "This content is receiving strong engagement "
                "relative to its number of views."
            ),
            "recommendation": (
                "Consider creating more content with similar "
                "topics, formats, or presentation."
            )
        }

    if pattern == "good_like_engagement":
        return {
            "insight": (
                "This content is receiving good engagement "
                "relative to its number of views."
            ),
            "recommendation": (
                "Continue testing similar content while "
                "experimenting with ways to increase reach."
            )
        }

    return {
        "insight": (
            "This content is receiving relatively low "
            "engagement compared with its number of views."
        ),
        "recommendation": (
            "Experiment with stronger hooks, topics, "
            "and calls to action."
        )
    }