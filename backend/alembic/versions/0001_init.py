"""init

Revision ID: 0001
Revises:
Create Date: 2025-01-01
"""
from alembic import op
import sqlalchemy as sa

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    op.create_table("users",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("email", sa.String(255), unique=True, nullable=False, index=True),
        sa.Column("full_name", sa.String(255)),
        sa.Column("hashed_password", sa.String(255), nullable=False),
        sa.Column("role", sa.String(20), nullable=False, server_default="user"),
        sa.Column("is_active", sa.Boolean, nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_table("interview_templates",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("mode", sa.String(50), nullable=False),
        sa.Column("description", sa.Text),
        sa.Column("system_prompt", sa.Text),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_table("question_bank",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("category", sa.String(50), nullable=False, index=True),
        sa.Column("difficulty", sa.String(20), nullable=False, server_default="medium"),
        sa.Column("question", sa.Text, nullable=False),
        sa.Column("ideal_answer", sa.Text),
        sa.Column("tags", sa.Text),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_table("interviews",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("user_id", sa.Integer, sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("mode", sa.String(50), nullable=False),
        sa.Column("role_title", sa.String(255)),
        sa.Column("seniority", sa.String(50)),
        sa.Column("resume_text", sa.Text),
        sa.Column("jd_text", sa.Text),
        sa.Column("status", sa.String(20), nullable=False, server_default="in_progress"),
        sa.Column("overall_score", sa.Float),
        sa.Column("summary", sa.Text),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("completed_at", sa.DateTime(timezone=True)),
    )
    op.create_table("interview_questions",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("interview_id", sa.Integer, sa.ForeignKey("interviews.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("idx", sa.Integer, nullable=False),
        sa.Column("question", sa.Text, nullable=False),
        sa.Column("answer", sa.Text),
        sa.Column("evaluation_json", sa.Text),
        sa.Column("score", sa.Float),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

def downgrade():
    op.drop_table("interview_questions")
    op.drop_table("interviews")
    op.drop_table("question_bank")
    op.drop_table("interview_templates")
    op.drop_table("users")
