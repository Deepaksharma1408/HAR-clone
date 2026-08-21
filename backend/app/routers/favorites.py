from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User, Favorite, Listing
from ..schemas import ListingResponse
from .auth import get_current_user

router = APIRouter(prefix="/favorites", tags=["favorites"])

# GET /favorites - Get current user's favorited listings
@router.get("", response_model=List[ListingResponse])
def get_user_favorites(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    favorites = db.query(Favorite).filter(Favorite.user_id == current_user.id).all()
    listings = [fav.listing for fav in favorites if fav.listing]
    return listings

# POST /favorites/{listing_id} - Add listing to user's favorites
@router.post("/{listing_id}", status_code=status.HTTP_201_CREATED)
def add_favorite(
    listing_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Listing not found."
        )

    existing_fav = db.query(Favorite).filter(
        Favorite.user_id == current_user.id,
        Favorite.listing_id == listing_id
    ).first()

    if existing_fav:
        return {"status": "exists", "message": "Listing is already favorited."}

    new_fav = Favorite(user_id=current_user.id, listing_id=listing_id)
    db.add(new_fav)
    db.commit()

    return {"status": "success", "message": "Listing added to favorites."}

# DELETE /favorites/{listing_id} - Remove listing from user's favorites
@router.delete("/{listing_id}")
def remove_favorite(
    listing_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    fav = db.query(Favorite).filter(
        Favorite.user_id == current_user.id,
        Favorite.listing_id == listing_id
    ).first()

    if not fav:
        return {"status": "not_found", "message": "Listing was not favorited."}

    db.delete(fav)
    db.commit()

    return {"status": "success", "message": "Listing removed from favorites."}
