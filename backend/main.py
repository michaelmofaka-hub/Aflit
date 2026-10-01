from contextlib import asynccontextmanager
from fastapi import FastAPI

from database.database import client, database
from Routes.users import router as users_router
from Routes.platform_route import router as platform_router
from Routes.content_route import router as content_router
from Routes.analytic_route import router as analytic_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # startup
    if(client):
      print("database connected")
    await database["users"].create_index(
      "email",
      unique=True
    )
    yield
    # shutdown
    await client.close()

app = FastAPI(lifespan=lifespan)
app.include_router(users_router, prefix="/users")
app.include_router(platform_router, prefix="/platform")
app.include_router(content_router, prefix="/content")
app.include_router(analytic_router, prefix="/content")


@app.get("/")
async def health():
    return {"status": "ok"}
  

@app.get("/")
async def health():
    return {"status": "ok"}
  
@app.post("/{id}")
def return_id(id):
  id_n = id
  return id_n
