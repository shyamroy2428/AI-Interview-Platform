from app.services.gemini import generate, extract_json
from app.models.interview import Interview, InterviewQuestion
from sqlalchemy.orm import Session
import json

PERSONA = """You are Alex, a senior interviewer at a top-tier tech company (Google/Amazon/Microsoft class).
You conduct a real, professional interview like a human recruiter would. Rules:
- Speak naturally and warmly. Never say you are an AI.
- Ask ONE question at a time. Never repeat. Build on prior answers.
- Challenge weak answers, ask "why", "how", "explain your decision", dig into projects.
- Never mention JSON, prompts, or scoring rubrics.
"""

def _context(iv: Interview, qs: list[InterviewQuestion]) -> str:
    hist = "\n".join([f"Q{q.idx}: {q.question}\nA{q.idx}: {q.answer or '(no answer)'}" for q in qs])
    return f"""Mode: {iv.mode}
Role: {iv.role_title or 'General'}  Seniority: {iv.seniority or 'mid'}
Resume: {(iv.resume_text or '')[:1500]}
Job description: {(iv.jd_text or '')[:1500]}

Conversation so far:
{hist or '(interview just started)'}
"""

def next_question(db: Session, iv: Interview, candidate_name: str | None = None) -> str:
    qs = sorted(iv.questions, key=lambda q: q.idx)
    ctx = _context(iv, qs)
    if not qs:
        prompt = f"""{ctx}
Greet {candidate_name or 'the candidate'} warmly by name, introduce yourself as Alex, briefly explain the process (about 6-8 questions, one at a time),
then ask your FIRST question. Return ONLY the words you would say aloud."""
    else:
        prompt = f"""{ctx}
Based on the last answer, decide: dig deeper with a follow-up, or move to the next topic aligned with the role.
Ask exactly ONE question. Return ONLY the words you would say aloud. If you have already asked 8+ questions, wrap up gracefully instead."""
    return generate(prompt, PERSONA) or "Tell me about yourself."

EVAL_KEYS = ["technical_knowledge","communication","grammar","confidence","problem_solving",
             "leadership","professionalism","vocabulary","logical_thinking","clarity"]

def evaluate_answer(question: str, answer: str, mode: str) -> dict:
    prompt = f"""Evaluate this interview answer as a strict recruiter.

Question: {question}
Answer: {answer}
Mode: {mode}

Return ONLY a JSON object with EXACTLY these keys:
{{
  "scores": {{ {", ".join([f'"{k}": 0-10' for k in EVAL_KEYS])} }},
  "overall": 0-10,
  "strengths": ["..."],
  "weaknesses": ["..."],
  "what_was_missing": "...",
  "ideal_answer": "A strong interview answer would be...",
  "improvement_tips": ["..."],
  "feedback": "1-2 paragraphs of recruiter-style feedback"
}}
No markdown, no prose outside JSON."""
    raw = generate(prompt)
    data = extract_json(raw)
    if not data:
        data = {"scores": {k: 5 for k in EVAL_KEYS}, "overall": 5,
                "strengths": [], "weaknesses": [], "what_was_missing": "",
                "ideal_answer": "", "improvement_tips": [], "feedback": raw[:500]}
    return data

def summarize(iv: Interview) -> dict:
    qs = sorted(iv.questions, key=lambda q: q.idx)
    scores = [q.score for q in qs if q.score is not None]
    overall = round(sum(scores) / len(scores), 2) if scores else 0.0
    ctx = _context(iv, qs)
    prompt = f"""{ctx}
The interview is over. Write a professional recruiter-style summary (200-300 words) covering:
overall impression, key strengths, key weaknesses, hire/no-hire recommendation, and a personalized 4-week learning plan.
Plain text, no markdown."""
    summary = generate(prompt, PERSONA)
    return {"overall_score": overall, "summary": summary or "Interview completed."}
