from pymongo import AsyncMongoClient

from Config.settings import settings


client = AsyncMongoClient(settings.mongodb_uri)

database = client["aflit"]