import os
from pypdf import PdfReader
from docx import Document

def extract_text(file_bytes: bytes, filename: str):

    ext = os.path.splitext(filename)[1].lower()

    if ext == ".txt":
        return file_bytes.decode("utf-8", errors="ignore")

    elif ext == ".pdf":
        from io import BytesIO
        reader = PdfReader(BytesIO(file_bytes))
        text = ""
        for page in reader.pages:
            text += page.extract_text() or ""
        return text

    elif ext == ".docx":
        from io import BytesIO
        doc = Document(BytesIO(file_bytes))
        return "\n".join([p.text for p in doc.paragraphs])

    else:
        return ""