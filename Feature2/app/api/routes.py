import os
import shutil
from fastapi import APIRouter, Depends, UploadFile, File
from app.db.session import AsyncSessionLocal
from app.db.models import File as FileModel
from app.db.crud import create_file
from app.services.embedding_service import get_embedding
from app.services.vector_store import VectorStore
from app.services.file_parser import extract_text
from app.services.gemini_service import generate_answer

router = APIRouter()
vector_store = VectorStore()

UPLOAD_DIR = "uploads"

os.makedirs(UPLOAD_DIR, exist_ok=True)


async def get_db():
    async with AsyncSessionLocal() as session:
        yield session



@router.post("/upload-and-ask")
async def upload_and_ask(
    question: str,
    file: UploadFile = File(...),
    db=Depends(get_db)
):

    file_location = os.path.join(UPLOAD_DIR, file.filename)

    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    text_content = extract_text(file_location)

    if not text_content.strip():
        return {"error": "Could not extract text."}

    db_file = FileModel(
        path=file_location,
        name=file.filename,
        content=text_content
    )

    saved = await create_file(db, db_file)

    embedding = get_embedding(text_content)
    vector_store.add_vector(embedding, saved.id)

    answer = generate_answer(text_content, question)

    return {
        "file_id": saved.id,
        "answer": answer
    }
