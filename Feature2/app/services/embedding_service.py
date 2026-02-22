import google.generativeai as genai
from app.config import GOOGLE_API_KEY

genai.configure(api_key=GOOGLE_API_KEY)

def get_embedding(text: str):

    response = genai.embed_content(
        model="models/embedding-001",
        content=text
    )

    return response["embedding"]