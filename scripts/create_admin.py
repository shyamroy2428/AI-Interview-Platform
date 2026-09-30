"""Create the first admin user. Run inside the backend container:
docker-compose exec backend python /app/../scripts/create_admin.py admin@example.com password 'Admin Name'
"""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))
from app.db.session import SessionLocal
from app.models.user import User
from app.core.security import hash_password

if len(sys.argv) < 3:
    print("Usage: create_admin.py <email> <password> [full_name]"); sys.exit(1)

email, pw = sys.argv[1], sys.argv[2]
name = sys.argv[3] if len(sys.argv) > 3 else None
db = SessionLocal()
u = db.query(User).filter(User.email == email).first()
if u:
    u.role = "admin"; u.hashed_password = hash_password(pw); print("Updated existing user to admin.")
else:
    u = User(email=email, hashed_password=hash_password(pw), full_name=name, role="admin")
    db.add(u); print("Created admin.")
db.commit()
