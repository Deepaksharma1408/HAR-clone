from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from ..database import get_db
from ..models import Listing
from ..schemas import (
    NeighborhoodStat,
    SchoolItem,
    CommuteSearchResponse,
    CommuteRadiusGroup,
    CommuteListingItem
)

router = APIRouter(prefix="", tags=["community"])

@router.get("/neighborhoods", response_model=List[NeighborhoodStat])
def get_neighborhoods(db: Session = Depends(get_db)):
    # Calculate live stats from Listing table per area
    areas_info = [
        {
            "name": "Memorial",
            "title": "Piney Point & Memorial Villages",
            "tagline": "Serene Wooded Estates & Elite School Districts",
            "safety": "96 / 100",
            "walkScore": "78 / 100",
            "highlights": ["Spring Branch ISD Schools", "Memorial City Mall & Medical Center", "Terry Hershey Park Trails"],
            "image": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
        },
        {
            "name": "Katy",
            "title": "Cinco Ranch & Greater Katy",
            "tagline": "Master-Planned Communities & Top Family Living",
            "safety": "94 / 100",
            "walkScore": "72 / 100",
            "highlights": ["Katy ISD 10/10 Schools", "LaCenterra Outdoor Town Center", "Water Parks & Lakes"],
            "image": "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80",
        },
        {
            "name": "The Heights",
            "title": "Historic Houston Heights",
            "tagline": "Walkable Historic Charm, Boutiques & Artisan Dining",
            "safety": "91 / 100",
            "walkScore": "92 / 100",
            "highlights": ["19th Street Shopping District", "Heights Hike & Bike Trail", "Craft Breweries & Bistros"],
            "image": "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80",
        },
        {
            "name": "Sugar Land",
            "title": "Sweetwater & First Colony",
            "tagline": "Lakeside Luxury, Master-Planned Communities & Fort Bend ISD",
            "safety": "95 / 100",
            "walkScore": "70 / 100",
            "highlights": ["Smart Financial Centre", "First Colony Mall", "Sugar Land Town Square"],
            "image": "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
        },
    ]

    result = []
    for area in areas_info:
        city_listings = db.query(Listing).filter(
            func.lower(Listing.city).like(f"%{area['name'].lower()}%"),
            Listing.status == "active"
        ).all()

        active_count = len(city_listings)
        
        # Calculate dynamic median price and price per sqft
        prices = [l.price for l in city_listings if l.price and l.type == "For Sale"]
        sqft_prices = [l.price / l.sqft for l in city_listings if l.sqft and l.sqft > 0 and l.price and l.type == "For Sale"]

        if prices:
            median_price = sorted(prices)[len(prices) // 2]
            median_fmt = f"${median_price:,.0f}"
        else:
            median_fmt = "$750,000"

        if sqft_prices:
            avg_sqft = sum(sqft_prices) / len(sqft_prices)
            sqft_fmt = f"${avg_sqft:,.0f} / sqft"
        else:
            sqft_fmt = "$280 / sqft"

        result.append(
            NeighborhoodStat(
                name=area["name"],
                title=area["title"],
                tagline=area["tagline"],
                safety=area["safety"],
                walkScore=area["walkScore"],
                avgPrice=sqft_fmt,
                medianHome=median_fmt,
                activeListingsCount=active_count,
                highlights=area["highlights"],
                image=area["image"]
            )
        )

    return result


@router.get("/schools", response_model=List[SchoolItem])
def get_schools(
    district: str = Query(None),
    level: str = Query(None),
    db: Session = Depends(get_db)
):
    schools_data = [
        {
            "name": "Seven Lakes High School",
            "district": "Katy ISD",
            "rating": "10/10",
            "level": "High",
            "students": "3,200",
            "ratio": "16:1",
            "city": "Katy",
            "address": "9251 S Fry Rd, Katy, TX",
        },
        {
            "name": "Memorial High School",
            "district": "Spring Branch ISD",
            "rating": "10/10",
            "level": "High",
            "students": "2,600",
            "ratio": "15:1",
            "city": "Memorial",
            "address": "935 Echo Ln, Houston, TX",
        },
        {
            "name": "Beckendorff Junior High",
            "district": "Katy ISD",
            "rating": "9/10",
            "level": "Middle",
            "students": "1,450",
            "ratio": "14:1",
            "city": "Katy",
            "address": "8200 S Fry Rd, Katy, TX",
        },
        {
            "name": "Spring Branch Middle School",
            "district": "Spring Branch ISD",
            "rating": "9/10",
            "level": "Middle",
            "students": "1,100",
            "ratio": "13:1",
            "city": "Memorial",
            "address": "1000 Piney Point Rd, Houston, TX",
        },
        {
            "name": "Fred and Patti Shafer Elementary",
            "district": "Katy ISD",
            "rating": "10/10",
            "level": "Elementary",
            "students": "980",
            "ratio": "14:1",
            "city": "Katy",
            "address": "5150 Ranch Point Dr, Katy, TX",
        },
        {
            "name": "Frostwood Elementary School",
            "district": "Spring Branch ISD",
            "rating": "10/10",
            "level": "Elementary",
            "students": "750",
            "ratio": "12:1",
            "city": "Memorial",
            "address": "12214 Memorial Dr, Houston, TX",
        },
        {
            "name": "Heights High School",
            "district": "Houston ISD",
            "rating": "8/10",
            "level": "High",
            "students": "2,400",
            "ratio": "17:1",
            "city": "The Heights",
            "address": "413 E 13th St, Houston, TX",
        },
        {
            "name": "Field Elementary School",
            "district": "Houston ISD",
            "rating": "9/10",
            "level": "Elementary",
            "students": "560",
            "ratio": "13:1",
            "city": "The Heights",
            "address": "703 E 17th St, Houston, TX",
        },
    ]

    result = []
    for s in schools_data:
        # Check district filter
        if district and district.lower() not in s["district"].lower() and district.lower() not in s["city"].lower():
            continue
        # Check level filter
        if level and level.lower() != "all" and level.lower() != s["level"].lower():
            continue

        # Count real nearby listings from DB
        nearby_count = db.query(Listing).filter(
            func.lower(Listing.city).like(f"%{s['city'].lower()}%"),
            Listing.status == "active"
        ).count()

        result.append(
            SchoolItem(
                name=s["name"],
                district=s["district"],
                rating=s["rating"],
                level=s["level"],
                students=s["students"],
                ratio=s["ratio"],
                city=s["city"],
                address=s["address"],
                nearbyListingsCount=nearby_count
            )
        )

    return result


@router.get("/commute/search", response_model=CommuteSearchResponse)
def search_commute(
    origin: str = Query("1000 Main St, Downtown Houston, TX"),
    max_minutes: int = Query(35),
    mode: str = Query("Drive"),
    db: Session = Depends(get_db)
):
    # Commute baseline estimates from Houston hubs
    commute_zones = [
        {
            "radius_label": "15-20 Min Commute Radius",
            "color_badge": "emerald",
            "region_title": "The Heights & Montrose",
            "city": "The Heights",
            "average_minutes": 18,
            "description": "Prime close-in neighborhood offering short 18-minute drive to Downtown HQ along I-10 and Memorial Drive.",
        },
        {
            "radius_label": "20-25 Min Commute Radius",
            "color_badge": "blue",
            "region_title": "Memorial & Spring Branch",
            "city": "Memorial",
            "average_minutes": 24,
            "description": "Quiet wooded estates with direct Westpark Tollway access, average 24-minute drive time.",
        },
        {
            "radius_label": "30-35 Min Commute Radius",
            "color_badge": "amber",
            "region_title": "Greater Katy & Cinco Ranch",
            "city": "Katy",
            "average_minutes": 32,
            "description": "Master-planned suburban communities with park-and-ride transit options, average 32-minute commute.",
        },
        {
            "radius_label": "35-45 Min Commute Radius",
            "color_badge": "purple",
            "region_title": "Sugar Land & First Colony",
            "city": "Sugar Land",
            "average_minutes": 38,
            "description": "Family-centric master planned neighborhoods along US-59 / I-69 corridor.",
        },
    ]

    # Adjust minutes based on mode
    mode_multiplier = 1.0
    if mode == "Transit":
        mode_multiplier = 1.35
    elif mode == "E-Bike":
        mode_multiplier = 1.6

    groups = []
    for zone in commute_zones:
        effective_minutes = int(round(zone["average_minutes"] * mode_multiplier))
        
        # Only include if within max_minutes tolerance
        if effective_minutes <= max_minutes + 5:
            # Query real listings in that city from DB
            listings = db.query(Listing).filter(
                func.lower(Listing.city).like(f"%{zone['city'].lower()}%"),
                Listing.status == "active"
            ).limit(4).all()

            listing_items = []
            for l in listings:
                img = l.images[0].image_url if l.images else "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80"
                p_fmt = f"${l.price:,.0f}" if l.type == "For Sale" else f"${l.price:,.0f}/mo"
                listing_items.append(
                    CommuteListingItem(
                        id=l.id,
                        address=l.address,
                        city=l.city,
                        price=l.price,
                        price_formatted=p_fmt,
                        beds=l.beds,
                        baths=l.baths,
                        sqft=l.sqft,
                        estimated_minutes=effective_minutes,
                        image_url=img
                    )
                )

            groups.append(
                CommuteRadiusGroup(
                    radius_label=f"{effective_minutes - 3}-{effective_minutes + 3} Min Radius",
                    color_badge=zone["color_badge"],
                    region_title=zone["region_title"],
                    description=zone["description"],
                    city=zone["city"],
                    average_minutes=effective_minutes,
                    listings=listing_items
                )
            )

    return CommuteSearchResponse(
        origin=origin,
        max_minutes=max_minutes,
        mode=mode,
        groups=groups
    )
