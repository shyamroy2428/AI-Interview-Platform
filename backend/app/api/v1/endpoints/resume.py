from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from app.core.deps import get_current_user
from app.services.resume import extract_pdf_text

router = APIRouter()

@router.post("/parse")
async def parse_resume(file: UploadFile = File(...), _user = Depends(get_current_user)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(400, "Only PDF supported")
    data = await file.read()
    text = extract_pdf_text(data)
    if not text: raise HTTPException(400, "Could not extract text")
    return {"text": text}
