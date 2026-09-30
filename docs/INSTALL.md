# Installation Guide

## Prerequisites
- Docker & docker-compose, OR Node 20+ and Python 3.11+ with PostgreSQL 16
- A Google Gemini API key (https://aistudio.google.com/app/apikey)

## Docker (recommended)
```bash
cp .env.example .env
# set GEMINI_API_KEY in .env
docker-compose up --build
```
Visit http://localhost:5173.

## Local
### Postgres
Start a PostgreSQL 16 instance and create a database `interview` with user `interview`/`interview`.

### Backend
```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
export DATABASE_URL=postgresql+psycopg2://interview:interview@localhost:5432/interview
export GEMINI_API_KEY=your-key
alembic upgrade head
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
echo "VITE_API_URL=http://localhost:8000/api/v1" > .env
npm run dev
```
