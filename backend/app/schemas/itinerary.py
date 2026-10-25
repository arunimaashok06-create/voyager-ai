from typing import List, Optional, Literal
from pydantic import BaseModel, Field

TravelerType = Literal["solo", "couple", "family", "friends", "business"]
TravelPace = Literal["relaxed", "balanced", "packed"]
AccommodationType = Literal["budget", "mid-range", "luxury", "boutique", "none"]
TransportationPreference = Literal["public", "walking", "rental_car", "taxi_rideshare", "mixed"]
ActivityCategory = Literal["sightseeing", "dining", "culture", "outdoor", "shopping", "relaxation", "nightlife", "transit"]

class Coordinates(BaseModel):
    lat: float
    lng: float

class ActivitySchema(BaseModel):
    id: Optional[str] = None
    name: str
    description: str
    category: ActivityCategory
    start_time: str
    end_time: str
    duration_minutes: int
    location: str
    coordinates: Optional[Coordinates] = None
    estimated_cost: float = 0.0
    currency: str = "USD"
    transportation_to_next: Optional[str] = None
    estimated_travel_minutes: Optional[int] = None
    booking_required: bool = False
    verified_status: str = "verified_recommendation"
    tips: Optional[str] = None
    source_url: Optional[str] = None

class DayMealSchema(BaseModel):
    id: Optional[str] = None
    meal_type: Literal["breakfast", "lunch", "dinner", "snack"]
    name: str
    cuisine: str
    location: str
    estimated_cost: float
    highlights: str
    must_try_dish: Optional[str] = None

class ItineraryDaySchema(BaseModel):
    day_number: int
    date: str
    theme: str
    activities: List[ActivitySchema] = []
    meals: List[DayMealSchema] = []
    estimated_day_cost: float = 0.0
    notes: List[str] = []
    weather_alternative: Optional[str] = None

class AccommodationOptionSchema(BaseModel):
    id: Optional[str] = None
    name: str
    type: str
    description: str
    location: str
    estimated_nightly_cost: float
    currency: str = "USD"
    rating: Optional[float] = None
    perks: List[str] = []
    verified_status: str = "verified_recommendation"

class BudgetBreakdownSchema(BaseModel):
    transportation: float
    accommodation: float
    food: float
    activities: float
    miscellaneous: float

class TripRequestSchema(BaseModel):
    destination: str
    departure_city: Optional[str] = None
    start_date: str
    end_date: str
    traveler_count: int = Field(default=1, ge=1)
    traveler_type: TravelerType = "solo"
    budget: float = Field(default=1500.0, ge=0.0)
    currency: str = "USD"
    interests: List[str] = ["culture", "sightseeing"]
    travel_pace: TravelPace = "balanced"
    accommodation_preference: AccommodationType = "mid-range"
    transportation_preference: TransportationPreference = "public"
    dietary_requirements: List[str] = ["none"]
    accessibility_preferences: List[str] = ["none"]
    additional_instructions: Optional[str] = None

class TripResponseSchema(BaseModel):
    id: str
    user_id: str = "demo-user"
    title: str
    destination: str
    departure_city: Optional[str] = None
    start_date: str
    end_date: str
    traveler_count: int
    traveler_type: TravelerType
    budget: float
    currency: str
    travel_pace: TravelPace
    status: str = "saved"
    summary: str
    total_estimated_cost: float
    budget_breakdown: BudgetBreakdownSchema
    days: List[ItineraryDaySchema]
    accommodation_options: List[AccommodationOptionSchema]
    travel_tips: List[str] = []
    packing_checklist: List[str] = []
    assumptions: List[str] = []
    created_at: str
    updated_at: str

class DayRegenerateRequest(BaseModel):
    instruction: Optional[str] = None
