from app.services.gemini_service import generate_text

def detect_conflict(text1: str, text2: str):
    prompt = f"""
    Compare these two documents.
    Tell if they conflict semantically.
    Answer YES or NO with short explanation.

    Document 1:
    {text1}

    Document 2:
    {text2}
    """

    return generate_text(prompt)