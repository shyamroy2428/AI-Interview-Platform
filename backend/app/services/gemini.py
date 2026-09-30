import json, re
import google.generativeai as genai
from app.core.config import settings

if settings.GEMINI_API_KEY:
    genai.configure(api_key=settings.GEMINI_API_KEY)

_model = None
def model():
    global _model
    if _model is None:
        _model = genai.GenerativeModel(settings.GEMINI_MODEL)
    return _model

def generate(prompt: str, system: str | None = None) -> str:
    text = (f"{system}\n\n{prompt}" if system else prompt)
    try:
        r = model().generate_content(text)
        return (r.text or "").strip()
    except Exception as e:
        return f"__ERROR__:{e}"

def extract_json(text: str) -> dict:
    text = re.sub(r"^```(?:json)?", "", text.strip()).strip()
    text = re.sub(r"```$", "", text).strip()
    start = text.find("{")
    if start < 0: return {}
    depth = 0
    for i in range(start, len(text)):
        c = text[i]
        if c == "{": depth += 1
        elif c == "}":
            depth -= 1
            if depth == 0:
                try: return json.loads(text[start:i+1])
                except Exception: return {}
    return {}
