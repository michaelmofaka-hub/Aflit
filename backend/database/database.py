from pymongo import AsyncMongoClient

from Config.settings import Settings

settings = Settings()

client = AsyncMongoClient(settings.mongodb_url)

<<<<<<< HEAD
database = client["aflit"]
=======
client = AsyncMongoClient(settings.mongodb_url)
>>>>>>> 45d31a2d1106c8c3f4f2e75739398e9c1b2ada98

print(database)