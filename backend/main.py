from contextlib import asynccontextmanager

from fastapi import FastAPI
from database.database import client


@asynccontextmanager
async def lifespan(app: FastAPI):
    # startup
    yield
    # shutdown
    await client.close()


app = FastAPI(lifespan=lifespan)


@app.get("/")
async def health():
    return {"status": "ok"}

@app.get('/read/{id}')
async def read():
  id = 3
  return id
