from pymongo import AsyncMongoClient

from Config.settings import Settings

settings = Settings()


client = AsyncMongoClient(settings.mongodb_url)

database = client["aflit"]