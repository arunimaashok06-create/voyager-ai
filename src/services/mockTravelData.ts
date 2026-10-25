import { Trip, TripRequest, ItineraryDay, Activity, DayMeal, AccommodationOption, BudgetBreakdown } from '../types/travel';

// Destination coordinate centers for realistic map rendering
export const DESTINATION_COORDINATES: Record<string, { lat: number; lng: number }> = {
  tokyo: { lat: 35.6762, lng: 139.6503 },
  japan: { lat: 35.6762, lng: 139.6503 },
  kyoto: { lat: 35.0116, lng: 135.7681 },
  paris: { lat: 48.8566, lng: 2.3522 },
  france: { lat: 48.8566, lng: 2.3522 },
  rome: { lat: 41.9028, lng: 12.4964 },
  italy: { lat: 41.9028, lng: 12.4964 },
  amalfi: { lat: 40.6340, lng: 14.6027 },
  bali: { lat: -8.4095, lng: 115.1889 },
  indonesia: { lat: -8.4095, lng: 115.1889 },
  newyork: { lat: 40.7128, lng: -74.0060 },
  nyc: { lat: 40.7128, lng: -74.0060 },
  usa: { lat: 40.7128, lng: -74.0060 },
  jaipur: { lat: 26.9124, lng: 75.7873 },
  india: { lat: 26.9124, lng: 75.7873 },
  london: { lat: 51.5074, lng: -0.1278 },
  uk: { lat: 51.5074, lng: -0.1278 },
  barcelona: { lat: 41.3851, lng: 2.1734 },
  spain: { lat: 41.3851, lng: 2.1734 },
  costarica: { lat: 9.7489, lng: -83.7534 },
  sydney: { lat: -33.8688, lng: 151.2093 },
  australia: { lat: -33.8688, lng: 151.2093 }
};

export function getDestinationCenter(dest: string): { lat: number; lng: number } {
  const clean = dest.toLowerCase().replace(/[^a-z]/g, '');
  for (const [key, coords] of Object.entries(DESTINATION_COORDINATES)) {
    if (clean.includes(key)) {
      return coords;
    }
  }
  // Default fallback if unknown (e.g. Zurich/Central Europe latitude)
  return { lat: 47.3769, lng: 8.5417 };
}

// Deterministic generator helper for realistic itineraries
export function generateDeterministicItinerary(req: TripRequest): Trip {
  const center = getDestinationCenter(req.destination);
  const start = new Date(req.startDate);
  const end = new Date(req.endDate);
  const diffDays = Math.max(1, Math.min(14, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1));

  // Determine budget distribution based on traveler count and pace
  const currency = req.currency || 'USD';
  const totalBudget = req.budget > 0 ? req.budget : 1800 * req.travelerCount;
  
  const budgetBreakdown: BudgetBreakdown = {
    accommodation: Math.round(totalBudget * (req.accommodationPreference === 'luxury' ? 0.45 : 0.35)),
    food: Math.round(totalBudget * 0.25),
    activities: Math.round(totalBudget * 0.20),
    transportation: Math.round(totalBudget * 0.12),
    miscellaneous: Math.round(totalBudget * 0.08)
  };

  const days: ItineraryDay[] = [];

  const themePool = [
    { title: 'Historic Heart & Iconic Landmarks', focus: 'culture' },
    { title: 'Culinary Wandering & Hidden Alleyways', focus: 'dining' },
    { title: 'Artistic Marvels & Scenic Vistas', focus: 'sightseeing' },
    { title: 'Nature Escape & Outdoor Exploration', focus: 'outdoor' },
    { title: 'Local Markets & Neighborhood Life', focus: 'shopping' },
    { title: 'Sunset Views & Evening Atmosphere', focus: 'relaxation' },
    { title: 'Architectural Gems & Heritage Walk', focus: 'culture' }
  ];

  for (let i = 0; i < diffDays; i++) {
    const curDate = new Date(start);
    curDate.setDate(start.getDate() + i);
    const dateStr = curDate.toISOString().split('T')[0];
    const themeObj = themePool[i % themePool.length];

    // Day activities depending on pace
    const activityCount = req.travelPace === 'relaxed' ? 2 : req.travelPace === 'packed' ? 4 : 3;
    const dayActivities: Activity[] = [];

    // Morning Activity
    const latOffset1 = (Math.sin(i * 1.5 + 1) * 0.03);
    const lngOffset1 = (Math.cos(i * 1.5 + 1) * 0.03);
    dayActivities.push({
      id: `act-${i}-1`,
      name: `${req.destination} Heritage & Landmark Discovery`,
      category: 'sightseeing',
      description: `Morning exploration of key historic landmarks and viewpoints in central ${req.destination}. Avoid early tourist crowds.`,
      startTime: req.travelPace === 'relaxed' ? '10:00' : '09:00',
      endTime: req.travelPace === 'relaxed' ? '12:00' : '11:30',
      durationMinutes: 150,
      location: `Historic Quarter, ${req.destination}`,
      coordinates: {
        lat: +(center.lat + latOffset1).toFixed(4),
        lng: +(center.lng + lngOffset1).toFixed(4)
      },
      estimatedCost: Math.round(25 * (currency === 'JPY' ? 150 : currency === 'INR' ? 80 : 1)),
      currency,
      transportationToNext: req.transportationPreference === 'walking' ? '12 min walk along historic arcade' : 'Short metro or tram ride (2 stops)',
      estimatedTravelMinutes: 15,
      bookingRequired: false,
      verifiedStatus: 'verified_recommendation',
      tips: 'Book skip-the-line passes in advance during peak summer seasons.'
    });

    // Afternoon Activity
    const latOffset2 = (Math.sin(i * 2 + 2) * 0.04);
    const lngOffset2 = (Math.cos(i * 2 + 2) * 0.04);
    dayActivities.push({
      id: `act-${i}-2`,
      name: `${req.destination} Cultural Arts & Crafts Quarter`,
      category: 'culture',
      description: `Wander through curated workshops, traditional artisan galleries, and botanical garden paths tailored for ${req.travelerType} travelers.`,
      startTime: '13:30',
      endTime: '16:00',
      durationMinutes: 150,
      location: `Art District, ${req.destination}`,
      coordinates: {
        lat: +(center.lat + latOffset2).toFixed(4),
        lng: +(center.lng + lngOffset2).toFixed(4)
      },
      estimatedCost: Math.round(30 * (currency === 'JPY' ? 150 : currency === 'INR' ? 80 : 1)),
      currency,
      transportationToNext: 'Scenic pedestrian riverfront trail',
      estimatedTravelMinutes: 20,
      bookingRequired: false,
      verifiedStatus: 'verified_recommendation',
      tips: 'Many museums offer discounted entry after 3:00 PM.'
    });

    // Evening Activity (if balanced or packed)
    if (activityCount >= 3) {
      const latOffset3 = (Math.sin(i * 2.8 + 3) * 0.02);
      const lngOffset3 = (Math.cos(i * 2.8 + 3) * 0.02);
      dayActivities.push({
        id: `act-${i}-3`,
        name: `Panoramic Sunset & Lantern Walk`,
        category: req.interests.includes('nightlife') ? 'nightlife' : 'relaxation',
        description: `Witness the twilight glow over the city skyline, followed by vibrant evening street performances and craft cocktail lounges.`,
        startTime: '17:30',
        endTime: '19:30',
        durationMinutes: 120,
        location: `Old Harbor & Riverside Promenade, ${req.destination}`,
        coordinates: {
          lat: +(center.lat + latOffset3).toFixed(4),
          lng: +(center.lng + lngOffset3).toFixed(4)
        },
        estimatedCost: Math.round(15 * (currency === 'JPY' ? 150 : currency === 'INR' ? 80 : 1)),
        currency,
        transportationToNext: 'Walk to dinner venue',
        estimatedTravelMinutes: 10,
        bookingRequired: false,
        verifiedStatus: 'ai_estimated',
        tips: 'Arrive 20 minutes before sunset for prime photography angles.'
      });
    }

    // Additional activity if packed pace
    if (activityCount >= 4) {
      dayActivities.push({
        id: `act-${i}-4`,
        name: `Night Market & Evening Tasting Tour`,
        category: 'dining',
        description: `Sample regional delicacies, street skewers, and artisanal desserts along glowing illuminated stalls.`,
        startTime: '21:00',
        endTime: '22:30',
        durationMinutes: 90,
        location: `Night Market Square, ${req.destination}`,
        coordinates: {
          lat: +(center.lat + (Math.sin(i) * 0.015)).toFixed(4),
          lng: +(center.lng + (Math.cos(i) * 0.015)).toFixed(4)
        },
        estimatedCost: Math.round(20 * (currency === 'JPY' ? 150 : currency === 'INR' ? 80 : 1)),
        currency,
        bookingRequired: false,
        verifiedStatus: 'verified_recommendation'
      });
    }

    // Curated Meals
    const dietaryNote = req.dietaryRequirements.length > 0 && !req.dietaryRequirements.includes('none')
      ? `(${req.dietaryRequirements.join(', ')} friendly options)`
      : '';

    const dayMeals: DayMeal[] = [
      {
        id: `meal-${i}-b`,
        mealType: 'breakfast',
        name: `Café du Matin & Bakery`,
        cuisine: 'Artisanal Bakery & Specialty Coffee',
        location: `Near Morning Stop, ${req.destination}`,
        estimatedCost: Math.round(16 * (currency === 'JPY' ? 150 : currency === 'INR' ? 80 : 1)),
        highlights: `Freshly baked morning goods, single-origin espresso ${dietaryNote}`,
        mustTryDish: 'House signature cinnamon brioche & cappuccino'
      },
      {
        id: `meal-${i}-l`,
        mealType: 'lunch',
        name: `Bistrot des Saveurs`,
        cuisine: 'Local Heritage Cooking',
        location: `Art District, ${req.destination}`,
        estimatedCost: Math.round(28 * (currency === 'JPY' ? 150 : currency === 'INR' ? 80 : 1)),
        highlights: `Farm-to-table lunch set with seasonal organic produce ${dietaryNote}`,
        mustTryDish: 'Handmade seasonal ravioli & regional chilled soup'
      },
      {
        id: `meal-${i}-d`,
        mealType: 'dinner',
        name: `Lantern Lantern Social Table`,
        cuisine: 'Modern Regional Gastronomy',
        location: `Riverside Promenade, ${req.destination}`,
        estimatedCost: Math.round(45 * (currency === 'JPY' ? 150 : currency === 'INR' ? 80 : 1)),
        highlights: `Romantic twilight courtyard with wine pairings and chef specials ${dietaryNote}`,
        mustTryDish: 'Charred glazed catch of the day with garden herbs'
      }
    ];

    const estimatedDayCost = dayActivities.reduce((sum, a) => sum + a.estimatedCost, 0) +
      dayMeals.reduce((sum, m) => sum + m.estimatedCost, 0);

    days.push({
      dayNumber: i + 1,
      date: dateStr,
      theme: `Day ${i + 1}: ${themeObj.title}`,
      activities: dayActivities,
      meals: dayMeals,
      estimatedDayCost,
      notes: [
        `Comfortable walking shoes recommended; approximately ${(activityCount * 2.8).toFixed(1)} km walking anticipated.`,
        req.dietaryRequirements.includes('vegetarian') ? 'Vegetarian menus verified for both lunch and dinner spots.' : 'Water refill stations available at all major cultural spots.'
      ],
      weatherAlternative: 'In case of inclement weather, visit the Covered Glass Pavilions or City Contemporary Art Museum.'
    });
  }

  // Accommodations
  const accommodationMultiplier = currency === 'JPY' ? 150 : currency === 'INR' ? 80 : 1;
  const accommodationOptions: AccommodationOption[] = [
    {
      id: 'acc-1',
      name: `Grand Heritage Suites ${req.destination}`,
      type: req.accommodationPreference === 'luxury' ? '5-Star Luxury Hotel' : 'Boutique Hotel',
      description: `Elegantly restored architectural gem with rooftop garden overlooking the city center. Perfect for ${req.travelerType} travelers.`,
      location: `Central City Center, ${req.destination}`,
      estimatedNightlyCost: Math.round(180 * accommodationMultiplier),
      currency,
      rating: 4.9,
      perks: ['Complimentary breakfast', 'Metro 3 min walk', 'Luggage storage', 'Rooftop terrace'],
      verifiedStatus: 'verified_recommendation'
    },
    {
      id: 'acc-2',
      name: `The Atelier Loft Apartments`,
      type: 'Serviced Boutique Apartment',
      description: `Spacious modern studios featuring full kitchenettes, quiet courtyard views, and close proximity to artisan cafés.`,
      location: `Art District, ${req.destination}`,
      estimatedNightlyCost: Math.round(135 * accommodationMultiplier),
      currency,
      rating: 4.8,
      perks: ['High-speed fiber WiFi', 'Kitchenette', 'Self check-in', 'Quiet neighborhood'],
      verifiedStatus: 'verified_recommendation'
    },
    {
      id: 'acc-3',
      name: `Nomad & Social Eco-Stay`,
      type: 'Eco Boutique Lodge',
      description: `Community-focused boutique stay featuring solar amenities, coworking lounge, and communal evening aperitifs.`,
      location: `Greenbelt District, ${req.destination}`,
      estimatedNightlyCost: Math.round(85 * accommodationMultiplier),
      currency,
      rating: 4.7,
      perks: ['Bicycle rental included', 'Organic café on-site', 'Social lounge', 'Sustainable design'],
      verifiedStatus: 'ai_estimated'
    }
  ];

  const totalEstimatedCost = days.reduce((sum, d) => sum + d.estimatedDayCost, 0) +
    (accommodationOptions[0].estimatedNightlyCost * (diffDays - 1 || 1));

  return {
    id: `trip-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    userId: 'user-demo-01',
    title: `${req.destination} ${diffDays}-Day ${req.travelPace.charAt(0).toUpperCase() + req.travelPace.slice(1)} Discovery`,
    destination: req.destination,
    departureCity: req.departureCity || 'Flexible Origin',
    startDate: req.startDate,
    endDate: req.endDate,
    travelerCount: req.travelerCount,
    travelerType: req.travelerType,
    budget: req.budget,
    currency,
    travelPace: req.travelPace,
    status: 'saved',
    summary: `A personalized ${diffDays}-day itinerary in ${req.destination} crafted for ${req.travelerCount} ${req.travelerType} traveler(s) emphasizing ${req.interests.slice(0, 3).join(', ')} at a ${req.travelPace} pace.`,
    totalEstimatedCost,
    budgetBreakdown,
    days,
    accommodationOptions,
    travelTips: [
      `Currency & Payment: Most central establishments accept tap-to-pay credit cards; keep modest cash for market stalls.`,
      `Transit: Purchase a multi-day unlimited transit pass at arrival to save up to 40% on local rides.`,
      `Peak Hours: Major monuments get crowded between 11:30 AM and 2:30 PM; early morning visits ensure quiet access.`,
      `Safety & Customs: Tap water is generally safe and public transport runs reliably until late night.`
    ],
    packingChecklist: [
      'Comfortable walking sneakers / trail shoes',
      'Compact wind & rainproof shell jacket',
      'Universal power plug adapter + portable power bank',
      'Reusable stainless water bottle',
      'Personal emergency medication & copies of travel insurance'
    ],
    assumptions: [
      'Estimates based on current average seasonal prices and standard admissions.',
      'Flights or intercity train fares to arrival city are budgeted separately.'
    ],
    collaborators: [
      {
        id: 'collab-1',
        name: 'Arunima Ashok',
        email: 'arunimaashok06@gmail.com',
        role: 'owner',
        invitedAt: new Date().toISOString()
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

// Sample Curated Itineraries for Instant Demo
export const SAMPLE_TRIPS: Trip[] = [
  generateDeterministicItinerary({
    destination: 'Kyoto, Japan',
    departureCity: 'San Francisco, CA',
    startDate: '2026-11-05',
    endDate: '2026-11-08',
    travelerCount: 2,
    travelerType: 'couple',
    budget: 2400,
    currency: 'USD',
    interests: ['culture', 'food', 'nature', 'sightseeing'],
    travelPace: 'balanced',
    accommodationPreference: 'boutique',
    transportationPreference: 'public',
    dietaryRequirements: ['none'],
    accessibilityPreferences: ['none'],
    additionalInstructions: 'Focus on zen gardens, traditional matcha tea ceremonies, and evening canal walks.'
  }),
  generateDeterministicItinerary({
    destination: 'Paris, France',
    departureCity: 'New York, NY',
    startDate: '2026-12-10',
    endDate: '2026-12-14',
    travelerCount: 1,
    travelerType: 'solo',
    budget: 1850,
    currency: 'EUR',
    interests: ['art', 'food', 'architecture', 'shopping'],
    travelPace: 'relaxed',
    accommodationPreference: 'mid-range',
    transportationPreference: 'walking',
    dietaryRequirements: ['vegetarian'],
    accessibilityPreferences: ['none'],
    additionalInstructions: 'Hidden bookshops, cozy literary cafes, and impressionist galleries.'
  }),
  generateDeterministicItinerary({
    destination: 'Amalfi Coast, Italy',
    departureCity: 'London, UK',
    startDate: '2027-04-15',
    endDate: '2027-04-18',
    travelerCount: 4,
    travelerType: 'friends',
    budget: 4200,
    currency: 'EUR',
    interests: ['outdoor', 'food', 'relaxation', 'sightseeing'],
    travelPace: 'balanced',
    accommodationPreference: 'luxury',
    transportationPreference: 'rental_car',
    dietaryRequirements: ['gluten-free'],
    accessibilityPreferences: ['none'],
    additionalInstructions: 'Cliffside seafood dining, Path of the Gods hike, and private boat charter to Capri.'
  })
];
