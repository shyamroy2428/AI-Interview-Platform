from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timezone
import json
from app.core.deps import get_db, get_current_user
from app.models.user import User
from app.models.interview import Interview, InterviewQuestion
from app.schemas.interview import (InterviewCreate, InterviewOut, QuestionOut,
                                    NextQuestionIn, NextQuestionOut, SubmitAnswerIn,
                                    SubmitAnswerOut, CompleteOut)
from app.services.interviewer import next_question, evaluate_answer, summarize

router = APIRouter()

def _to_out(iv: Interview) -> InterviewOut:
    return InterviewOut(
        id=iv.id, mode=iv.mode, role_title=iv.role_title, seniority=iv.seniority,
        status=iv.status, overall_score=iv.overall_score, summary=iv.summary,
        questions=[QuestionOut(id=q.id, idx=q.idx, question=q.question, answer=q.answer,
                               score=q.score, evaluation=json.loads(q.evaluation_json) if q.evaluation_json else None)
                   for q in sorted(iv.questions, key=lambda q: q.idx)]
    )

@router.post("", response_model=InterviewOut)
def create_interview(inp: InterviewCreate, db: Session = Depends(get_db), u: User = Depends(get_current_user)):
    iv = Interview(user_id=u.id, **inp.model_dump())
    db.add(iv); db.commit(); db.refresh(iv)
    return _to_out(iv)

@router.get("", response_model=list[InterviewOut])
def list_interviews(db: Session = Depends(get_db), u: User = Depends(get_current_user)):
    ivs = db.query(Interview).filter(Interview.user_id == u.id).order_by(Interview.created_at.desc()).all()
    return [_to_out(i) for i in ivs]

@router.get("/{iid}", response_model=InterviewOut)
def get_interview(iid: int, db: Session = Depends(get_db), u: User = Depends(get_current_user)):
    iv = db.query(Interview).filter(Interview.id == iid, Interview.user_id == u.id).first()
    if not iv: raise HTTPException(404, "Not found")
    return _to_out(iv)

@router.post("/next", response_model=NextQuestionOut)
def next_q(inp: NextQuestionIn, db: Session = Depends(get_db), u: User = Depends(get_current_user)):
    iv = db.query(Interview).filter(Interview.id == inp.interview_id, Interview.user_id == u.id).first()
    if not iv: raise HTTPException(404, "Not found")
    q_text = next_question(db, iv, inp.candidate_name or u.full_name)
    idx = len(iv.questions) + 1
    q = InterviewQuestion(interview_id=iv.id, idx=idx, question=q_text)
    db.add(q); db.commit(); db.refresh(q)
    return NextQuestionOut(question=q_text, idx=idx, question_id=q.id)

@router.post("/answer", response_model=SubmitAnswerOut)
def submit_answer(inp: SubmitAnswerIn, db: Session = Depends(get_db), u: User = Depends(get_current_user)):
    q = db.query(InterviewQuestion).filter(InterviewQuestion.id == inp.question_id).first()
    if not q: raise HTTPException(404, "Question not found")
    iv = db.query(Interview).filter(Interview.id == q.interview_id, Interview.user_id == u.id).first()
    if not iv: raise HTTPException(403, "Forbidden")
    q.answer = inp.answer
    ev = evaluate_answer(q.question, inp.answer, iv.mode)
    q.evaluation_json = json.dumps(ev)
    q.score = float(ev.get("overall", 5))
    db.commit()
    return SubmitAnswerOut(score=q.score, evaluation=ev)

@router.post("/{iid}/complete", response_model=CompleteOut)
def complete(iid: int, db: Session = Depends(get_db), u: User = Depends(get_current_user)):
    iv = db.query(Interview).filter(Interview.id == iid, Interview.user_id == u.id).first()
    if not iv: raise HTTPException(404, "Not found")
    s = summarize(iv)
    iv.overall_score = s["overall_score"]
    iv.summary = s["summary"]
    iv.status = "completed"
    iv.completed_at = datetime.now(timezone.utc)
    db.commit()
    return CompleteOut(**s)
