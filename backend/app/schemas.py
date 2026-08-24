from pydantic import BaseModel, EmailStr
from datetime import datetime

# --- Authentication Schemas ---

class AgentResponse(BaseModel):
    id: int
    role_title: str
    bio: str | None = None

    class Config:
        from_attributes = True

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    is_verified: bool = False
    created_at: datetime
    agent_profile: AgentResponse | None = None

    class Config:
        from_attributes = True

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: str  # "buyer" or "agent"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class VerifyOTPRequest(BaseModel):
    email: EmailStr
    otp_code: str

class ResendOTPRequest(BaseModel):
    email: EmailStr

class AuthStepResponse(BaseModel):
    message: str
    email: str
    requires_otp: bool = True
    otp_dev: str | None = None
    already_exists: bool = False

# --- Listings Schemas ---

class ListingImageResponse(BaseModel):
    id: int
    listing_id: int
    image_url: str
    order: int

    class Config:
        from_attributes = True

class PriceHistoryResponse(BaseModel):
    id: int
    listing_id: int
    date: datetime
    event: str
    price_label: str

    class Config:
        from_attributes = True

# Simple user profile for agent detail display
class AgentUserResponse(BaseModel):
    id: int
    full_name: str
    email: str

    class Config:
        from_attributes = True

# Full agent profile display with basic user fields
class AgentProfileResponse(BaseModel):
    id: int
    role_title: str
    bio: str | None = None
    user: AgentUserResponse | None = None

    class Config:
        from_attributes = True

class ListingResponse(BaseModel):
    id: int
    agent_id: int
    address: str
    city: str
    price: float
    type: str  # "For Sale", "For Rent", "Commercial"
    status: str  # "active", "sold", "unpublished"
    beds: int | None = None
    baths: float | None = None
    sqft: int | None = None
    lot_size: float | None = None
    description: str | None = None
    hue_color: str | None = None
    created_at: datetime
    images: list[ListingImageResponse] = []
    price_history: list[PriceHistoryResponse] = []
    agent: AgentProfileResponse | None = None

    class Config:
        from_attributes = True

class ListingCreate(BaseModel):
    address: str
    city: str
    price: float
    type: str  # "For Sale", "For Rent", "Commercial"
    status: str = "active"  # "active", "sold", "unpublished"
    beds: int | None = None
    baths: float | None = None
    sqft: int | None = None
    lot_size: float | None = None
    description: str | None = None
    hue_color: str | None = None

class ListingUpdate(BaseModel):
    address: str | None = None
    city: str | None = None
    price: float | None = None
    type: str | None = None
    status: str | None = None
    beds: int | None = None
    baths: float | None = None
    sqft: int | None = None
    lot_size: float | None = None
    description: str | None = None
    hue_color: str | None = None

# --- Leads Schemas ---

class LeadCreate(BaseModel):
    name: str
    phone: str | None = None
    message: str

class LeadResponse(BaseModel):
    id: int
    listing_id: int
    name: str
    phone: str | None = None
    message: str
    created_at: datetime

    class Config:
        from_attributes = True

class LeadMineResponse(BaseModel):
    id: int
    listing_id: int
    listing_address: str
    listing_city: str
    name: str
    phone: str | None = None
    message: str
    created_at: datetime

    class Config:
        from_attributes = True

# --- Dashboard & Stats Schemas ---

class ListingStatsResponse(BaseModel):
    total_listings: int
    active_listings: int
    agent_count: int

# Agent detail with their published active listings
class AgentDetailResponse(BaseModel):
    id: int
    role_title: str
    bio: str | None = None
    user: AgentUserResponse | None = None
    listings: list[ListingResponse] = []

    class Config:
        from_attributes = True

# --- Saved Alerts Schemas ---

class SavedAlertFilterSchema(BaseModel):
    type: str | None = None
    min_price: float | None = None
    max_price: float | None = None
    min_beds: int | None = None
    city: str | None = None

class SavedAlertCreate(BaseModel):
    name: str
    filters: SavedAlertFilterSchema

class SavedAlertResponse(BaseModel):
    id: int
    user_id: int
    name: str
    filters: SavedAlertFilterSchema
    created_at: datetime
    last_checked_at: datetime

    class Config:
        from_attributes = True

class AlertMatchesResponse(BaseModel):
    alert_id: int
    name: str
    match_count: int
    matches: list[ListingResponse] = []


# --- Seller Consultation / Valuation Request Schemas ---

class SellerLeadCreate(BaseModel):
    name: str
    email: str
    phone: str | None = None
    address: str
    city: str = "Houston"
    beds: str | None = "4"
    baths: str | None = "3"
    sqft: int | None = 3000
    property_condition: str | None = "Good"
    timeline: str | None = "Within 30 Days"
    notes: str | None = None

class SellerLeadResponse(BaseModel):
    id: int
    name: str
    email: str
    phone: str | None = None
    address: str
    city: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


# --- Valuation (AVM) Schemas ---

class ValuationRequest(BaseModel):
    address: str
    city: str = "Katy"
    beds: int = 4
    baths: float = 3.0
    sqft: int = 3000
    condition: str = "Good"

class ComparableProperty(BaseModel):
    id: int
    address: str
    city: str
    price: float
    price_formatted: str
    sqft: int | None = None
    beds: int | None = None
    baths: float | None = None
    image_url: str | None = None

class ValuationResponse(BaseModel):
    address: str
    city: str
    estimated_value: int
    estimated_value_formatted: str
    low_range: int
    low_range_formatted: str
    high_range: int
    high_range_formatted: str
    price_per_sqft: int
    confidence_score: int  # e.g., 94 (meaning 94%)
    appreciation_1yr_pct: float
    comparables: list[ComparableProperty] = []


# --- Open House & RSVP Schemas ---

class OpenHouseItemResponse(BaseModel):
    id: int
    listing_id: int
    address: str
    city: str
    price: float
    price_formatted: str
    beds: int | None = None
    baths: float | None = None
    sqft: int | None = None
    open_house_time: str
    agent_name: str
    agent_role: str
    image_url: str

class OpenHouseRSVPCreate(BaseModel):
    listing_id: int
    name: str
    email: str
    phone: str | None = None
    attendees: int = 1
    preferred_time: str | None = None

class OpenHouseRSVPResponse(BaseModel):
    id: int
    listing_id: int
    name: str
    email: str
    attendees: int
    message: str
    created_at: datetime


# --- Neighborhood & Community Schemas ---

class NeighborhoodStat(BaseModel):
    name: str
    title: str
    tagline: str
    safety: str
    walkScore: str
    avgPrice: str
    medianHome: str
    activeListingsCount: int
    highlights: list[str]
    image: str

class SchoolItem(BaseModel):
    name: str
    district: str
    rating: str
    level: str
    students: str
    ratio: str
    city: str
    address: str
    nearbyListingsCount: int


# --- Commute / Drive-Time Schemas ---

class CommuteListingItem(BaseModel):
    id: int
    address: str
    city: str
    price: float
    price_formatted: str
    beds: int | None = None
    baths: float | None = None
    sqft: int | None = None
    estimated_minutes: int
    image_url: str

class CommuteRadiusGroup(BaseModel):
    radius_label: str
    color_badge: str
    region_title: str
    description: str
    city: str
    average_minutes: int
    listings: list[CommuteListingItem] = []

class CommuteSearchResponse(BaseModel):
    origin: str
    max_minutes: int
    mode: str
    groups: list[CommuteRadiusGroup] = []

