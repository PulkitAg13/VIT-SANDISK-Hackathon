from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.services.query_service import QueryService
from app.database.db import get_connection

router = APIRouter()


class SearchRequest(BaseModel):
    query: str
    top_k: int = 5


def get_query_service():
    return QueryService()


@router.get("/health")
def health_check():
    return {"status": "Smart File Finder running"}


@router.post("/search")
def search_files(
    request: SearchRequest,
    query_service: QueryService = Depends(get_query_service)
):

    results = query_service.search(
        query=request.query,
        top_k=request.top_k
    )

    return {
        "query": request.query,
        "results": results
    }


@router.get("/stats")
def get_stats():

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) FROM files")
    total_files = cursor.fetchone()[0]

    conn.close()

    return {
        "total_indexed_files": total_files
    }


from fastapi.responses import FileResponse
import os


@router.get("/file")
def get_file(path: str):

    # Security: normalize path
    safe_path = os.path.abspath(path)

    if not os.path.exists(safe_path):
        return {"error": "File not found"}

    return FileResponse(safe_path)