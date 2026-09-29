from database.database import  database

async def connect_platform(
  user_id: str,
  platform: str,
  platform_id: str
):
  create_platform = {
    "user_id": user_id,
    "platform": platform,
    "platform_id": platform_id,
    "status": "connected"
  }
  collection = database["platformconnected"]

  result = collection.insert_one(create_platform)

  return str(result.inserted_id)