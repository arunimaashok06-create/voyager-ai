-- ============================================================================
-- Seed Data for Personalized Travel Itinerary Planner
-- ============================================================================

-- Dummy Demo User ID (matching auth.users in development)
DO $$
DECLARE
    demo_user_id UUID := '00000000-0000-0000-0000-000000000001';
    trip_kyoto_id UUID := '11111111-1111-1111-1111-111111111111';
    day_1_id UUID := '22222222-2222-2222-2222-222222222221';
    day_2_id UUID := '22222222-2222-2222-2222-222222222222';
BEGIN
    -- Insert Profile
    INSERT INTO public.profiles (id, full_name, avatar_url, preferred_currency, travel_pace)
    VALUES (
        demo_user_id,
        'Arunima Ashok',
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        'USD',
        'balanced'
    ) ON CONFLICT (id) DO NOTHING;

    -- Insert Kyoto Trip
    INSERT INTO public.trips (
        id, user_id, title, destination, departure_city, start_date, end_date,
        traveler_count, traveler_type, budget, currency, travel_pace, summary,
        total_estimated_cost, budget_breakdown, preferences, status
    ) VALUES (
        trip_kyoto_id,
        demo_user_id,
        'Kyoto Zen Heritage & Tea Culture',
        'Kyoto, Japan',
        'San Francisco, CA',
        '2026-11-05',
        '2026-11-08',
        2,
        'couple',
        2600.00,
        'USD',
        'balanced',
        'A balanced 4-day cultural exploration in Kyoto with ancient temples, rock gardens, and traditional matcha tasting.',
        2150.00,
        '{"accommodation": 900, "food": 550, "activities": 450, "transportation": 150, "miscellaneous": 100}'::jsonb,
        '{"interests": ["culture", "food", "nature"], "dietary": ["none"]}'::jsonb,
        'saved'
    ) ON CONFLICT (id) DO NOTHING;

    -- Insert Day 1
    INSERT INTO public.itinerary_days (
        id, trip_id, day_number, itinerary_date, theme, notes, weather_alternative, estimated_day_cost
    ) VALUES (
        day_1_id,
        trip_kyoto_id,
        1,
        '2026-11-05',
        'Day 1: Arashiyama Bamboo Grove & Tenryu-ji',
        ARRAY['Wear comfortable walking footwear.', 'Buy transit card at Kyoto station.'],
        'Visit Kyoto International Manga Museum in case of heavy rain.',
        420.00
    ) ON CONFLICT (id) DO NOTHING;

    -- Insert Activities for Day 1
    INSERT INTO public.activities (
        itinerary_day_id, name, description, category, start_time, end_time, duration_minutes,
        location, latitude, longitude, estimated_cost, currency, transportation_to_next,
        booking_required, sort_order, verification_status
    ) VALUES
    (
        day_1_id,
        'Arashiyama Bamboo Grove Morning Walk',
        'Early morning walk along towering natural bamboo stalks before peak crowds arrive.',
        'sightseeing',
        '08:30:00',
        '10:30:00',
        120,
        'Arashiyama, Ukyo Ward, Kyoto',
        35.0169,
        135.6713,
        0.00,
        'USD',
        '10 min walk through garden path',
        FALSE,
        1,
        'verified_recommendation'
    ),
    (
        day_1_id,
        'Tenryu-ji Zen Temple & Sogenchi Garden',
        'UNESCO World Heritage site featuring 14th-century landscape pond and tranquil meditation halls.',
        'culture',
        '10:45:00',
        '12:30:00',
        105,
        'Tenryuji, Susukinobaba-cho, Kyoto',
        35.0157,
        135.6778,
        15.00,
        'USD',
        '5 min walk to riverside soba restaurant',
        FALSE,
        2,
        'verified_recommendation'
    );

END $$;
