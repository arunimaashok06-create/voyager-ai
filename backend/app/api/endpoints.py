from fastapi import APIRouter, HTTPException, Depends, status
from typing import List, Optional
from backend.app.schemas.itinerary import (
    TripRequestSchema, TripResponseSchema, DayRegenerateRequest, ActivitySchema
)
from backend.app.services.ai_service import AIService

router = APIRouter()

# In-memory storage for Python FastAPI instance
_trips_db: List[TripResponseSchema] = []

@router.post("/itineraries/generate", response_model=TripResponseSchema, status_code=status.HTTP_201_CREATED)
def generate_itinerary(trip_request: TripRequestSchema):
    if not trip_request.destination:
        raise HTTPException(status_code=400, detail="Destination is required")
    trip = AIService.generate_itinerary(trip_request)
    _trips_db.insert(0, trip)
    return trip

@router.get("/trips", response_model=List[TripResponseSchema])
def list_trips(search: Optional[str] = None, status: Optional[str] = None):
    results = _trips_db
    if search:
        s = search.lower()
        results = [t for t in results if s in t.title.lower() or s in t.destination.lower()]
    if status and status != "all":
        results = [t for t in results if t.status == status]
    return results

@router.get("/trips/{trip_id}", response_model=TripResponseSchema)
def get_trip(trip_id: str):
    for trip in _trips_db:
        if trip.id == trip_id:
            return trip
    raise HTTPException(status_code=404, detail="Trip not found")

@router.post("/trips/{trip_id}/duplicate", response_model=TripResponseSchema, status_code=status.HTTP_201_CREATED)
def duplicate_trip(trip_id: str):
    for trip in _trips_db:
        if trip.id == trip_id:
            dup = trip.copy(deep=True)
            dup.id = f"{trip.id}-copy"
            dup.title = f"{trip.title} (Copy)"
            _trips_db.insert(0, dup)
            return dup
    raise HTTPException(status_code=404, detail="Trip not found")

@router.delete("/trips/{trip_id}")
def delete_trip(trip_id: str):
    global _trips_db
    orig_len = len(_trips_db)
    _trips_db = [t for t in _trips_db if t.id != trip_id]
    if len(_trips_db) < orig_len:
        return {"success": True, "message": "Trip deleted"}
    raise HTTPException(status_code=404, detail="Trip not found")

@router.post("/trips/{trip_id}/days/{day_number}/regenerate")
def regenerate_day(trip_id: str, day_number: int, req: DayRegenerateRequest):
    for trip in _trips_db:
        if trip.id == trip_id:
            for day in trip.days:
                if day.day_number == day_number:
                    day.theme = f"Day {day_number}: Custom Refresh ({req.instruction or 'Fresh discovery'})"
                    return {"success": True, "updated_day": day}
            raise HTTPException(status_code=404, detail="Day not found")
    raise HTTPException(status_code=404, detail="Trip not found")
