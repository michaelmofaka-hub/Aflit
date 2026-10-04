import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database.database import client, database

from Routes.users import router as users_router
from Routes.platform_route import router as platform_router
from Routes.content_route import router as content_router
from Routes.analytic_route import router as analytic_router
from Routes.sync_job_route import router as sync_job_router

from worker.sync_worker import sync_worker


@asynccontextmanager
async def lifespan(app: FastAPI):

    # Startup
    if client:
        print("database connected")

    await database["users"].create_index(
        "email",
        unique=True
    )

    # Start background worker
    worker_task = asyncio.create_task(sync_worker())

    yield

    # Shutdown
    worker_task.cancel()

    try:
        await worker_task
    except asyncio.CancelledError:
        pass

    await client.close()


app = FastAPI(lifespan=lifespan,
             docs_url='/docs',
             redoc_url='/redoc')


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(
    users_router,
    prefix="/users"
)

app.include_router(
    platform_router,
    prefix="/platform"
)

app.include_router(
    content_router,
    prefix="/content"
)

app.include_router(
    analytic_router,
    prefix="/analytics"
)

app.include_router(
    sync_job_router,
    prefix="/sync-jobs"
)


@app.get("/")
async def health():
    return {"status": "ok"}

  