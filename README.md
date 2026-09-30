# AI Interview Platform

A production-ready **AI Voice Interview Platform** that simulates real-life job interviews using Google Gemini, FastAPI, and React 19.

## Features

- Real-time voice interviews (browser Speech Recognition / Speech Synthesis + optional Faster-Whisper backend)
- HR / Technical / Behavioral / Resume-based / Project Discussion modes
- Contextual follow-up questions with conversation memory (LangChain)
- Resume PDF upload + skill extraction
- Job description parsing and JD-matched questions
- Per-answer AI evaluation (10 metrics) + coaching mode
- Analytics dashboard with charts (Recharts)
- Admin panel for users, question bank, templates
- JWT auth, PostgreSQL, Alembic migrations
- Dockerized (docker-compose up)

## Tech Stack

**Frontend:** React 19, TypeScript, Vite, Tailwind, shadcn/ui, React Router, TanStack Query, Axios, Framer Motion, Recharts
**Backend:** Python 3.11, FastAPI, SQLAlchemy, Alembic, Pydantic v2, JWT
**AI:** Google Gemini, LangChain, FAISS, sentence-transformers
**Voice:** Browser Web Speech API, Faster-Whisper (server fallback), WebRTC, VAD
**DB:** PostgreSQL 16
**Deploy:** Docker + docker-compose

## Quick Start (Docker)

```bash
cp .env.example .env
# edit .env and set GEMINI_API_KEY
docker-compose up --build
```

- Frontend: http://localhost:5173
- Backend: http://localhost:8000
- API docs: http://localhost:8000/docs

## Local Development

### Backend
```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

See `docs/` for architecture, ER diagram, and deployment guide.

## License

MIT
