from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Listing, OpenHouseRSVP
from ..schemas import OpenHouseItemResponse, OpenHouseRSVPCreate, OpenHouseRSVPResponse
from ..email import send_email

router = APIRouter(prefix="/open-houses", tags=["open-houses"])

@router.get("", response_model=List[OpenHouseItemResponse])
def get_open_houses(db: Session = Depends(get_db)):
    # Fetch active listings from DB
    listings = db.query(Listing).filter(Listing.status == "active").all()
    
    open_houses = []
    # Deterministic dynamic schedule for properties
    schedule_slots = [
        "Saturday, 10:00 AM – 2:00 PM",
        "Sunday, 1:00 PM – 4:00 PM",
        "Sunday, 2:00 PM – 5:00 PM",
        "Saturday, 12:00 PM – 3:00 PM",
    ]

    for idx, l in enumerate(listings):
        time_slot = l.open_house_time or schedule_slots[idx % len(schedule_slots)]
        agent_name = l.agent.user.full_name if l.agent and l.agent.user else "Estateline Partner"
        agent_role = l.agent.role_title if l.agent else "Licensed Texas Realtor"
        image_url = l.images[0].image_url if l.images else "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80"
        price_fmt = f"${l.price:,.0f}" if l.type == "For Sale" else f"${l.price:,.0f}/mo"

        open_houses.append(
            OpenHouseItemResponse(
                id=l.id,
                listing_id=l.id,
                address=l.address,
                city=l.city,
                price=l.price,
                price_formatted=price_fmt,
                beds=l.beds,
                baths=l.baths,
                sqft=l.sqft,
                open_house_time=time_slot,
                agent_name=agent_name,
                agent_role=agent_role,
                image_url=image_url
            )
        )

    return open_houses


@router.post("/rsvp", response_model=OpenHouseRSVPResponse, status_code=status.HTTP_201_CREATED)
def rsvp_open_house(
    rsvp_data: OpenHouseRSVPCreate,
    db: Session = Depends(get_db)
):
    listing = db.query(Listing).filter(Listing.id == rsvp_data.listing_id).first()
    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Listing not found for this open house event."
        )

    new_rsvp = OpenHouseRSVP(
        listing_id=rsvp_data.listing_id,
        name=rsvp_data.name,
        email=rsvp_data.email,
        phone=rsvp_data.phone,
        attendees=rsvp_data.attendees,
        preferred_time=rsvp_data.preferred_time
    )
    db.add(new_rsvp)
    db.commit()
    db.refresh(new_rsvp)

    # Send confirmation email to attendee
    subject = f"Open House RSVP Confirmed: {listing.address}, {listing.city}"
    body = f"""Dear {rsvp_data.name},

Your Open House visit has been confirmed!

Property: {listing.address}, {listing.city}
Attendees: {rsvp_data.attendees}
Host: {listing.agent.user.full_name if listing.agent and listing.agent.user else 'Estateline Host'}

We look forward to welcoming you.

Best regards,
The Estateline Team
"""
    send_email(to_email=rsvp_data.email, subject=subject, body=body)

    return OpenHouseRSVPResponse(
        id=new_rsvp.id,
        listing_id=new_rsvp.listing_id,
        name=new_rsvp.name,
        email=new_rsvp.email,
        attendees=new_rsvp.attendees,
        message=f"RSVP successfully confirmed for {listing.address}!",
        created_at=new_rsvp.created_at
    )
