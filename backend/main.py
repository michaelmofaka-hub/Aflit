from contextlib import asynccontextmanager

from fastapi import FastAPI
from database.database import client
<<<<<<< HEAD
from Routes.users import router as users_router
=======
>>>>>>> 45d31a2d1106c8c3f4f2e75739398e9c1b2ada98


@asynccontextmanager
async def lifespan(app: FastAPI):
    # startup
<<<<<<< HEAD
    if(client):
      print("database connected")
=======
>>>>>>> 45d31a2d1106c8c3f4f2e75739398e9c1b2ada98
    yield
    # shutdown
    await client.close()


app = FastAPI(lifespan=lifespan)
<<<<<<< HEAD
app.include_router(users_router, prefix="/users")
=======

>>>>>>> 45d31a2d1106c8c3f4f2e75739398e9c1b2ada98

@app.get("/")
async def health():
    return {"status": "ok"}
<<<<<<< HEAD
  
@app.post("/{id}")
def return_id(id):
  id_n = id
  return id_n
=======

@app.get('/read/{id}')
async def read():
  id = 3
  return id
>>>>>>> 45d31a2d1106c8c3f4f2e75739398e9c1b2ada98
