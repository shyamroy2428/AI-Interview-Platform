# API Reference

Interactive Swagger UI: `http://localhost:8000/docs`

## Auth
- `POST /api/v1/auth/register` — { email, password, full_name }
- `POST /api/v1/auth/login` — { email, password } → { access_token }
- `GET  /api/v1/auth/me`

## Interviews
- `POST /api/v1/interviews` — create session
- `GET  /api/v1/interviews` — list
- `GET  /api/v1/interviews/{id}`
- `POST /api/v1/interviews/next` — next question
- `POST /api/v1/interviews/answer` — submit answer + evaluate
- `POST /api/v1/interviews/{id}/complete` — finalize + summary

## Resume / Voice / Analytics / Admin
See Swagger.
