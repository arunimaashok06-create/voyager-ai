export type TravelerType = 'solo' | 'couple' | 'family' | 'friends' | 'business';

export type TravelPace = 'relaxed' | 'balanced' | 'packed';

export type AccommodationType = 'budget' | 'mid-range' | 'luxury' | 'boutique' | 'none';

export type TransportationPreference = 'public' | 'walking' | 'rental_car' | 'taxi_rideshare' | 'mixed';

export type ActivityCategory = 
  | 'sightseeing' 
  | 'dining' 
  | 'culture' 
  | 'outdoor' 
  | 'shopping' 
  | 'relaxation' 
  | 'nightlife' 
  | 'transit';

export interface TripCoordinates {
  lat: number;
  lng: number;
}

export interface Activity {
  id: string;
  name: string;
  description: string;
  category: ActivityCategory;
  startTime: string; // e.g. "09:00"
  endTime: string;   // e.g. "11:30"
  durationMinutes: number;
  location: string;
  coordinates?: TripCoordinates;
  estimatedCost: number;
  currency: string;
  transportationToNext?: string;
  estimatedTravelMinutes?: number;
  bookingRequired?: boolean;
  verifiedStatus: 'verified_recommendation' | 'ai_estimated';
  sourceUrl?: string;
  tips?: string;
}

export interface DayMeal {
  id: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  name: string;
  cuisine: string;
  location: string;
  estimatedCost: number;
  highlights: string;
  mustTryDish?: string;
}

export interface ItineraryDay {
  dayNumber: number;
  date: string;
  theme: string;
  activities: Activity[];
  meals: DayMeal[];
  estimatedDayCost: number;
  notes: string[];
  weatherAlternative?: string;
}

export interface AccommodationOption {
  id: string;
  name: string;
  type: string;
  description: string;
  location: string;
  estimatedNightlyCost: number;
  currency: string;
  rating?: number;
  perks: string[];
  verifiedStatus: 'verified_recommendation' | 'ai_estimated';
  sourceUrl?: string;
}

export interface BudgetBreakdown {
  transportation: number;
  accommodation: number;
  food: number;
  activities: number;
  miscellaneous: number;
}

export interface TripCollaborator {
  id: string;
  email: string;
  name: string;
  role: 'owner' | 'editor' | 'viewer';
  avatar?: string;
  invitedAt: string;
}

export interface TripRequest {
  destination: string;
  departureCity?: string;
  startDate: string;
  endDate: string;
  travelerCount: number;
  travelerType: TravelerType;
  budget: number;
  currency: string;
  interests: string[];
  travelPace: TravelPace;
  accommodationPreference: AccommodationType;
  transportationPreference: TransportationPreference;
  dietaryRequirements: string[];
  accessibilityPreferences: string[];
  additionalInstructions?: string;
}

export interface Trip {
  id: string;
  userId: string;
  title: string;
  destination: string;
  departureCity?: string;
  startDate: string;
  endDate: string;
  travelerCount: number;
  travelerType: TravelerType;
  budget: number;
  currency: string;
  travelPace: TravelPace;
  status: 'draft' | 'saved' | 'confirmed' | 'completed';
  summary: string;
  totalEstimatedCost: number;
  budgetBreakdown: BudgetBreakdown;
  days: ItineraryDay[];
  accommodationOptions: AccommodationOption[];
  travelTips: string[];
  packingChecklist: string[];
  assumptions?: string[];
  collaborators: TripCollaborator[];
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  avatarUrl: string;
  preferredCurrency: string;
  travelPace: TravelPace;
  favoriteDestinations: string[];
}
