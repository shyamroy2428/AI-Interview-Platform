from fastapi import APIRouter
from app.api.v1.endpoints import auth, interviews, resume, admin, voice, analytics

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(interviews.router, prefix="/interviews", tags=["interviews"])
api_router.include_router(resume.router, prefix="/resume", tags=["resume"])
api_router.include_router(voice.router, prefix="/voice", tags=["voice"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
