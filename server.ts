import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { Trip, TripRequest, Activity } from './src/types/travel.js';
import { generateDeterministicItinerary, SAMPLE_TRIPS } from './src/services/mockTravelData.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// In-memory persistent trip store initialized with sample trips
let tripsStore: Trip[] = [...SAMPLE_TRIPS];

// Check Gemini AI Availability
const geminiApiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (geminiApiKey && geminiApiKey !== 'MY_GEMINI_API_KEY') {
  aiClient = new GoogleGenAI({ apiKey: geminiApiKey });
}

// Health check endpoints
app.get(['/health', '/api/v1/health'], (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    aiProvider: aiClient ? 'gemini-3.8-flash' : 'deterministic-engine',
    tripsCount: tripsStore.length,
    environment: process.env.NODE_ENV || 'development'
  });
});

// Generate Itinerary endpoint
app.post('/api/v1/itineraries/generate', async (req: Request, res: Response) => {
  const tripRequest: TripRequest = req.body;

  if (!tripRequest || !tripRequest.destination) {
    return res.status(400).json({ error: 'Destination is required' });
  }

  // Attempt generation via Gemini if client is initialized
  if (aiClient) {
    try {
      const prompt = `You are a world-class travel planner. Generate an exceptionally detailed, personalized travel itinerary for the following request:
Destination: ${tripRequest.destination}
Departure City: ${tripRequest.departureCity || 'Not specified'}
Dates: ${tripRequest.startDate} to ${tripRequest.endDate}
Traveler count: ${tripRequest.travelerCount}
Traveler type: ${tripRequest.travelerType}
Total Budget: ${tripRequest.budget} ${tripRequest.currency}
Interests: ${tripRequest.interests.join(', ')}
Travel Pace: ${tripRequest.travelPace}
Accommodation Preference: ${tripRequest.accommodationPreference}
Transportation Preference: ${tripRequest.transportationPreference}
Dietary Requirements: ${tripRequest.dietaryRequirements.join(', ')}
Accessibility: ${tripRequest.accessibilityPreferences.join(', ')}
Additional Instructions: ${tripRequest.additionalInstructions || 'None'}

Please return ONLY a valid JSON object matching this TypeScript structure:
{
  "title": string,
  "summary": string,
  "totalEstimatedCost": number,
  "currency": "${tripRequest.currency}",
  "budgetBreakdown": {
    "transportation": number,
    "accommodation": number,
    "food": number,
    "activities": number,
    "miscellaneous": number
  },
  "days": [
    {
      "dayNumber": number,
      "date": string,
      "theme": string,
      "activities": [
        {
          "name": string,
          "category": "sightseeing" | "dining" | "culture" | "outdoor" | "shopping" | "relaxation" | "nightlife" | "transit",
          "description": string,
          "startTime": string,
          "endTime": string,
          "durationMinutes": number,
          "location": string,
          "coordinates": { "lat": number, "lng": number },
          "estimatedCost": number,
          "currency": "${tripRequest.currency}",
          "transportationToNext": string,
          "estimatedTravelMinutes": number,
          "bookingRequired": boolean,
          "verifiedStatus": "verified_recommendation",
          "tips": string
        }
      ],
      "meals": [
        {
          "mealType": "breakfast" | "lunch" | "dinner",
          "name": string,
          "cuisine": string,
          "location": string,
          "estimatedCost": number,
          "highlights": string,
          "mustTryDish": string
        }
      ],
      "estimatedDayCost": number,
      "notes": string[],
      "weatherAlternative": string
    }
  ],
  "accommodationOptions": [
    {
      "name": string,
      "type": string,
      "description": string,
      "location": string,
      "estimatedNightlyCost": number,
      "currency": "${tripRequest.currency}",
      "rating": number,
      "perks": string[],
      "verifiedStatus": "verified_recommendation"
    }
  ],
  "travelTips": string[],
  "packingChecklist": string[],
  "assumptions": string[]
}
`;

      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      const responseText = response.text || '';
      const parsedData = JSON.parse(responseText);

      // Enhance with identifiers and user metadata
      const newTrip: Trip = {
        id: `trip-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        userId: 'user-current',
        title: parsedData.title || `${tripRequest.destination} Journey`,
        destination: tripRequest.destination,
        departureCity: tripRequest.departureCity,
        startDate: tripRequest.startDate,
        endDate: tripRequest.endDate,
        travelerCount: tripRequest.travelerCount,
        travelerType: tripRequest.travelerType,
        budget: tripRequest.budget,
        currency: tripRequest.currency,
        travelPace: tripRequest.travelPace,
        status: 'saved',
        summary: parsedData.summary,
        totalEstimatedCost: parsedData.totalEstimatedCost || tripRequest.budget,
        budgetBreakdown: parsedData.budgetBreakdown || {
          transportation: 200,
          accommodation: 500,
          food: 400,
          activities: 300,
          miscellaneous: 100
        },
        days: (parsedData.days || []).map((day: any, dIdx: number) => ({
          ...day,
          activities: (day.activities || []).map((act: any, aIdx: number) => ({
            ...act,
            id: `act-${dIdx}-${aIdx}-${Date.now()}`
          })),
          meals: (day.meals || []).map((meal: any, mIdx: number) => ({
            ...meal,
            id: `meal-${dIdx}-${mIdx}-${Date.now()}`
          }))
        })),
        accommodationOptions: (parsedData.accommodationOptions || []).map((acc: any, accIdx: number) => ({
          ...acc,
          id: `acc-${accIdx}-${Date.now()}`
        })),
        travelTips: parsedData.travelTips || [],
        packingChecklist: parsedData.packingChecklist || [],
        assumptions: parsedData.assumptions || [],
        collaborators: [
          {
            id: 'collab-owner',
            name: 'Primary Planner',
            email: 'traveler@aistudio.local',
            role: 'owner',
            invitedAt: new Date().toISOString()
          }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      tripsStore.unshift(newTrip);
      return res.status(201).json(newTrip);
    } catch (err) {
      console.warn('Gemini generation encountered error, falling back to deterministic travel engine:', err);
      // Fallback seamlessly
    }
  }

  // Deterministic high-fidelity itinerary engine fallback
  const generatedTrip = generateDeterministicItinerary(tripRequest);
  tripsStore.unshift(generatedTrip);
  return res.status(201).json(generatedTrip);
});

// List trips with optional query filter
app.get('/api/v1/trips', (req: Request, res: Response) => {
  const { search, status } = req.query;
  let results = [...tripsStore];

  if (search && typeof search === 'string') {
    const s = search.toLowerCase();
    results = results.filter(
      t => t.title.toLowerCase().includes(s) || t.destination.toLowerCase().includes(s)
    );
  }

  if (status && typeof status === 'string' && status !== 'all') {
    results = results.filter(t => t.status === status);
  }

  res.json({
    data: results,
    total: results.length
  });
});

// Save or Create Trip directly
app.post('/api/v1/trips', (req: Request, res: Response) => {
  const tripData: Trip = req.body;
  if (!tripData || !tripData.destination) {
    return res.status(400).json({ error: 'Valid trip data is required' });
  }

  const existingIdx = tripsStore.findIndex(t => t.id === tripData.id);
  if (existingIdx >= 0) {
    tripsStore[existingIdx] = {
      ...tripData,
      updatedAt: new Date().toISOString()
    };
    return res.json(tripsStore[existingIdx]);
  } else {
    const newTrip = {
      ...tripData,
      id: tripData.id || `trip-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    tripsStore.unshift(newTrip);
    return res.status(201).json(newTrip);
  }
});

// Get single trip
app.get('/api/v1/trips/:tripId', (req: Request, res: Response) => {
  const { tripId } = req.params;
  const trip = tripsStore.find(t => t.id === tripId);
  if (!trip) {
    return res.status(404).json({ error: 'Trip not found' });
  }
  res.json(trip);
});

// Update trip
app.patch('/api/v1/trips/:tripId', (req: Request, res: Response) => {
  const { tripId } = req.params;
  const idx = tripsStore.findIndex(t => t.id === tripId);
  if (idx === 0 || idx > 0) {
    tripsStore[idx] = {
      ...tripsStore[idx],
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    return res.json(tripsStore[idx]);
  }
  res.status(404).json({ error: 'Trip not found' });
});

// Delete trip
app.delete('/api/v1/trips/:tripId', (req: Request, res: Response) => {
  const { tripId } = req.params;
  const prevCount = tripsStore.length;
  tripsStore = tripsStore.filter(t => t.id !== tripId);
  if (tripsStore.length < prevCount) {
    return res.json({ success: true, message: 'Trip deleted' });
  }
  res.status(404).json({ error: 'Trip not found' });
});

// Duplicate trip
app.post('/api/v1/trips/:tripId/duplicate', (req: Request, res: Response) => {
  const { tripId } = req.params;
  const trip = tripsStore.find(t => t.id === tripId);
  if (!trip) {
    return res.status(404).json({ error: 'Trip not found' });
  }

  const duplicated: Trip = {
    ...JSON.parse(JSON.stringify(trip)),
    id: `trip-copy-${Date.now()}`,
    title: `${trip.title} (Copy)`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  tripsStore.unshift(duplicated);
  res.status(201).json(duplicated);
});

// Patch activity directly
app.patch('/api/v1/activities/:activityId', (req: Request, res: Response) => {
  const { activityId } = req.params;
  const updates: Partial<Activity> = req.body;

  for (const trip of tripsStore) {
    for (const day of trip.days) {
      const actIdx = day.activities.findIndex(a => a.id === activityId);
      if (actIdx >= 0) {
        day.activities[actIdx] = {
          ...day.activities[actIdx],
          ...updates
        };
        trip.updatedAt = new Date().toISOString();
        return res.json({ success: true, activity: day.activities[actIdx] });
      }
    }
  }

  res.status(404).json({ error: 'Activity not found' });
});

// Regenerate single day
app.post('/api/v1/trips/:tripId/days/:dayNumber/regenerate', async (req: Request, res: Response) => {
  const { tripId, dayNumber } = req.params;
  const { instruction } = req.body;
  const dayNum = parseInt(dayNumber, 10);

  const trip = tripsStore.find(t => t.id === tripId);
  if (!trip) {
    return res.status(404).json({ error: 'Trip not found' });
  }

  const dayIdx = trip.days.findIndex(d => d.dayNumber === dayNum);
  if (dayIdx < 0) {
    return res.status(404).json({ error: 'Day not found' });
  }

  const existingDay = trip.days[dayIdx];

  // If Gemini is available, call for single day regeneration
  if (aiClient) {
    try {
      const prompt = `Regenerate ONLY Day ${dayNum} of this travel trip to ${trip.destination}.
Specific user instruction for this day: "${instruction || 'Give alternative fresh activities and new dining spots'}"
Current theme: ${existingDay.theme}
Travel pace: ${trip.travelPace}
Budget for this day: ~${existingDay.estimatedDayCost} ${trip.currency}

Return ONLY valid JSON matching this structure:
{
  "theme": string,
  "activities": [
    {
      "name": string,
      "category": "sightseeing" | "dining" | "culture" | "outdoor" | "shopping" | "relaxation" | "nightlife" | "transit",
      "description": string,
      "startTime": string,
      "endTime": string,
      "durationMinutes": number,
      "location": string,
      "coordinates": { "lat": number, "lng": number },
      "estimatedCost": number,
      "currency": "${trip.currency}",
      "transportationToNext": string,
      "estimatedTravelMinutes": number,
      "bookingRequired": boolean,
      "verifiedStatus": "verified_recommendation",
      "tips": string
    }
  ],
  "meals": [
    {
      "mealType": "breakfast" | "lunch" | "dinner",
      "name": string,
      "cuisine": string,
      "location": string,
      "estimatedCost": number,
      "highlights": string,
      "mustTryDish": string
    }
  ],
  "estimatedDayCost": number,
  "notes": string[],
  "weatherAlternative": string
}`;

      const aiRes = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
      });

      const dayData = JSON.parse(aiRes.text || '{}');
      if (dayData.activities && dayData.activities.length > 0) {
        trip.days[dayIdx] = {
          ...existingDay,
          theme: dayData.theme || `Day ${dayNum}: Refresh & Discovery`,
          activities: dayData.activities.map((a: any, i: number) => ({
            ...a,
            id: `act-${dayNum}-${i}-${Date.now()}`
          })),
          meals: dayData.meals || existingDay.meals,
          estimatedDayCost: dayData.estimatedDayCost || existingDay.estimatedDayCost,
          notes: dayData.notes || existingDay.notes,
          weatherAlternative: dayData.weatherAlternative || existingDay.weatherAlternative
        };
        trip.updatedAt = new Date().toISOString();
        return res.json({ success: true, updatedDay: trip.days[dayIdx] });
      }
    } catch (e) {
      console.warn('Gemini day regeneration failed, using deterministic alternative:', e);
    }
  }

  // Deterministic day alteration
  const newTheme = instruction?.includes('rain') 
    ? `Day ${dayNum}: Indoor Culture & Covered Architectural Treasures`
    : instruction?.includes('relax')
    ? `Day ${dayNum}: Slow Travel, Artisanal Cafés & Spa Wellness`
    : `Day ${dayNum}: Hidden Corners & Neighborhood Gastronomy`;

  trip.days[dayIdx].theme = newTheme;
  trip.days[dayIdx].activities = [
    {
      id: `act-${dayNum}-regen-1-${Date.now()}`,
      name: `${trip.destination} Artisan Market & Specialty Workshop`,
      category: 'culture',
      description: 'Morning exploration of local craftsmanship, pottery studios, and antique pavilions.',
      startTime: '10:00',
      endTime: '12:30',
      durationMinutes: 150,
      location: `Artisans Quarter, ${trip.destination}`,
      coordinates: existingDay.activities[0]?.coordinates || { lat: 48.8566, lng: 2.3522 },
      estimatedCost: 20,
      currency: trip.currency,
      transportationToNext: 'Short 8 min walk',
      estimatedTravelMinutes: 8,
      bookingRequired: false,
      verifiedStatus: 'verified_recommendation',
      tips: 'Speak directly with local artisans for personalized insights.'
    },
    {
      id: `act-${dayNum}-regen-2-${Date.now()}`,
      name: `Curated Heritage Gallery & Botanical Garden Walk`,
      category: 'relaxation',
      description: 'Quiet afternoon exploring tranquil botanical cloisters and historic collections.',
      startTime: '14:00',
      endTime: '16:30',
      durationMinutes: 150,
      location: `Heritage Pavilion, ${trip.destination}`,
      coordinates: existingDay.activities[1]?.coordinates || { lat: 48.86, lng: 2.36 },
      estimatedCost: 25,
      currency: trip.currency,
      transportationToNext: 'Pedestrian garden path',
      estimatedTravelMinutes: 10,
      bookingRequired: false,
      verifiedStatus: 'verified_recommendation'
    },
    {
      id: `act-${dayNum}-regen-3-${Date.now()}`,
      name: `Sunset Lookout & Rooftop Beverage Tasting`,
      category: 'dining',
      description: 'Golden hour drinks overlooking iconic landmarks, accompanied by seasonal appetizers.',
      startTime: '18:00',
      endTime: '20:00',
      durationMinutes: 120,
      location: `Panorama Terrace, ${trip.destination}`,
      coordinates: existingDay.activities[2]?.coordinates || { lat: 48.85, lng: 2.34 },
      estimatedCost: 35,
      currency: trip.currency,
      bookingRequired: true,
      verifiedStatus: 'verified_recommendation'
    }
  ];

  trip.updatedAt = new Date().toISOString();
  res.json({ success: true, updatedDay: trip.days[dayIdx] });
});

// Collaborators endpoints
app.post('/api/v1/trips/:tripId/collaborators', (req: Request, res: Response) => {
  const { tripId } = req.params;
  const { email, name, role } = req.body;

  const trip = tripsStore.find(t => t.id === tripId);
  if (!trip) return res.status(404).json({ error: 'Trip not found' });

  const newCollaborator = {
    id: `collab-${Date.now()}`,
    email,
    name: name || email.split('@')[0],
    role: role || 'editor',
    invitedAt: new Date().toISOString()
  };

  trip.collaborators.push(newCollaborator);
  trip.updatedAt = new Date().toISOString();

  res.status(201).json({ success: true, collaborator: newCollaborator });
});

app.delete('/api/v1/trips/:tripId/collaborators/:userId', (req: Request, res: Response) => {
  const { tripId, userId } = req.params;
  const trip = tripsStore.find(t => t.id === tripId);
  if (!trip) return res.status(404).json({ error: 'Trip not found' });

  trip.collaborators = trip.collaborators.filter(c => c.id !== userId);
  trip.updatedAt = new Date().toISOString();

  res.json({ success: true, message: 'Collaborator removed' });
});

// Vite Dev Server middleware or Static Serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
}

startServer();
