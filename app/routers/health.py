from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy.sql import text
from ..database import get_db

router = APIRouter(prefix="/health", tags=["health"])

@router.get("")
def health_check(db: Session = Depends(get_db)):
    try:
        # Perform a simple database lookup to ensure connectivity is working
        db.execute(text("SELECT 1"))
        db_status = "healthy"
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"
        
    return {
        "status": "online",
        "database": db_status,
        "service": "estateline-backend"
    }
