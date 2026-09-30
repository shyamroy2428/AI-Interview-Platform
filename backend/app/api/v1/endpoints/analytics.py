from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.deps import get_db, get_current_user
from app.models.interview import Interview, InterviewQuestion
from app.models.user import User

router = APIRouter()

@router.get("/summary")
def summary(db: Session = Depends(get_db), u: User = Depends(get_current_user)):
    total = db.query(func.count(Interview.id)).filter(Interview.user_id == u.id).scalar() or 0
    completed = db.query(func.count(Interview.id)).filter(Interview.user_id == u.id, Interview.status == "completed").scalar() or 0
    avg = db.query(func.avg(Interview.overall_score)).filter(Interview.user_id == u.id, Interview.overall_score.isnot(None)).scalar()
    by_mode = dict(db.query(Interview.mode, func.count(Interview.id)).filter(Interview.user_id == u.id).group_by(Interview.mode).all())
    timeline = [
        {"id": i.id, "mode": i.mode, "score": i.overall_score, "created_at": str(i.created_at)}
        for i in db.query(Interview).filter(Interview.user_id == u.id).order_by(Interview.created_at.desc()).limit(20).all()
    ]
    return {"total": total, "completed": completed, "average_score": float(avg) if avg else 0.0,
            "by_mode": by_mode, "timeline": timeline}
