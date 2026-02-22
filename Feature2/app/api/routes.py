from fastapi import APIRouter, UploadFile, File
from app.services.file_parser import extract_text
from app.services.gemini_service import generate_answer

router = APIRouter()

@router.post("/upload-and-ask")
async def upload_and_ask(
    question: str,
    file: UploadFile = File(...)
):

    file_bytes = await file.read()

    text_content = extract_text(file_bytes, file.filename)

    if not text_content.strip():
        return {"error": "Could not extract text from file."}

    answer = generate_answer(text_content, question)

    return {
        "filename": file.filename,
        "answer": answer
    }