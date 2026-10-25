# Personalized Travel Itinerary Planner (Voyager AI)

A production-grade, full-stack AI-powered travel planning platform that generates personalized, day-by-day travel itineraries based on destination, travel dates, budget, group size, interests, accommodation preferences, dietary requirements, and preferred travel pace.

---

## 🌟 Key Features

1. **Smart Multi-Step Trip Builder**
   - 5-step intuitive wizard: Destination & Dates, Travelers & Budget, Interests & Vibe, Pace & Stay, Dietary & Custom instructions.
   - 1-click inspiration presets (Kyoto Zen, Paris Gastronomy, Amalfi Coast Escape).
   - Real-time AI prompt inspection and validation.

2. **Day-by-Day Structured Itineraries**
   - Morning, Afternoon, and Evening activity groupings.
   - Realistic duration timings, travel buffer times, and transport guidance.
   - Curated breakfast, lunch, and dinner recommendations respecting dietary preferences (Vegetarian, Vegan, Halal, Gluten-Free, etc.).
   - Inclement weather alternative recommendations.

3. **Single-Day Regeneration**
   - Tweak or regenerate any specific day with targeted instructions (e.g., "Rainy day indoor museums", "More foodie spots", "Relaxed morning") without altering the rest of your itinerary.

4. **Interactive Route & Waypoint Mapping**
   - Visual geographic coordinate plotting.
   - Directional path connecting consecutive stops to minimize commuting fatigue.
   - Interactive waypoint pin selection with details and navigation notes.

5. **Budget & Spending Analytics (Recharts)**
   - Category distribution (Accommodation, Food, Activities, Transit, Miscellaneous).
   - Variance indicators comparing estimated costs against user budget caps.
   - Over-budget warnings with optimization recommendations.

6. **Group Collaboration & Sharing**
   - Invite travel partners via email.
   - Role-based access control (Owner, Editor, Viewer).

7. **Export & Print-Ready Vouchers**
   - Print-optimized clean layout for physical paper vouchers.
   - Download raw structured JSON travel data.
   - Shareable link copying.

---

## 🏗️ Technology Architecture

```
personalized-travel-planner/
├── server.ts                   # Integrated Full-Stack Express Server (Port 3000)
├── index.html                  # HTML5 Entry Point with typography & meta tags
├── metadata.json               # Applet capabilities & permissions
├── package.json                # Frontend & Server dependencies
├── src/
│   ├── App.tsx                 # Core App controller & view routing
│   ├── main.tsx                # React 19 bootstrap
│   ├── index.css               # Tailwind CSS & print media styling
│   ├── types/
│   │   └── travel.ts           # Unified TypeScript data contracts
│   ├── services/
│   │   ├── api.ts              # Client API service with local storage caching
│   │   └── mockTravelData.ts   # Deterministic travel engine & sample trips
│   ├── components/
│   │   ├── Navbar.tsx          # Responsive navigation & currency selector
│   │   ├── Footer.tsx          # Platform footer & verification disclosures
│   │   ├── MapVisualizer.tsx   # Interactive SVG/Canvas waypoint route map
│   │   ├── BudgetAnalytics.tsx # Recharts budget breakdown & variance charts
│   │   ├── ActivityEditModal.tsx
│   │   ├── DayRegenerateModal.tsx
│   │   ├── CollaborateModal.tsx
│   │   ├── ExportModal.tsx
│   │   └── AuthModal.tsx
│   └── pages/
│       ├── LandingPage.tsx     # Hero, quick search, workflow & sample preview
│       ├── DashboardView.tsx   # Upcoming trips, stats & recent itineraries
│       ├── TripBuilder.tsx     # 5-step wizard with preset quick-fill
│       ├── ItineraryDetailView.tsx
│       ├── SavedTripsView.tsx  # Searchable & filterable trip cards
│       └── SettingsView.tsx    # User profile, currency & AI status
├── backend/                    # Python FastAPI Backend Implementation
│   ├── app/
│   │   ├── main.py             # FastAPI entry point & CORS
│   │   ├── api/endpoints.py    # RESTful API routes
│   │   ├── schemas/itinerary.py# Pydantic validation schemas
│   │   ├── services/ai_service.py # AI synthesis service
│   │   └── core/config.py      # Environment settings
│   ├── tests/test_itinerary.py # Pytest validation tests
│   └── requirements.txt        # Python dependencies
└── supabase/
    ├── migrations/001_initial_schema.sql # PostgreSQL schema with RLS
    └── seed.sql                # Seed data for development
```

---

## 🚀 Running the Application

### 1. Active Web Environment (Port 3000)
The web application runs on port 3000 via `server.ts` using Vite development middleware:
```bash
npm run dev
```

### 2. Python FastAPI Backend (Optional Alternative Host)
To run the dedicated Python FastAPI service:
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Run tests:
```bash
pytest tests/
```

### 3. Supabase PostgreSQL Setup
Apply the schema migration located at `supabase/migrations/001_initial_schema.sql` to your Supabase project SQL Editor to enable normalized tables and Row Level Security (RLS).

---

## 🔒 Security & AI Transparency

- **API Keys**: Server-side only; keys are never exposed to client browsers.
- **Deterministic Fallback**: When an external AI key is absent, the application seamlessly invokes its deterministic travel engine so users never encounter dead stubs.
- **Transparency**: All generated pricing and venue hours are clearly designated with indicative estimates.
