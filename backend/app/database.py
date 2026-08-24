import os
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from dotenv import load_dotenv

# Ensure .env is always loaded with override=True
env_file = Path(__file__).resolve().parent.parent / ".env"
if env_file.exists():
    load_dotenv(dotenv_path=env_file, override=True)
else:
    load_dotenv(override=True)

# PostgreSQL Database Configuration
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://estateline_user:IwkO5Bnm6BZE7PlTowPCSjY8BFwMtVxU@dpg-da5vbpjncjis73a7uq90-a.oregon-postgres.render.com/estateline"
)

# Standardize postgres:// to postgresql:// for SQLAlchemy compatibility (e.g. Supabase / Neon / Render / Railway)
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Configure PostgreSQL Engine with High-Performance Connection Pooling & Auto-Reconnect
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
else:
    engine = create_engine(
        DATABASE_URL,
        pool_size=20,
        max_overflow=40,
        pool_recycle=300,
        pool_timeout=15,
        pool_pre_ping=True
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
