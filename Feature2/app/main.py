from fastapi import FastAPI
from app.db.base import Base
from app.db.session import engine
from app.api.routes import router

app = FastAPI(title="Personal Memory Assistant")

@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

app.include_router(router)