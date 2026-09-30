from pypdf import PdfReader
from io import BytesIO

def extract_pdf_text(data: bytes) -> str:
    try:
        r = PdfReader(BytesIO(data))
        return "\n".join((p.extract_text() or "") for p in r.pages).strip()
    except Exception:
        return ""
