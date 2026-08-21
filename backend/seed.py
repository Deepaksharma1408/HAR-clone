import sys
import os
import datetime

# Add parent directory to path so app is importable
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal, Base, engine
from app.models import User, Agent, Listing, ListingImage, PriceHistoryEntry
from app.routers.auth import hash_password

def seed_db():
    print("Recreating database tables...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        print("Seeding database...")
        
        # 4 Realistic Agents
        agents_data = [
            {
                "email": "rhea@estateline.com",
                "name": "Rhea Malhotra",
                "role_title": "Buyer's Agent · Katy",
                "bio": "Specializing in suburban family homes with over 8 years of experience helping buyers secure the best possible value in Katy and surrounding communities."
            },
            {
                "email": "sarah@estateline.com",
                "name": "Sarah Jenkins",
                "role_title": "Luxury Specialist · Memorial",
                "bio": "Connecting discerning clients with high-end architectural estates. Elite service, complete confidentiality, and unmatched market knowledge in Memorial and River Oaks."
            },
            {
                "email": "david@estateline.com",
                "name": "David Chen",
                "role_title": "Commercial & Land · Sugar Land",
                "bio": "Guiding developers, investors, and business owners through commercial acquisitions, land development, and retail leasing across Sugar Land and Greater Houston."
            },
            {
                "email": "marcus@estateline.com",
                "name": "Marcus Thompson",
                "role_title": "Listing Specialist · The Heights",
                "bio": "Maximizing seller returns through dynamic digital staging, editorial architectural photography, and target marketing inside the historic Houston Heights."
            }
        ]

        agent_map = {} # Maps email -> Agent model object

        for data in agents_data:
            print(f"Creating user and agent profile for: {data['name']}")
            hashed_pw = hash_password("password123")  # Default seed password
            
            # Create user
            user = User(
                email=data["email"],
                hashed_password=hashed_pw,
                role="agent",
                full_name=data["name"],
                is_verified=True
            )
            db.add(user)
            db.flush()  # Get user.id
            
            # Create agent profile
            agent = Agent(
                user_id=user.id,
                role_title=data["role_title"],
                bio=data["bio"]
            )
            db.add(agent)
            db.flush()
            
            agent_map[data["email"]] = agent

        # 36 Detailed Sample Listings (6 for each Buy/Rent category) with Unique High-Res Photos
        listings_data = [
            # --- 1. FOR SALE (6 Properties) ---
            {
                "agent_email": "rhea@estateline.com",
                "address": "1204 Oak Ridge Lane",
                "city": "Katy",
                "price": 625000.0,
                "type": "For Sale",
                "status": "active",
                "beds": 4,
                "baths": 3.0,
                "sqft": 2800,
                "lot_size": 0.25,
                "hue_color": "#E4E9E2",
                "image_url": "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
                "description": "Exquisite mid-century modern home nestled in Katy. Featuring open-plan layout, custom oak cabinetry, floor-to-ceiling glass, and landscaped backyard retreat.",
                "history": [{"event": "Listed", "price": 640000.0, "days_ago": 30}, {"event": "Price Cut", "price": 625000.0, "days_ago": 5}]
            },
            {
                "agent_email": "rhea@estateline.com",
                "address": "4509 Cinco Ranch Blvd",
                "city": "Katy",
                "price": 450000.0,
                "type": "For Sale",
                "status": "active",
                "beds": 3,
                "baths": 2.0,
                "sqft": 2200,
                "lot_size": 0.18,
                "hue_color": "#B8862E",
                "image_url": "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80",
                "description": "Charming traditional craftsman style cottage inside Cinco Ranch. Offers high ceilings, custom brick fireplace, chef-grade kitchen appliances, and top Katy ISD schools.",
                "history": [{"event": "Listed", "price": 450000.0, "days_ago": 12}]
            },
            {
                "agent_email": "marcus@estateline.com",
                "address": "612 Harvard Street",
                "city": "The Heights",
                "price": 895000.0,
                "type": "For Sale",
                "status": "active",
                "beds": 3,
                "baths": 2.5,
                "sqft": 2100,
                "lot_size": 0.12,
                "hue_color": "#E4E9E2",
                "image_url": "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
                "description": "Historic Heights Victorian bungalow updated for modern life. Features heart pine floors, wrap-around front porch, custom trim work, and modern kitchen extensions.",
                "history": [{"event": "Listed", "price": 895000.0, "days_ago": 14}]
            },
            {
                "agent_email": "sarah@estateline.com",
                "address": "2910 River Oaks Blvd",
                "city": "Memorial",
                "price": 4250000.0,
                "type": "For Sale",
                "status": "active",
                "beds": 5,
                "baths": 6.0,
                "sqft": 6500,
                "lot_size": 0.75,
                "hue_color": "#B8862E",
                "image_url": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
                "description": "Architectural tour de force designed by modernists. Raw concrete styling, double-height glass, heated lap pool, separate guest quarters, and secure gated motor court.",
                "history": [{"event": "Listed", "price": 4500000.0, "days_ago": 60}, {"event": "Price Cut", "price": 4250000.0, "days_ago": 20}]
            },
            {
                "agent_email": "sarah@estateline.com",
                "address": "3411 Memorial Drive",
                "city": "Memorial",
                "price": 6500000.0,
                "type": "For Sale",
                "status": "active",
                "beds": 6,
                "baths": 7.5,
                "sqft": 8200,
                "lot_size": 1.1,
                "hue_color": "#E4E9E2",
                "image_url": "https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?auto=format&fit=crop&w=1200&q=80",
                "description": "Superb classical estate surrounded by century-old oaks. Grand entrance hall, custom library, home cinema, full wellness wing, and private forest views.",
                "history": [{"event": "Listed", "price": 6800000.0, "days_ago": 120}, {"event": "Price Cut", "price": 6500000.0, "days_ago": 30}]
            },
            {
                "agent_email": "rhea@estateline.com",
                "address": "7802 Westheimer Road",
                "city": "Memorial",
                "price": 1150000.0,
                "type": "For Sale",
                "status": "active",
                "beds": 4,
                "baths": 3.5,
                "sqft": 3400,
                "lot_size": 0.32,
                "hue_color": "#B8862E",
                "image_url": "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80",
                "description": "Contemporary brick manor featuring formal dining, expanded chef kitchen, custom outdoor fireplace, and private swimming pool with mature oak trees.",
                "history": [{"event": "Listed", "price": 1150000.0, "days_ago": 8}]
            },

            # --- 2. FOR RENT (6 Properties) ---
            {
                "agent_email": "sarah@estateline.com",
                "address": "802 Memorial Drive #404",
                "city": "Memorial",
                "price": 4800.0,
                "type": "For Rent",
                "status": "active",
                "beds": 2,
                "baths": 2.0,
                "sqft": 1600,
                "lot_size": 0.05,
                "hue_color": "#E4E9E2",
                "image_url": "https://images.unsplash.com/photo-1567496898669-ee935f5f647a?auto=format&fit=crop&w=1200&q=80",
                "description": "Luxury mid-rise penthouse with direct skyline views. Hardwood floors, Calacatta marble details, integrated smart home services, and 24/7 concierge.",
                "history": [{"event": "Listed", "price": 5000.0, "days_ago": 25}, {"event": "Price Cut", "price": 4800.0, "days_ago": 10}]
            },
            {
                "agent_email": "marcus@estateline.com",
                "address": "1004 Yale Street Loft B",
                "city": "The Heights",
                "price": 2850.0,
                "type": "For Rent",
                "status": "active",
                "beds": 1,
                "baths": 1.5,
                "sqft": 1200,
                "lot_size": 0.02,
                "hue_color": "#B8862E",
                "image_url": "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
                "description": "Industrial loft styling in historic Yale warehouse complex. Exposed steel trusses, polished concrete floors, double-height ceiling, private terrace, and underground parking.",
                "history": [{"event": "Listed", "price": 2950.0, "days_ago": 18}, {"event": "Price Cut", "price": 2850.0, "days_ago": 4}]
            },
            {
                "agent_email": "marcus@estateline.com",
                "address": "2400 Montrose Blvd #1202",
                "city": "The Heights",
                "price": 3200.0,
                "type": "For Rent",
                "status": "active",
                "beds": 2,
                "baths": 2.0,
                "sqft": 1450,
                "lot_size": 0.03,
                "hue_color": "#E4E9E2",
                "image_url": "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
                "description": "Sleek high-rise glass flat with panoramic city views, private balcony, quartz countertops, state-of-the-art fitness center, and rooftop infinity lounge.",
                "history": [{"event": "Listed", "price": 3200.0, "days_ago": 7}]
            },
            {
                "agent_email": "david@estateline.com",
                "address": "3100 Main Street #805",
                "city": "Houston Downtown",
                "price": 2400.0,
                "type": "For Rent",
                "status": "active",
                "beds": 1,
                "baths": 1.0,
                "sqft": 980,
                "lot_size": 0.02,
                "hue_color": "#B8862E",
                "image_url": "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80",
                "description": "Urban Downtown loft featuring open timber beams, polished concrete flooring, stainless steel appliances, and direct access to light rail transit.",
                "history": [{"event": "Listed", "price": 2400.0, "days_ago": 15}]
            },
            {
                "agent_email": "rhea@estateline.com",
                "address": "5200 Willowick Road",
                "city": "Katy",
                "price": 3900.0,
                "type": "For Rent",
                "status": "active",
                "beds": 4,
                "baths": 3.0,
                "sqft": 2900,
                "lot_size": 0.22,
                "hue_color": "#E4E9E2",
                "image_url": "https://images.unsplash.com/photo-1576941089067-2de3c901e126?auto=format&fit=crop&w=1200&q=80",
                "description": "Gated suburban family residence inside premier Katy enclave. Includes covered patio, dual car garage, modern appliances, and community pool access.",
                "history": [{"event": "Listed", "price": 4100.0, "days_ago": 40}, {"event": "Price Cut", "price": 3900.0, "days_ago": 12}]
            },
            {
                "agent_email": "sarah@estateline.com",
                "address": "1800 Post Oak Blvd #910",
                "city": "Memorial",
                "price": 5500.0,
                "type": "For Rent",
                "status": "active",
                "beds": 2,
                "baths": 2.5,
                "sqft": 1850,
                "lot_size": 0.04,
                "hue_color": "#B8862E",
                "image_url": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
                "description": "Serviced luxury suite on Post Oak Blvd. Valet parking, room service, daily housekeeping, resort pool deck, and direct access to high-end shopping.",
                "history": [{"event": "Listed", "price": 5500.0, "days_ago": 5}]
            },

            # --- 3. LUXURY VILLAS (6 Properties) ---
            {
                "agent_email": "sarah@estateline.com",
                "address": "4200 Ocean Breeze Way",
                "city": "Memorial",
                "price": 4950000.0,
                "type": "Luxury Villa",
                "status": "active",
                "beds": 5,
                "baths": 5.5,
                "sqft": 6200,
                "lot_size": 0.85,
                "hue_color": "#E4E9E2",
                "image_url": "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80",
                "description": "Stunning Mediterranean coastal villa featuring resort-style outdoor living, infinity swimming pool, private boat dock, wine cellar, and master suite with dual spa bathrooms.",
                "history": [{"event": "Listed", "price": 4950000.0, "days_ago": 20}]
            },
            {
                "agent_email": "rhea@estateline.com",
                "address": "7400 Cypress Lake Court",
                "city": "Katy",
                "price": 3200000.0,
                "type": "Luxury Villa",
                "status": "active",
                "beds": 4,
                "baths": 4.5,
                "sqft": 4900,
                "lot_size": 0.65,
                "hue_color": "#E4E9E2",
                "image_url": "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80",
                "description": "Sleek contemporary waterfront villa featuring modern geometry, floating staircases, glass wine display wall, zero-edge pool, and outdoor kitchen cabana.",
                "history": [{"event": "Listed", "price": 3350000.0, "days_ago": 35}, {"event": "Price Cut", "price": 3200000.0, "days_ago": 10}]
            },
            {
                "agent_email": "sarah@estateline.com",
                "address": "5100 San Felipe Villa Suite",
                "city": "Memorial",
                "price": 5800000.0,
                "type": "Luxury Villa",
                "status": "active",
                "beds": 5,
                "baths": 6.0,
                "sqft": 7100,
                "lot_size": 0.95,
                "hue_color": "#B8862E",
                "image_url": "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80",
                "description": "Tuscan architectural sanctuary with clay tile roofing, wrought iron accents, courtyard fountain, private tennis court, and heated saltwater lap pool.",
                "history": [{"event": "Listed", "price": 5800000.0, "days_ago": 14}]
            },
            {
                "agent_email": "david@estateline.com",
                "address": "8900 Bellaire Villa Drive",
                "city": "Sugar Land",
                "price": 4100000.0,
                "type": "Luxury Villa",
                "status": "active",
                "beds": 4,
                "baths": 5.0,
                "sqft": 5800,
                "lot_size": 0.70,
                "hue_color": "#E4E9E2",
                "image_url": "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80",
                "description": "Glass and stone modern villa surrounded by manicured grounds. Open concept living, outdoor fireplace, glass-enclosed atrium, and smart climate control.",
                "history": [{"event": "Listed", "price": 4300000.0, "days_ago": 50}, {"event": "Price Cut", "price": 4100000.0, "days_ago": 18}]
            },
            {
                "agent_email": "rhea@estateline.com",
                "address": "3300 Lakefront Drive",
                "city": "Katy",
                "price": 3650000.0,
                "type": "Luxury Villa",
                "status": "active",
                "beds": 4,
                "baths": 4.5,
                "sqft": 5200,
                "lot_size": 0.60,
                "hue_color": "#B8862E",
                "image_url": "https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?auto=format&fit=crop&w=1200&q=80",
                "description": "Private lakefront villa with expansive floor-to-ceiling glass, boat dock, outdoor summer kitchen, infinity spa, and 4-car custom garage.",
                "history": [{"event": "Listed", "price": 3650000.0, "days_ago": 22}]
            },
            {
                "agent_email": "sarah@estateline.com",
                "address": "6200 River View Villa",
                "city": "Memorial",
                "price": 6200000.0,
                "type": "Luxury Villa",
                "status": "active",
                "beds": 6,
                "baths": 6.5,
                "sqft": 8000,
                "lot_size": 1.2,
                "hue_color": "#E4E9E2",
                "image_url": "https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=1200&q=80",
                "description": "Resort-style luxury villa on private river bluff. Double-height foyer, limestone flooring, private cinema room, subterranean wine vault, and infinity edge pool.",
                "history": [{"event": "Listed", "price": 6500000.0, "days_ago": 90}, {"event": "Price Cut", "price": 6200000.0, "days_ago": 30}]
            },

            # --- 4. SKYLINE PENTHOUSES (6 Properties) ---
            {
                "agent_email": "sarah@estateline.com",
                "address": "1600 Post Oak Blvd Penthouse 38",
                "city": "Memorial",
                "price": 7800000.0,
                "type": "Penthouse",
                "status": "active",
                "beds": 4,
                "baths": 4.5,
                "sqft": 5400,
                "lot_size": 0.1,
                "hue_color": "#B8862E",
                "image_url": "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
                "description": "Ultra-exclusive 38th-floor glass penthouse featuring 360-degree panoramic skyline views, private rooftop terrace with heated infinity spa, Italian marble kitchen, and private elevator entry.",
                "history": [{"event": "Listed", "price": 8200000.0, "days_ago": 45}, {"event": "Price Cut", "price": 7800000.0, "days_ago": 15}]
            },
            {
                "agent_email": "marcus@estateline.com",
                "address": "2200 Washington Ave Tower 12",
                "city": "The Heights",
                "price": 3450000.0,
                "type": "Penthouse",
                "status": "active",
                "beds": 3,
                "baths": 3.5,
                "sqft": 3800,
                "lot_size": 0.08,
                "hue_color": "#B8862E",
                "image_url": "https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?auto=format&fit=crop&w=1200&q=80",
                "description": "Architectural modern glass penthouse with soaring 18ft ceilings, floor-to-ceiling curtain wall glass, private sunset deck, and direct access to arts district nightlife.",
                "history": [{"event": "Listed", "price": 3450000.0, "days_ago": 18}]
            },
            {
                "agent_email": "david@estateline.com",
                "address": "1100 Louisiana St Penthouse A",
                "city": "Houston Downtown",
                "price": 6900000.0,
                "type": "Penthouse",
                "status": "active",
                "beds": 4,
                "baths": 5.0,
                "sqft": 6100,
                "lot_size": 0.12,
                "hue_color": "#E4E9E2",
                "image_url": "https://images.unsplash.com/photo-1502672016866-210467554904?auto=format&fit=crop&w=1200&q=80",
                "description": "Crown jewel penthouse offering unobstructed 360-degree city views, private rooftop plunge pool, glass wine room, Gaggenau kitchen, and 3 private parking bays.",
                "history": [{"event": "Listed", "price": 7200000.0, "days_ago": 60}, {"event": "Price Cut", "price": 6900000.0, "days_ago": 20}]
            },
            {
                "agent_email": "sarah@estateline.com",
                "address": "5000 Westheimer Penthouse 24",
                "city": "Memorial",
                "price": 5200000.0,
                "type": "Penthouse",
                "status": "active",
                "beds": 3,
                "baths": 3.5,
                "sqft": 4500,
                "lot_size": 0.09,
                "hue_color": "#B8862E",
                "image_url": "https://images.unsplash.com/photo-1541123437800-1bb1317badc2?auto=format&fit=crop&w=1200&q=80",
                "description": "Duplex glass penthouse with floating steel staircase, outdoor kitchen terrace, private sauna, motorized shades, and full valet concierge.",
                "history": [{"event": "Listed", "price": 5200000.0, "days_ago": 28}]
            },
            {
                "agent_email": "sarah@estateline.com",
                "address": "1900 Kirby Drive Penthouse 18",
                "city": "Memorial",
                "price": 8400000.0,
                "type": "Penthouse",
                "status": "active",
                "beds": 5,
                "baths": 5.5,
                "sqft": 6800,
                "lot_size": 0.15,
                "hue_color": "#E4E9E2",
                "image_url": "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=1200&q=80",
                "description": "Palatial penthouse atop River Oaks luxury tower. Custom walnut wood panelling, marble fireplaces, private screening room, and dual master suites.",
                "history": [{"event": "Listed", "price": 8900000.0, "days_ago": 110}, {"event": "Price Cut", "price": 8400000.0, "days_ago": 35}]
            },
            {
                "agent_email": "marcus@estateline.com",
                "address": "3700 Buffalo Bayou Penthouse 15",
                "city": "The Heights",
                "price": 4100000.0,
                "type": "Penthouse",
                "status": "active",
                "beds": 3,
                "baths": 3.5,
                "sqft": 4100,
                "lot_size": 0.08,
                "hue_color": "#B8862E",
                "image_url": "https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?auto=format&fit=crop&w=1200&q=80",
                "description": "Bayou-side glass penthouse overlooking parklands and skyline. Features wraparound outdoor deck, fire pit, chef kitchen, and private 3-car garage box.",
                "history": [{"event": "Listed", "price": 4100000.0, "days_ago": 16}]
            },

            # --- 5. EQUESTRIAN FARMHOUSES (6 Properties) ---
            {
                "agent_email": "rhea@estateline.com",
                "address": "8800 Country Ranch Road",
                "city": "Katy",
                "price": 2650000.0,
                "type": "Farmhouse",
                "status": "active",
                "beds": 5,
                "baths": 4.5,
                "sqft": 4600,
                "lot_size": 12.5,
                "hue_color": "#E4E9E2",
                "image_url": "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80",
                "description": "Modern equestrian farmhouse set on 12.5 private rolling acres. Wrap-around veranda, high-beamed ceilings, 6-stall horse barn, private pond, and gated perimeter.",
                "history": [{"event": "Listed", "price": 2800000.0, "days_ago": 60}, {"event": "Price Cut", "price": 2650000.0, "days_ago": 25}]
            },
            {
                "agent_email": "rhea@estateline.com",
                "address": "1400 Prairie View Lane",
                "city": "Katy",
                "price": 1950000.0,
                "type": "Farmhouse",
                "status": "active",
                "beds": 4,
                "baths": 3.5,
                "sqft": 3800,
                "lot_size": 8.0,
                "hue_color": "#B8862E",
                "image_url": "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=1200&q=80",
                "description": "Rustic luxury timber farmhouse with stone accents, exposed cedar rafters, outdoor fire pit, organic garden beds, and guest cottage.",
                "history": [{"event": "Listed", "price": 1950000.0, "days_ago": 19}]
            },
            {
                "agent_email": "david@estateline.com",
                "address": "9200 Oakwood Barn Way",
                "city": "Sugar Land",
                "price": 2200000.0,
                "type": "Farmhouse",
                "status": "active",
                "beds": 4,
                "baths": 4.0,
                "sqft": 4200,
                "lot_size": 10.0,
                "hue_color": "#E4E9E2",
                "image_url": "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80",
                "description": "Custom country estate with 8-stall equestrian barn, riding arena, fenced pastures, saltwater swimming pool, and stone outdoor fireplace.",
                "history": [{"event": "Listed", "price": 2350000.0, "days_ago": 45}, {"event": "Price Cut", "price": 2200000.0, "days_ago": 15}]
            },
            {
                "agent_email": "rhea@estateline.com",
                "address": "6500 Heritage Ranch Trail",
                "city": "Katy",
                "price": 3100000.0,
                "type": "Farmhouse",
                "status": "active",
                "beds": 5,
                "baths": 5.0,
                "sqft": 5100,
                "lot_size": 20.0,
                "hue_color": "#B8862E",
                "image_url": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80",
                "description": "Modernist black barnhouse situated on 20 private acres. Polished concrete floors, vaulted ceilings, commercial kitchen, workshop, and private bass pond.",
                "history": [{"event": "Listed", "price": 3100000.0, "days_ago": 30}]
            },
            {
                "agent_email": "sarah@estateline.com",
                "address": "4100 Cottonwood Meadow",
                "city": "Memorial",
                "price": 2800000.0,
                "type": "Farmhouse",
                "status": "active",
                "beds": 4,
                "baths": 4.5,
                "sqft": 4500,
                "lot_size": 6.5,
                "hue_color": "#E4E9E2",
                "image_url": "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80",
                "description": "Organic luxury farmhouse featuring white oak millwork, marble kitchen, covered veranda, custom greenhouse, and private orchard groves.",
                "history": [{"event": "Listed", "price": 2950000.0, "days_ago": 70}, {"event": "Price Cut", "price": 2800000.0, "days_ago": 22}]
            },
            {
                "agent_email": "david@estateline.com",
                "address": "7300 Lone Star Ranch",
                "city": "Sugar Land",
                "price": 2450000.0,
                "type": "Farmhouse",
                "status": "active",
                "beds": 5,
                "baths": 4.0,
                "sqft": 4400,
                "lot_size": 15.0,
                "hue_color": "#B8862E",
                "image_url": "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80",
                "description": "Equestrian ranch estate with private 2-acre lake, boat dock, horse stables, modern farmhouse residence, and perimeter security gate.",
                "history": [{"event": "Listed", "price": 2450000.0, "days_ago": 11}]
            },

            # --- 6. COMMERCIAL SPACES (6 Properties) ---
            {
                "agent_email": "david@estateline.com",
                "address": "1510 Highway 6 North",
                "city": "Sugar Land",
                "price": 3200000.0,
                "type": "Commercial",
                "status": "active",
                "beds": None,
                "baths": 4.0,
                "sqft": 12000,
                "lot_size": 1.2,
                "hue_color": "#E4E9E2",
                "image_url": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
                "description": "Premium multi-tenant office building. High-visibility road frontage, 45 parking spaces, modern lobby design, and corporate tenants in place.",
                "history": [{"event": "Listed", "price": 3500000.0, "days_ago": 90}, {"event": "Price Cut", "price": 3200000.0, "days_ago": 45}]
            },
            {
                "agent_email": "david@estateline.com",
                "address": "1420 Town Center Blvd",
                "city": "Sugar Land",
                "price": 12500.0,
                "type": "Commercial",
                "status": "active",
                "beds": None,
                "baths": 2.0,
                "sqft": 4500,
                "lot_size": 0.8,
                "hue_color": "#B8862E",
                "image_url": "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
                "description": "Highly visible retail shell in Sugar Land Town Square. Flexible commercial layout ideal for showrooms, apparel boutiques, or high-end dining.",
                "history": [{"event": "Listed", "price": 12500.0, "days_ago": 8}]
            },
            {
                "agent_email": "david@estateline.com",
                "address": "2900 Industrial Parkway",
                "city": "Katy",
                "price": 8500000.0,
                "type": "Commercial",
                "status": "active",
                "beds": None,
                "baths": 6.0,
                "sqft": 48000,
                "lot_size": 4.5,
                "hue_color": "#B8862E",
                "image_url": "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80",
                "description": "Modern distribution logistics hub. Features 12 loading bays, 32-foot clear heights, administrative offices, and quick freeway access.",
                "history": [{"event": "Listed", "price": 8900000.0, "days_ago": 80}, {"event": "Price Cut", "price": 8500000.0, "days_ago": 40}]
            },
            {
                "agent_email": "david@estateline.com",
                "address": "4800 Westheimer Commercial Plaza",
                "city": "Memorial",
                "price": 5600000.0,
                "type": "Commercial",
                "status": "active",
                "beds": None,
                "baths": 5.0,
                "sqft": 16500,
                "lot_size": 1.5,
                "hue_color": "#E4E9E2",
                "image_url": "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1200&q=80",
                "description": "Glass-clad medical & professional office plaza on prime Westheimer corridor. High cap rate yield with long-term healthcare leases.",
                "history": [{"event": "Listed", "price": 5600000.0, "days_ago": 35}]
            },
            {
                "agent_email": "marcus@estateline.com",
                "address": "1200 Washington Tech Center",
                "city": "The Heights",
                "price": 18000.0,
                "type": "Commercial",
                "status": "active",
                "beds": None,
                "baths": 3.0,
                "sqft": 6000,
                "lot_size": 0.5,
                "hue_color": "#B8862E",
                "image_url": "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80",
                "description": "Creative tech office space inside renovated historic brick building. Open workstations, glass conference suites, coffee bar, and EV charging bays.",
                "history": [{"event": "Listed", "price": 18000.0, "days_ago": 12}]
            },
            {
                "agent_email": "david@estateline.com",
                "address": "3500 Grand Parkway Commerce",
                "city": "Katy",
                "price": 4400000.0,
                "type": "Commercial",
                "status": "active",
                "beds": None,
                "baths": 4.0,
                "sqft": 18000,
                "lot_size": 2.0,
                "hue_color": "#E4E9E2",
                "image_url": "https://images.unsplash.com/photo-1554469384-e58fac16e23a?auto=format&fit=crop&w=1200&q=80",
                "description": "Modern flex warehouse and showroom facility with 24ft clearance, overhead drive-in doors, heavy 3-phase power, and paved truck yard.",
                "history": [{"event": "Listed", "price": 4600000.0, "days_ago": 55}, {"event": "Price Cut", "price": 4400000.0, "days_ago": 20}]
            }
        ]

        # Unique interior photo pools (36 distinct sets)
        living_rooms = [
            "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1615874959474-d609969a20ed?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=80"
        ]
        kitchens = [
            "https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1556909212-d5b604d0c90d?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80"
        ]
        suites = [
            "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1617325247661-675ab4b64ae2?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1560185127-6ed189bf02f4?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?auto=format&fit=crop&w=1200&q=80"
        ]

        for list_idx, ld in enumerate(listings_data):
            agent = agent_map.get(ld["agent_email"])
            if not agent:
                continue
            
            print(f"Adding listing: {ld['address']} ({ld['city']}) - [{ld['type']}]")
            listing = Listing(
                agent_id=agent.id,
                address=ld["address"],
                city=ld["city"],
                price=ld["price"],
                type=ld["type"],
                status=ld["status"],
                beds=ld["beds"],
                baths=ld["baths"],
                sqft=ld["sqft"],
                lot_size=ld["lot_size"],
                description=ld["description"],
                hue_color=ld["hue_color"],
                created_at=datetime.datetime.utcnow() - datetime.timedelta(days=ld["history"][0]["days_ago"])
            )
            db.add(listing)
            db.flush()

            # Add 4 property image records (Exterior + 3 Distinct Interior/Terrace views)
            if "image_url" in ld:
                image_rec1 = ListingImage(listing_id=listing.id, image_url=ld["image_url"], order=1)
                db.add(image_rec1)

                # Pick unique interior photos based on list_idx
                living_img = living_rooms[list_idx % len(living_rooms)]
                kitchen_img = kitchens[list_idx % len(kitchens)]
                suite_img = suites[list_idx % len(suites)]

                interior_imgs = [living_img, kitchen_img, suite_img]
                for idx, img_url in enumerate(interior_imgs, start=2):
                    db.add(ListingImage(listing_id=listing.id, image_url=img_url, order=idx))

            # Add price history
            for hist in ld["history"]:
                price_label = f"${hist['price']:,.0f}/mo" if ld["type"] in ["For Rent"] or hist["price"] < 50000 else f"${hist['price']:,.0f}"
                history_entry = PriceHistoryEntry(
                    listing_id=listing.id,
                    event=hist["event"],
                    price_label=price_label,
                    date=datetime.datetime.utcnow() - datetime.timedelta(days=hist["days_ago"])
                )
                db.add(history_entry)

        db.commit()
        print("Database successfully seeded with 4 agents and 36 detailed listings with photos across all 6 categories!")
        
    except Exception as e:
        db.rollback()
        print(f"Error during seeding: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
