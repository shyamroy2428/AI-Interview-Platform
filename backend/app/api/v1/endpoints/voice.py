from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from app.core.deps import get_current_user
from app.services.transcribe import transcribe_bytes

router = APIRouter()

@router.post("/transcribe")
async def transcribe(file: UploadFile = File(...), _user = Depends(get_current_user)):
    data = await file.read()
    if not data: raise HTTPException(400, "Empty audio")
    try:
        text = transcribe_bytes(data, file.filename or "audio.webm")
    except Exception as e:
        raise HTTPException(500, f"Transcription failed: {e}")
    return {"text": text}
