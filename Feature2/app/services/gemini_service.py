import google.generativeai as genai
from app.config import GOOGLE_API_KEY

genai.configure(api_key=GOOGLE_API_KEY)

model = genai.GenerativeModel("gemini-1.5-flash")

def generate_answer(context: str, question: str):

    prompt = f"""
    You are an intelligent Personal Memory Assistant.

    File Content:
    {context[:6000]}

    User Question:
    {question}

    Give a clear, human-like explanation in 3-4 lines.
    """

    response = model.generate_content(prompt)
    return response.text