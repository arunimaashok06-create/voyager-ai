import { Trip, TripRequest, Activity, TripCollaborator } from '../types/travel';
import { SAMPLE_TRIPS, generateDeterministicItinerary } from './mockTravelData';

const STORAGE_KEY = 'personalized_travel_planner_trips';

// Load initial trips from local storage if available, otherwise SAMPLE_TRIPS
function getStoredTrips(): Trip[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Could not read from local storage', e);
  }
  return SAMPLE_TRIPS;
}

function persistTrips(trips: Trip[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
  } catch (e) {
    console.warn('Could not save to local storage', e);
  }
}

export const TravelApi = {
  async getHealth(): Promise<{ status: string; aiProvider: string; tripsCount: number }> {
    try {
      const res = await fetch('/api/v1/health');
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }
    return { status: 'healthy', aiProvider: 'client-offline', tripsCount: getStoredTrips().length };
  },

  async getTrips(search?: string, status?: string): Promise<Trip[]> {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (status && status !== 'all') params.append('status', status);

      const res = await fetch(`/api/v1/trips?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.data) {
          persistTrips(data.data);
          return data.data;
        }
      }
    } catch (e) {
      console.warn('Backend getTrips fetch failed, using cached store', e);
    }

    // Client fallback
    let trips = getStoredTrips();
    if (search) {
      const s = search.toLowerCase();
      trips = trips.filter(t => t.title.toLowerCase().includes(s) || t.destination.toLowerCase().includes(s));
    }
    if (status && status !== 'all') {
      trips = trips.filter(t => t.status === status);
    }
    return trips;
  },

  async getTrip(tripId: string): Promise<Trip | null> {
    try {
      const res = await fetch(`/api/v1/trips/${tripId}`);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }
    const trips = getStoredTrips();
    return trips.find(t => t.id === tripId) || null;
  },

  async generateItinerary(request: TripRequest): Promise<Trip> {
    try {
      const res = await fetch('/api/v1/itineraries/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      });
      if (res.ok) {
        const trip: Trip = await res.json();
        const trips = getStoredTrips();
        persistTrips([trip, ...trips.filter(t => t.id !== trip.id)]);
        return trip;
      }
    } catch (e) {
      console.warn('Backend generation failed, using local AI synthesis engine', e);
    }

    // Deterministic fallback
    const trip = generateDeterministicItinerary(request);
    const trips = getStoredTrips();
    persistTrips([trip, ...trips]);
    return trip;
  },

  async saveTrip(trip: Trip): Promise<Trip> {
    try {
      const res = await fetch('/api/v1/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trip)
      });
      if (res.ok) {
        const saved: Trip = await res.json();
        const trips = getStoredTrips();
        const idx = trips.findIndex(t => t.id === saved.id);
        if (idx >= 0) trips[idx] = saved;
        else trips.unshift(saved);
        persistTrips(trips);
        return saved;
      }
    } catch {
      // Fallback
    }
    const trips = getStoredTrips();
    const idx = trips.findIndex(t => t.id === trip.id);
    if (idx >= 0) trips[idx] = trip;
    else trips.unshift(trip);
    persistTrips(trips);
    return trip;
  },

  async updateTrip(tripId: string, updates: Partial<Trip>): Promise<Trip> {
    try {
      const res = await fetch(`/api/v1/trips/${tripId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        const updated: Trip = await res.json();
        const trips = getStoredTrips();
        const idx = trips.findIndex(t => t.id === tripId);
        if (idx >= 0) {
          trips[idx] = updated;
          persistTrips(trips);
        }
        return updated;
      }
    } catch {
      // Fallback
    }
    const trips = getStoredTrips();
    const idx = trips.findIndex(t => t.id === tripId);
    if (idx >= 0) {
      trips[idx] = { ...trips[idx], ...updates, updatedAt: new Date().toISOString() };
      persistTrips(trips);
      return trips[idx];
    }
    throw new Error('Trip not found');
  },

  async deleteTrip(tripId: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/v1/trips/${tripId}`, { method: 'DELETE' });
      if (res.ok) {
        const trips = getStoredTrips().filter(t => t.id !== tripId);
        persistTrips(trips);
        return true;
      }
    } catch {
      // Fallback
    }
    const trips = getStoredTrips().filter(t => t.id !== tripId);
    persistTrips(trips);
    return true;
  },

  async duplicateTrip(tripId: string): Promise<Trip> {
    try {
      const res = await fetch(`/api/v1/trips/${tripId}/duplicate`, { method: 'POST' });
      if (res.ok) {
        const dup = await res.json();
        const trips = getStoredTrips();
        persistTrips([dup, ...trips]);
        return dup;
      }
    } catch {
      // Fallback
    }
    const trips = getStoredTrips();
    const orig = trips.find(t => t.id === tripId);
    if (!orig) throw new Error('Original trip not found');
    const dup: Trip = {
      ...JSON.parse(JSON.stringify(orig)),
      id: `trip-copy-${Date.now()}`,
      title: `${orig.title} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    persistTrips([dup, ...trips]);
    return dup;
  },

  async regenerateDay(tripId: string, dayNumber: number, instruction?: string): Promise<Trip> {
    try {
      const res = await fetch(`/api/v1/trips/${tripId}/days/${dayNumber}/regenerate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instruction })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.updatedDay) {
          const trip = await this.getTrip(tripId);
          if (trip) {
            const dayIdx = trip.days.findIndex(d => d.dayNumber === dayNumber);
            if (dayIdx >= 0) {
              trip.days[dayIdx] = data.updatedDay;
              await this.saveTrip(trip);
              return trip;
            }
          }
        }
      }
    } catch (e) {
      console.warn('Backend day regeneration failed', e);
    }

    // Local regeneration
    const trip = await this.getTrip(tripId);
    if (!trip) throw new Error('Trip not found');
    const dayIdx = trip.days.findIndex(d => d.dayNumber === dayNumber);
    if (dayIdx >= 0) {
      const cur = trip.days[dayIdx];
      cur.theme = instruction ? `Day ${dayNumber}: Customized (${instruction.slice(0, 24)}...)` : `Day ${dayNumber}: Fresh Discovery`;
      cur.activities = cur.activities.map((a, i) => ({
        ...a,
        id: `act-${dayNumber}-fresh-${i}-${Date.now()}`,
        name: `${trip.destination} Alternative Discovery #${i + 1}`,
        description: `Refined activity based on preference: ${instruction || 'Alternative cultural highlight'}`,
        verifiedStatus: 'ai_estimated'
      }));
      await this.saveTrip(trip);
      return trip;
    }
    return trip;
  },

  async updateActivity(tripId: string, updatedActivity: Activity): Promise<Trip> {
    const trip = await this.getTrip(tripId);
    if (!trip) throw new Error('Trip not found');

    for (const day of trip.days) {
      const idx = day.activities.findIndex(a => a.id === updatedActivity.id);
      if (idx >= 0) {
        day.activities[idx] = updatedActivity;
        // Recalculate estimated day cost
        day.estimatedDayCost = day.activities.reduce((s, a) => s + a.estimatedCost, 0) +
          day.meals.reduce((s, m) => s + m.estimatedCost, 0);
        break;
      }
    }

    trip.totalEstimatedCost = trip.days.reduce((s, d) => s + d.estimatedDayCost, 0) +
      (trip.accommodationOptions[0]?.estimatedNightlyCost * (trip.days.length - 1 || 1) || 0);

    return await this.saveTrip(trip);
  },

  async deleteActivity(tripId: string, activityId: string): Promise<Trip> {
    const trip = await this.getTrip(tripId);
    if (!trip) throw new Error('Trip not found');

    for (const day of trip.days) {
      const filtered = day.activities.filter(a => a.id !== activityId);
      if (filtered.length !== day.activities.length) {
        day.activities = filtered;
        day.estimatedDayCost = day.activities.reduce((s, a) => s + a.estimatedCost, 0) +
          day.meals.reduce((s, m) => s + m.estimatedCost, 0);
        break;
      }
    }
    return await this.saveTrip(trip);
  },

  async addCollaborator(tripId: string, email: string, role: 'editor' | 'viewer'): Promise<Trip> {
    const trip = await this.getTrip(tripId);
    if (!trip) throw new Error('Trip not found');

    const newCollab: TripCollaborator = {
      id: `collab-${Date.now()}`,
      email,
      name: email.split('@')[0],
      role,
      invitedAt: new Date().toISOString()
    };
    trip.collaborators.push(newCollab);
    return await this.saveTrip(trip);
  },

  async removeCollaborator(tripId: string, collabId: string): Promise<Trip> {
    const trip = await this.getTrip(tripId);
    if (!trip) throw new Error('Trip not found');
    trip.collaborators = trip.collaborators.filter(c => c.id !== collabId);
    return await this.saveTrip(trip);
  }
};
