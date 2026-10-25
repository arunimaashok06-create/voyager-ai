import pytest
from backend.app.schemas.itinerary import TripRequestSchema
from backend.app.services.ai_service import AIService

def test_itinerary_generation_structure():
    req = TripRequestSchema(
        destination="Kyoto, Japan",
        start_date="2026-11-01",
        end_date="2026-11-03",
        traveler_count=2,
        traveler_type="couple",
        budget=2000.0,
        currency="USD",
        interests=["culture", "food"],
        travel_pace="balanced"
    )

    trip = AIService.generate_itinerary(req)

    assert trip.destination == "Kyoto, Japan"
    assert len(trip.days) == 3
    assert trip.total_estimated_cost > 0
    assert trip.budget_breakdown.accommodation > 0
    assert trip.budget_breakdown.food > 0
    assert trip.budget_breakdown.activities > 0
    assert len(trip.days[0].activities) >= 2
    assert trip.days[0].activities[0].category == "sightseeing"

def test_budget_breakdown_matches_total():
    req = TripRequestSchema(
        destination="Paris, France",
        start_date="2026-12-01",
        end_date="2026-12-04",
        traveler_count=1,
        traveler_type="solo",
        budget=1500.0,
        currency="EUR"
    )

    trip = AIService.generate_itinerary(req)
    total_breakdown = (
        trip.budget_breakdown.accommodation +
        trip.budget_breakdown.food +
        trip.budget_breakdown.activities +
        trip.budget_breakdown.transportation +
        trip.budget_breakdown.miscellaneous
    )

    assert round(total_breakdown, 1) == 1500.0
