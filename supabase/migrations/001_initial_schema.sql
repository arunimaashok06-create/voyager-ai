-- ============================================================================
-- Personalized Travel Itinerary Planner: Database Migration
-- Target: Supabase PostgreSQL with Row Level Security (RLS)
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    preferred_currency TEXT NOT NULL DEFAULT 'USD',
    travel_pace TEXT NOT NULL DEFAULT 'balanced' CHECK (travel_pace IN ('relaxed', 'balanced', 'packed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. TRIPS TABLE
CREATE TABLE IF NOT EXISTS public.trips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    destination TEXT NOT NULL,
    departure_city TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    traveler_count INTEGER NOT NULL DEFAULT 1 CHECK (traveler_count > 0),
    traveler_type TEXT NOT NULL CHECK (traveler_type IN ('solo', 'couple', 'family', 'friends', 'business')),
    budget NUMERIC(12, 2) NOT NULL CHECK (budget >= 0),
    currency TEXT NOT NULL DEFAULT 'USD',
    travel_pace TEXT NOT NULL CHECK (travel_pace IN ('relaxed', 'balanced', 'packed')),
    summary TEXT,
    total_estimated_cost NUMERIC(12, 2) NOT NULL DEFAULT 0,
    budget_breakdown JSONB NOT NULL DEFAULT '{}'::jsonb,
    preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
    travel_tips TEXT[] DEFAULT ARRAY[]::TEXT[],
    packing_checklist TEXT[] DEFAULT ARRAY[]::TEXT[],
    status TEXT NOT NULL DEFAULT 'saved' CHECK (status IN ('draft', 'saved', 'confirmed', 'completed', 'archived')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. ITINERARY DAYS TABLE
CREATE TABLE IF NOT EXISTS public.itinerary_days (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
    day_number INTEGER NOT NULL CHECK (day_number > 0),
    itinerary_date DATE NOT NULL,
    theme TEXT NOT NULL,
    notes TEXT[] DEFAULT ARRAY[]::TEXT[],
    weather_alternative TEXT,
    estimated_day_cost NUMERIC(10, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(trip_id, day_number)
);

-- 4. ACTIVITIES TABLE
CREATE TABLE IF NOT EXISTS public.activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    itinerary_day_id UUID NOT NULL REFERENCES public.itinerary_days(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('sightseeing', 'dining', 'culture', 'outdoor', 'shopping', 'relaxation', 'nightlife', 'transit')),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    duration_minutes INTEGER NOT NULL,
    location TEXT NOT NULL,
    latitude NUMERIC(10, 6),
    longitude NUMERIC(10, 6),
    estimated_cost NUMERIC(10, 2) NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'USD',
    transportation_to_next TEXT,
    estimated_travel_minutes INTEGER,
    booking_required BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    source_url TEXT,
    tips TEXT,
    verification_status TEXT NOT NULL DEFAULT 'ai_estimated' CHECK (verification_status IN ('verified_recommendation', 'ai_estimated')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. ACCOMMODATION OPTIONS TABLE
CREATE TABLE IF NOT EXISTS public.accommodation_options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    description TEXT,
    location TEXT NOT NULL,
    estimated_nightly_cost NUMERIC(10, 2) NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'USD',
    rating NUMERIC(2, 1),
    perks TEXT[] DEFAULT ARRAY[]::TEXT[],
    source_url TEXT,
    verification_status TEXT NOT NULL DEFAULT 'ai_estimated' CHECK (verification_status IN ('verified_recommendation', 'ai_estimated')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. TRIP COLLABORATORS TABLE
CREATE TABLE IF NOT EXISTS public.trip_collaborators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    invited_email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'editor' CHECK (role IN ('owner', 'editor', 'viewer')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(trip_id, invited_email)
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_trips_user_id ON public.trips(user_id);
CREATE INDEX IF NOT EXISTS idx_itinerary_days_trip_id ON public.itinerary_days(trip_id);
CREATE INDEX IF NOT EXISTS idx_activities_day_id ON public.activities(itinerary_day_id);
CREATE INDEX IF NOT EXISTS idx_accommodation_trip_id ON public.accommodation_options(trip_id);
CREATE INDEX IF NOT EXISTS idx_trip_collaborators_trip_id ON public.trip_collaborators(trip_id);
CREATE INDEX IF NOT EXISTS idx_trip_collaborators_user_id ON public.trip_collaborators(user_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itinerary_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accommodation_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_collaborators ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can select and update their own profile
CREATE POLICY "Users can view own profile" 
    ON public.profiles FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = id);

-- Helper function: Is user a trip collaborator or owner?
CREATE OR REPLACE FUNCTION public.can_access_trip(trip_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.trips t
        WHERE t.id = trip_id AND t.user_id = auth.uid()
    ) OR EXISTS (
        SELECT 1 FROM public.trip_collaborators tc
        WHERE tc.trip_id = trip_id AND (tc.user_id = auth.uid() OR tc.invited_email = auth.jwt() ->> 'email')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trips Policies
CREATE POLICY "Users can view trips they own or collaborate on"
    ON public.trips FOR SELECT
    USING (user_id = auth.uid() OR public.can_access_trip(id));

CREATE POLICY "Users can insert their own trips"
    ON public.trips FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Owners and editors can update trips"
    ON public.trips FOR UPDATE
    USING (user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.trip_collaborators
        WHERE trip_id = id AND (user_id = auth.uid() OR invited_email = auth.jwt() ->> 'email') AND role IN ('owner', 'editor')
    ));

CREATE POLICY "Only trip owners can delete trips"
    ON public.trips FOR DELETE
    USING (user_id = auth.uid());

-- Itinerary Days Policies
CREATE POLICY "Users can view days for permitted trips"
    ON public.itinerary_days FOR SELECT
    USING (public.can_access_trip(trip_id));

CREATE POLICY "Editors and owners can modify days"
    ON public.itinerary_days FOR ALL
    USING (public.can_access_trip(trip_id));

-- Activities Policies
CREATE POLICY "Users can view activities for permitted trips"
    ON public.activities FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.itinerary_days d
        WHERE d.id = activities.itinerary_day_id AND public.can_access_trip(d.trip_id)
    ));

CREATE POLICY "Editors and owners can modify activities"
    ON public.activities FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.itinerary_days d
        WHERE d.id = activities.itinerary_day_id AND public.can_access_trip(d.trip_id)
    ));
