from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.deps import get_db, get_current_user
from app.core.security import hash_password, verify_password, create_access_token
from app.models.user import User
from app.schemas.auth import RegisterIn, LoginIn, TokenOut

router = APIRouter()

@router.post("/register", response_model=TokenOut)
def register(inp: RegisterIn, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == inp.email).first():
        raise HTTPException(400, "Email already registered")
    u = User(email=inp.email, full_name=inp.full_name, hashed_password=hash_password(inp.password))
    db.add(u); db.commit(); db.refresh(u)
    tok = create_access_token(u.email, u.role)
    return TokenOut(access_token=tok, role=u.role, email=u.email, full_name=u.full_name)

@router.post("/login", response_model=TokenOut)
def login(inp: LoginIn, db: Session = Depends(get_db)):
    u = db.query(User).filter(User.email == inp.email).first()
    if not u or not verify_password(inp.password, u.hashed_password):
        raise HTTPException(401, "Invalid credentials")
    tok = create_access_token(u.email, u.role)
    return TokenOut(access_token=tok, role=u.role, email=u.email, full_name=u.full_name)

@router.get("/me")
def me(u: User = Depends(get_current_user)):
    return {"id": u.id, "email": u.email, "full_name": u.full_name, "role": u.role}
