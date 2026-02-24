from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes_search import router as search_router
from app.api.routes_index import router as index_router
from app.database.db import initialize_database

app = FastAPI(
    title="Smart File Finder API",
    description="AI-powered semantic + hybrid file search engine",
    version="2.0.0"
)


@app.on_event("startup")
def startup_event():
    initialize_database()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(search_router, prefix="/api")
app.include_router(index_router, prefix="/api")