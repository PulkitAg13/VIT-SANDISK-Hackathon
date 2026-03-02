from fastapi import APIRouter
from pydantic import BaseModel
import os

from app.core.text_extractor import TextExtractor
from app.services.indexing_service import IndexingService

router = APIRouter()

extractor = TextExtractor()
indexer = IndexingService()


class IndexRequest(BaseModel):
    directory_path: str


@router.post("/index")
def index_directory(request: IndexRequest):

    directory = request.directory_path

    if not os.path.exists(directory):
        return {"error": "Directory does not exist"}

    indexed_files = 0

    for root, _, files in os.walk(directory):
        for file in files:
            file_path = os.path.join(root, file)

            file_data = extractor.process_file(file_path)

            if file_data:
                indexer.index_file(file_data)
                indexed_files += 1

    return {
        "message": "Indexing completed",
        "total_files_indexed": indexed_files
    }