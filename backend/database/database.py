from pymongo import AsyncMongoClient

from Config.settings import settings

client = AsyncMongoClient(settings.mongodb_url)

database = client["aflit"]

print(database)