import json
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User, SavedAlert
from ..schemas import (
    SavedAlertCreate,
    SavedAlertResponse,
    SavedAlertFilterSchema,
    AlertMatchesResponse,
    ListingResponse
)
from ..services.listings_filter import build_listings_filter_query
from .auth import get_current_user

router = APIRouter(prefix="/alerts", tags=["alerts"])

def parse_alert_response(alert: SavedAlert) -> SavedAlertResponse:
    filter_dict = json.loads(alert.filters) if isinstance(alert.filters, str) else alert.filters
    return SavedAlertResponse(
        id=alert.id,
        user_id=alert.user_id,
        name=alert.name,
        filters=SavedAlertFilterSchema(**filter_dict),
        created_at=alert.created_at,
        last_checked_at=alert.last_checked_at
    )

# GET /alerts - Get user's saved alerts
@router.get("", response_model=List[SavedAlertResponse])
def get_user_alerts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    alerts = db.query(SavedAlert).filter(SavedAlert.user_id == current_user.id).order_by(SavedAlert.created_at.desc()).all()
    return [parse_alert_response(a) for a in alerts]

# POST /alerts - Create a new saved alert
@router.post("", response_model=SavedAlertResponse, status_code=status.HTTP_201_CREATED)
def create_saved_alert(
    alert_data: SavedAlertCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    filters_dict = alert_data.filters.model_dump(exclude_unset=True)
    filters_json = json.dumps(filters_dict)

    new_alert = SavedAlert(
        user_id=current_user.id,
        name=alert_data.name,
        filters=filters_json
    )
    db.add(new_alert)
    db.commit()
    db.refresh(new_alert)

    return parse_alert_response(new_alert)

# DELETE /alerts/{id} - Delete saved alert
@router.delete("/{id}")
def delete_saved_alert(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    alert = db.query(SavedAlert).filter(
        SavedAlert.id == id,
        SavedAlert.user_id == current_user.id
    ).first()

    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Saved alert not found."
        )

    db.delete(alert)
    db.commit()
    return {"status": "success", "message": "Saved alert deleted."}

# GET /alerts/{id}/matches - Run alert filters against listings
@router.get("/{id}/matches", response_model=AlertMatchesResponse)
def get_alert_matches(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    alert = db.query(SavedAlert).filter(
        SavedAlert.id == id,
        SavedAlert.user_id == current_user.id
    ).first()

    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Saved alert not found."
        )

    filter_dict = json.loads(alert.filters) if isinstance(alert.filters, str) else alert.filters
    
    # Run shared query filter logic
    query = build_listings_filter_query(db, filter_dict)
    matches = query.all()

    return AlertMatchesResponse(
        alert_id=alert.id,
        name=alert.name,
        match_count=len(matches),
        matches=[ListingResponse.model_validate(m) for m in matches]
    )
