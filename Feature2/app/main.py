from fastapi import FastAPI
from app.api.routes import router

app = FastAPI(title="Personal Memory Assistant")

app.include_router(router)