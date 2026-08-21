import datetime
from sqlalchemy import Column, Integer, String, Float, Text, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, nullable=False)  # "buyer" or "agent"
    full_name = Column(String, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    otp_code = Column(String, nullable=True)
    otp_expires_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    agent_profile = relationship("Agent", back_populates="user", uselist=False, cascade="all, delete-orphan")
    favorites = relationship("Favorite", back_populates="user", cascade="all, delete-orphan")
    saved_alerts = relationship("SavedAlert", back_populates="user", cascade="all, delete-orphan")


class Agent(Base):
    __tablename__ = "agents"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    bio = Column(Text, nullable=True)
    role_title = Column(String, nullable=False)  # e.g., "Buyer's Agent · Katy"

    # Relationships
    user = relationship("User", back_populates="agent_profile")
    listings = relationship("Listing", back_populates="agent", cascade="all, delete-orphan")


class Listing(Base):
    __tablename__ = "listings"

    id = Column(Integer, primary_key=True, index=True)
    agent_id = Column(Integer, ForeignKey("agents.id", ondelete="CASCADE"), nullable=False)
    address = Column(String, nullable=False)
    city = Column(String, nullable=False)
    price = Column(Float, nullable=False)
    type = Column(String, nullable=False)  # "For Sale", "For Rent", "Commercial"
    status = Column(String, nullable=False)  # "active", "sold", "unpublished"
    beds = Column(Integer, nullable=True)
    baths = Column(Float, nullable=True)
    sqft = Column(Integer, nullable=True)
    lot_size = Column(Float, nullable=True)
    description = Column(Text, nullable=True)
    hue_color = Column(String, nullable=True)  # For placeholder art
    open_house_time = Column(String, nullable=True)  # e.g., "Saturday, 10:00 AM – 2:00 PM"
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    agent = relationship("Agent", back_populates="listings")
    images = relationship("ListingImage", back_populates="listing", cascade="all, delete-orphan")
    price_history = relationship("PriceHistoryEntry", back_populates="listing", cascade="all, delete-orphan")
    favorites = relationship("Favorite", back_populates="listing", cascade="all, delete-orphan")
    leads = relationship("Lead", back_populates="listing", cascade="all, delete-orphan")
    open_house_rsvps = relationship("OpenHouseRSVP", back_populates="listing", cascade="all, delete-orphan")


class ListingImage(Base):
    __tablename__ = "listing_images"

    id = Column(Integer, primary_key=True, index=True)
    listing_id = Column(Integer, ForeignKey("listings.id", ondelete="CASCADE"), nullable=False)
    image_url = Column(String, nullable=False)
    order = Column(Integer, default=0, nullable=False)

    # Relationships
    listing = relationship("Listing", back_populates="images")


class PriceHistoryEntry(Base):
    __tablename__ = "price_history"

    id = Column(Integer, primary_key=True, index=True)
    listing_id = Column(Integer, ForeignKey("listings.id", ondelete="CASCADE"), nullable=False)
    date = Column(DateTime, default=datetime.datetime.utcnow)
    event = Column(String, nullable=False)  # "Listed", "Price Cut", "Pending", "Sold"
    price_label = Column(String, nullable=False)  # e.g., "$1,250,000"

    # Relationships
    listing = relationship("Listing", back_populates="price_history")


class Favorite(Base):
    __tablename__ = "favorites"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    listing_id = Column(Integer, ForeignKey("listings.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="favorites")
    listing = relationship("Listing", back_populates="favorites")


class Lead(Base):
    __tablename__ = "leads"

    id = Column(Integer, primary_key=True, index=True)
    listing_id = Column(Integer, ForeignKey("listings.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    message = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    listing = relationship("Listing", back_populates="leads")


class SellerLead(Base):
    __tablename__ = "seller_leads"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    address = Column(String, nullable=False)
    city = Column(String, default="Houston", nullable=False)
    beds = Column(String, nullable=True)
    baths = Column(String, nullable=True)
    sqft = Column(Integer, nullable=True)
    property_condition = Column(String, nullable=True)
    timeline = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    status = Column(String, default="new", nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class OpenHouseRSVP(Base):
    __tablename__ = "open_house_rsvps"

    id = Column(Integer, primary_key=True, index=True)
    listing_id = Column(Integer, ForeignKey("listings.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    attendees = Column(Integer, default=1, nullable=False)
    preferred_time = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    listing = relationship("Listing", back_populates="open_house_rsvps")


class SavedAlert(Base):
    __tablename__ = "saved_alerts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    filters = Column(Text, nullable=False)  # JSON string e.g. {"type": "For Sale", "min_price": 500000}
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    last_checked_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="saved_alerts")

