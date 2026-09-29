from contextlib import asynccontextmanager

from fastapi import FastAPI
from database.database import client
from Routes.users import router as users_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # startup
    if(client):
      print("database connected")
    yield
    # shutdown
    await client.close()


app = FastAPI(lifespan=lifespan)
app.include_router(users_router, prefix="/users")

@app.get("/")
async def health():
    return {"status": "ok"}
  
@app.post("/{id}")
def return_id(id):
  id_n = id
  return id_n
