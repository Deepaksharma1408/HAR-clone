from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User, Lead, Listing
from ..schemas import LeadCreate, LeadResponse, LeadMineResponse
from ..email import send_email
from .auth import get_current_agent

router = APIRouter(prefix="/listings/{listing_id}/leads", tags=["leads"])
mine_router = APIRouter(prefix="/leads", tags=["leads"])

@router.post("", response_model=LeadResponse, status_code=status.HTTP_201_CREATED)
def submit_lead(
    listing_id: int,
    lead_data: LeadCreate,
    db: Session = Depends(get_db)
):
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Listing not found. Cannot submit inquiry."
        )

    new_lead = Lead(
        listing_id=listing_id,
        name=lead_data.name,
        phone=lead_data.phone,
        message=lead_data.message
    )
    db.add(new_lead)
    db.commit()
    db.refresh(new_lead)

    # Fetch agent details to notify them via console email log
    agent = listing.agent
    if agent and agent.user:
        subject = f"New Inquiry for Property at {listing.address}, {listing.city}"
        email_body = f"""Dear {agent.user.full_name},

You have received a new inquiry on your listing at:
{listing.address}, {listing.city} (Listed at: ${listing.price:,.2f})

Lead Information:
Name: {lead_data.name}
Phone: {lead_data.phone or 'Not Provided'}
Message:
"{lead_data.message}"

Please review this lead in your dashboard.

Sincerely,
The Estateline System
"""
        # Stub call which prints to console
        send_email(to_email=agent.user.email, subject=subject, body=email_body)

    return new_lead


@router.get("", response_model=List[LeadResponse])
def get_listing_leads(
    listing_id: int,
    current_user: User = Depends(get_current_agent),
    db: Session = Depends(get_db)
):
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Listing not found."
        )

    # Ownership check
    if listing.agent_id != current_user.agent_profile.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to view leads for listings you do not own."
        )

    leads = db.query(Lead).filter(Lead.listing_id == listing_id).order_by(Lead.created_at.desc()).all()
    return leads


# GET /leads/mine - Return all leads across listings owned by current agent
@mine_router.get("/mine", response_model=List[LeadMineResponse])
def get_my_leads(
    current_user: User = Depends(get_current_agent),
    db: Session = Depends(get_db)
):
    agent_id = current_user.agent_profile.id
    
    # Join Lead and Listing filtering by current agent
    results = (
        db.query(Lead, Listing)
        .join(Listing, Lead.listing_id == Listing.id)
        .filter(Listing.agent_id == agent_id)
        .order_by(Lead.created_at.desc())
        .all()
    )

    mine_leads = []
    for lead, listing in results:
        mine_leads.append(
            LeadMineResponse(
                id=lead.id,
                listing_id=lead.listing_id,
                listing_address=listing.address,
                listing_city=listing.city,
                name=lead.name,
                phone=lead.phone,
                message=lead.message,
                created_at=lead.created_at
            )
        )

    return mine_leads
