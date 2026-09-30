from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.core.deps import get_db, require_admin
from app.models.user import User
from app.models.question import QuestionBank
from app.models.template import InterviewTemplate

router = APIRouter()

@router.get("/users")
def list_users(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return [{"id": u.id, "email": u.email, "full_name": u.full_name, "role": u.role, "is_active": u.is_active}
            for u in db.query(User).all()]

class RoleIn(BaseModel):
    role: str

@router.patch("/users/{uid}/role")
def set_role(uid: int, inp: RoleIn, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    u = db.get(User, uid)
    if not u: raise HTTPException(404, "Not found")
    u.role = inp.role; db.commit(); return {"ok": True}

class QBankIn(BaseModel):
    category: str
    question: str
    difficulty: str = "medium"
    ideal_answer: str | None = None
    tags: str | None = None

@router.get("/questions")
def list_questions(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return [q.__dict__ for q in db.query(QuestionBank).all()]

@router.post("/questions")
def add_question(inp: QBankIn, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    q = QuestionBank(**inp.model_dump()); db.add(q); db.commit(); db.refresh(q); return {"id": q.id}

@router.delete("/questions/{qid}")
def del_question(qid: int, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    q = db.get(QuestionBank, qid);
    if q: db.delete(q); db.commit()
    return {"ok": True}

class TemplateIn(BaseModel):
    name: str
    mode: str
    description: str | None = None
    system_prompt: str | None = None

@router.get("/templates")
def list_templates(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return [t.__dict__ for t in db.query(InterviewTemplate).all()]

@router.post("/templates")
def add_template(inp: TemplateIn, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    t = InterviewTemplate(**inp.model_dump()); db.add(t); db.commit(); db.refresh(t); return {"id": t.id}
