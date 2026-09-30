from pydantic import BaseModel
from typing import Any

class InterviewCreate(BaseModel):
    mode: str
    role_title: str | None = None
    seniority: str | None = None
    resume_text: str | None = None
    jd_text: str | None = None

class QuestionOut(BaseModel):
    id: int
    idx: int
    question: str
    answer: str | None = None
    score: float | None = None
    evaluation: Any | None = None

class InterviewOut(BaseModel):
    id: int
    mode: str
    role_title: str | None = None
    seniority: str | None = None
    status: str
    overall_score: float | None = None
    summary: str | None = None
    questions: list[QuestionOut] = []

class NextQuestionIn(BaseModel):
    interview_id: int
    candidate_name: str | None = None

class NextQuestionOut(BaseModel):
    question: str
    idx: int
    question_id: int

class SubmitAnswerIn(BaseModel):
    question_id: int
    answer: str

class SubmitAnswerOut(BaseModel):
    score: float
    evaluation: dict

class CompleteOut(BaseModel):
    overall_score: float
    summary: str
