# Architecture

```
┌──────────────┐    HTTPS/JSON    ┌──────────────┐    SQL    ┌────────────┐
│ React 19 SPA │ ───────────────► │ FastAPI      │ ────────► │ PostgreSQL │
│ (Vite, TS)   │                  │ + LangChain  │           └────────────┘
└──────┬───────┘                  │ + Gemini SDK │
       │ Web Speech API           │ + Whisper    │
       ▼                          └──────┬───────┘
   Browser mic/TTS                       │
                                         ▼
                              Google Gemini API
```

- **Frontend** owns the voice loop (STT + TTS) for low latency; server offers `/voice/transcribe` for Whisper fallback.
- **Backend** persists sessions and runs Gemini for question generation and evaluation. LangChain composes prompts with running conversation memory.
- **Database** stores users, interviews, per-question answers + evaluation JSON.
- **Auth** is stateless JWT.

## ER (simplified)
```
users(id PK, email UNIQUE, hashed_password, role) 1 ──┐
                                                      ├─ interviews(id PK, user_id FK, mode, ...)
                                                      │        │
                                                      │        └─ interview_questions(id PK, interview_id FK, idx, question, answer, score, evaluation_json)
question_bank(id, category, difficulty, question)
interview_templates(id, mode, system_prompt)
```
