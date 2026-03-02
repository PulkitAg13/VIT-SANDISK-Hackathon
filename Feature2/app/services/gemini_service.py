import google.generativeai as genai
from app.config import GOOGLE_API_KEY

genai.configure(api_key=GOOGLE_API_KEY)

model = genai.GenerativeModel("models/gemini-2.5-flash")

def generate_answer(context: str, question: str):

    prompt = f"""
    You are an intelligent Personal Memory Assistant.

    File Content:
    {context[:6000]}

    User Question:
    {question}

    Explain clearly why this file exists and what it is used for.
    Also suggest whether the user should Keep, Archive, or Delete it.
    Keep response within 4-5 lines.
    """

    response = model.generate_content(prompt)

    return response.text