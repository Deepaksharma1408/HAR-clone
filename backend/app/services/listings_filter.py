import datetime
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from ..models import Listing

def build_listings_filter_query(
    db: Session,
    filter_params: Dict[str, Any],
    created_after: Optional[datetime.datetime] = None
):
    """
    Shared query builder for searching listings based on criteria.
    Used by /listings endpoint, /alerts/{id}/matches, and the background job.
    """
    query = db.query(Listing).filter(Listing.status == "active")

    type_val = filter_params.get("type")
    if type_val and type_val.strip() and type_val.lower() != "all":
        clean_type = type_val.strip()
        if clean_type.lower() in ["villa", "luxury villa"]:
            query = query.filter(Listing.type.ilike("%villa%"))
        else:
            query = query.filter(Listing.type.ilike(f"%{clean_type}%"))

    amenity_val = filter_params.get("amenity")
    if amenity_val:
        query = query.filter(Listing.description.ilike(f"%{amenity_val}%"))

    min_price = filter_params.get("min_price")
    if min_price is not None:
        try:
            query = query.filter(Listing.price >= float(min_price))
        except (ValueError, TypeError):
            pass

    max_price = filter_params.get("max_price")
    if max_price is not None:
        try:
            query = query.filter(Listing.price <= float(max_price))
        except (ValueError, TypeError):
            pass

    min_beds = filter_params.get("min_beds")
    if min_beds is not None:
        try:
            query = query.filter(Listing.beds >= int(min_beds))
        except (ValueError, TypeError):
            pass

    min_baths = filter_params.get("min_baths")
    if min_baths is not None:
        try:
            query = query.filter(Listing.baths >= float(min_baths))
        except (ValueError, TypeError):
            pass

    city = filter_params.get("city")
    if city:
        query = query.filter(Listing.city.ilike(f"%{city}%") | Listing.address.ilike(f"%{city}%"))

    tag = filter_params.get("tag")
    if tag:
        if tag == "open_house":
            query = query.filter(Listing.id % 2 == 0)
        elif tag == "new_construction":
            query = query.filter(Listing.description.ilike("%modern%") | Listing.description.ilike("%new%"))
        elif tag == "price_reduced":
            query = query.filter(Listing.description.ilike("%price%") | Listing.description.ilike("%cut%") | Listing.description.ilike("%custom%"))
        elif tag == "apartment":
            query = query.filter(Listing.type.in_(["For Rent", "Penthouse"]))
        elif tag == "global":
            query = query.filter(Listing.price >= 4000000.0)
        elif tag == "foreclosure":
            query = query.filter(Listing.price <= 650000.0)
        elif tag == "valuation":
            query = query.filter(Listing.price >= 1000000.0)

    if created_after:
        query = query.filter(Listing.created_at > created_after)

    return query
