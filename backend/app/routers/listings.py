import os
import shutil
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session, selectinload
from sqlalchemy import func

from ..database import get_db
from ..models import User, Agent, Listing, ListingImage, PriceHistoryEntry
from ..schemas import (
    ListingResponse,
    ListingCreate,
    ListingUpdate,
    ListingImageResponse,
    AgentProfileResponse,
    AgentDetailResponse,
    ListingStatsResponse
)
from .auth import get_current_user, get_current_agent

router = APIRouter(prefix="", tags=["listings"])

UPLOAD_DIR = "uploads"

def format_price(price: float, type_str: str) -> str:
    if type_str == "For Rent":
        return f"${price:,.0f}/mo"
    return f"${price:,.0f}"

# GET /listings/stats - Dynamic statistics counters
@router.get("/listings/stats", response_model=ListingStatsResponse)
def get_listing_stats(db: Session = Depends(get_db)):
    total = db.query(func.count(Listing.id)).scalar() or 0
    active = db.query(func.count(Listing.id)).filter(Listing.status == "active").scalar() or 0
    agents = db.query(func.count(Agent.id)).scalar() or 0
    return {
        "total_listings": total,
        "active_listings": active,
        "agent_count": agents
    }

from ..services.listings_filter import build_listings_filter_query

# GET /listings - Paginated Search & Filter
@router.get("/listings")
def get_listings(
    type: Optional[str] = None,
    tag: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    min_beds: Optional[int] = None,
    min_baths: Optional[float] = None,
    city: Optional[str] = None,
    sort: Optional[str] = "newest",
    page: int = 1,
    page_size: int = 10,
    db: Session = Depends(get_db)
):
    filter_params = {
        "type": type,
        "tag": tag,
        "min_price": min_price,
        "max_price": max_price,
        "min_beds": min_beds,
        "min_baths": min_baths,
        "city": city,
    }
    query = build_listings_filter_query(db, filter_params)

    # Apply sorting
    if sort == "price_asc":
        query = query.order_by(Listing.price.asc())
    elif sort == "price_desc":
        query = query.order_by(Listing.price.desc())
    elif sort == "beds":
        query = query.order_by(Listing.beds.desc(), Listing.price.desc())
    else:  # newest
        query = query.order_by(Listing.created_at.desc())

    # Pagination calculation
    total_count = query.count()
    offset = (page - 1) * page_size
    results = (
        query.options(
            selectinload(Listing.images),
            selectinload(Listing.agent),
            selectinload(Listing.price_history)
        )
        .offset(offset)
        .limit(page_size)
        .all()
    )

    return {
        "total": total_count,
        "page": page,
        "page_size": page_size,
        "results": [ListingResponse.model_validate(r) for r in results]
    }

# GET /listings/mine - Get all listings (active and unpublished) owned by current agent
@router.get("/listings/mine", response_model=List[ListingResponse])
def get_my_listings(
    current_user: User = Depends(get_current_agent),
    db: Session = Depends(get_db)
):
    agent = current_user.agent_profile
    if not agent:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current agent profile is missing."
        )
    listings = (
        db.query(Listing)
        .filter(Listing.agent_id == agent.id)
        .order_by(Listing.created_at.desc())
        .all()
    )
    return listings

# GET /listings/{id} - Detailed Single Listing
@router.get("/listings/{id}", response_model=ListingResponse)
def get_listing(id: int, db: Session = Depends(get_db)):
    listing = db.query(Listing).filter(Listing.id == id).first()
    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Listing not found."
        )
    return listing

# GET /listings/{id}/similar - Top 3 Similar Active Listings
@router.get("/listings/{id}/similar", response_model=List[ListingResponse])
def get_similar_listings(id: int, db: Session = Depends(get_db)):
    listing = db.query(Listing).filter(Listing.id == id).first()
    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Listing not found."
        )

    # Get other active listings
    others = db.query(Listing).filter(
        Listing.id != id,
        Listing.status == "active"
    ).all()

    # Score function to prioritize same city, same type, and closest price
    def similarity_score(other: Listing):
        score = 0
        if other.city.lower() == listing.city.lower():
            score += 10
        if other.type == listing.type:
            score += 5
        
        # Price proximity: smaller difference increases similarity
        price_diff = abs(other.price - listing.price)
        if listing.price > 0:
            pct_diff = price_diff / listing.price
            score += max(0, 10 * (1 - pct_diff)) # up to 10 points for price closeness
        return score

    # Sort others by similarity score in descending order
    sorted_others = sorted(others, key=similarity_score, reverse=True)
    return sorted_others[:3]

# POST /listings - Protected Create Listing
@router.post("/listings", response_model=ListingResponse, status_code=status.HTTP_201_CREATED)
def create_listing(
    listing_data: ListingCreate,
    current_user: User = Depends(get_current_agent),
    db: Session = Depends(get_db)
):
    agent = current_user.agent_profile
    if not agent:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current agent profile is missing."
        )

    new_listing = Listing(
        agent_id=agent.id,
        address=listing_data.address,
        city=listing_data.city,
        price=listing_data.price,
        type=listing_data.type,
        status=listing_data.status,
        beds=listing_data.beds,
        baths=listing_data.baths,
        sqft=listing_data.sqft,
        lot_size=listing_data.lot_size,
        description=listing_data.description,
        hue_color=listing_data.hue_color or "var(--sage-soft)"
    )
    db.add(new_listing)
    db.flush()

    # Log creation in price history
    price_history = PriceHistoryEntry(
        listing_id=new_listing.id,
        event="Listed",
        price_label=format_price(new_listing.price, new_listing.type)
    )
    db.add(price_history)
    db.commit()
    db.refresh(new_listing)

    return new_listing

# PUT /listings/{id} - Protected Update Listing (Must Own)
@router.put("/listings/{id}", response_model=ListingResponse)
def update_listing(
    id: int,
    listing_data: ListingUpdate,
    current_user: User = Depends(get_current_agent),
    db: Session = Depends(get_db)
):
    listing = db.query(Listing).filter(Listing.id == id).first()
    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Listing not found."
        )

    # Ownership check
    if listing.agent_id != current_user.agent_profile.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to modify listings you do not own."
        )

    # Trace price updates
    price_changed = False
    old_price = listing.price
    old_type = listing.type

    for key, value in listing_data.model_dump(exclude_unset=True).items():
        setattr(listing, key, value)
        if key == "price" and value != old_price:
            price_changed = True

    if price_changed:
        event_name = "Price Cut" if listing.price < old_price else "Price Increase"
        price_history = PriceHistoryEntry(
            listing_id=listing.id,
            event=event_name,
            price_label=format_price(listing.price, listing.type)
        )
        db.add(price_history)

    db.commit()
    db.refresh(listing)
    return listing

# DELETE /listings/{id} - Protected Delete Listing (Must Own)
@router.delete("/listings/{id}")
def delete_listing(
    id: int,
    current_user: User = Depends(get_current_agent),
    db: Session = Depends(get_db)
):
    listing = db.query(Listing).filter(Listing.id == id).first()
    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Listing not found."
        )

    # Ownership check
    if listing.agent_id != current_user.agent_profile.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to delete listings you do not own."
        )

    db.delete(listing)
    db.commit()
    return {"status": "success", "message": "Listing deleted successfully."}

# POST /listings/{id}/images - Upload Images
@router.post("/listings/{id}/images", response_model=List[ListingImageResponse])
def upload_listing_images(
    id: int,
    files: List[UploadFile] = File(...),
    current_user: User = Depends(get_current_agent),
    db: Session = Depends(get_db)
):
    listing = db.query(Listing).filter(Listing.id == id).first()
    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Listing not found."
        )

    # Ownership check
    if listing.agent_id != current_user.agent_profile.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to upload photos to listings you do not own."
        )

    os.makedirs(UPLOAD_DIR, exist_ok=True)
    
    # Get current max order of existing images
    max_order = db.query(func.max(ListingImage.order)).filter(ListingImage.listing_id == id).scalar() or 0
    
    c_cloud_name = os.getenv("CLOUDINARY_CLOUD_NAME", "")
    c_api_key = os.getenv("CLOUDINARY_API_KEY", "")
    c_api_secret = os.getenv("CLOUDINARY_API_SECRET", "")

    uploaded_images = []
    for idx, file in enumerate(files):
        ext = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{ext}"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        image_url = f"/uploads/{unique_filename}"

        # If Cloudinary API is configured, upload to Cloudinary CDN
        if c_cloud_name and c_api_key and c_api_secret:
            try:
                import time, hashlib
                timestamp = str(int(time.time()))
                to_sign = f"timestamp={timestamp}{c_api_secret}"
                signature = hashlib.sha1(to_sign.encode("utf-8")).hexdigest()

                with open(file_path, "rb") as f_img:
                    file_bytes = f_img.read()

                # Multipart form upload to Cloudinary API
                boundary = "----CloudinaryBoundary" + str(uuid.uuid4().hex)
                body = []
                
                # Add file param
                body.append(f"--{boundary}".encode())
                body.append(f'Content-Disposition: form-data; name="file"; filename="{unique_filename}"'.encode())
                body.append(b"Content-Type: application/octet-stream\r\n")
                body.append(file_bytes)

                # Add params
                for k, v in [("api_key", c_api_key), ("timestamp", timestamp), ("signature", signature)]:
                    body.append(f"--{boundary}".encode())
                    body.append(f'Content-Disposition: form-data; name="{k}"\r\n'.encode())
                    body.append(v.encode())

                body.append(f"--{boundary}--".encode())
                payload_bytes = b"\r\n".join(body)

                req = urllib.request.Request(
                    f"https://api.cloudinary.com/v1_1/{c_cloud_name}/image/upload",
                    data=payload_bytes,
                    headers={"Content-Type": f"multipart/form-data; boundary={boundary}"}
                )
                with urllib.request.urlopen(req) as c_resp:
                    c_data = json.loads(c_resp.read().decode("utf-8"))
                    if "secure_url" in c_data:
                        image_url = c_data["secure_url"]
            except Exception as c_err:
                print(f"Cloudinary upload fallback to local: {c_err}")
            
        new_image = ListingImage(
            listing_id=id,
            image_url=image_url,
            order=max_order + idx + 1
        )
        db.add(new_image)
        uploaded_images.append(new_image)

    db.commit()
    for img in uploaded_images:
        db.refresh(img)
        
    return uploaded_images

# GET /agents - List All Agents
@router.get("/agents", response_model=List[AgentProfileResponse])
def get_agents(db: Session = Depends(get_db)):
    agents = db.query(Agent).all()
    return agents

# GET /agents/{id} - Agent profile details + their active listings
@router.get("/agents/{id}", response_model=AgentDetailResponse)
def get_agent_profile(id: int, db: Session = Depends(get_db)):
    agent = db.query(Agent).filter(Agent.id == id).first()
    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent profile not found."
        )
    
    # Fetch agent listings explicitly (filtering for active ones)
    active_listings = db.query(Listing).filter(
        Listing.agent_id == id,
        Listing.status == "active"
    ).order_by(Listing.created_at.desc()).all()

    # Package as AgentDetailResponse format
    return {
        "id": agent.id,
        "role_title": agent.role_title,
        "bio": agent.bio,
        "user": agent.user,
        "listings": active_listings
    }
