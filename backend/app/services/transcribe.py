# Optional server-side transcription with faster-whisper.
# Lazy-loaded so the API starts fast even without the model cached.
_model = None

def _load():
    global _model
    if _model is None:
        from faster_whisper import WhisperModel
        _model = WhisperModel("base", device="cpu", compute_type="int8")
    return _model

def transcribe_bytes(data: bytes, filename: str = "audio.webm") -> str:
    import tempfile, os
    with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(filename)[1] or ".webm") as f:
        f.write(data); path = f.name
    try:
        segments, _ = _load().transcribe(path, vad_filter=True)
        return " ".join(s.text.strip() for s in segments).strip()
    finally:
        try: os.remove(path)
        except Exception: pass
