import React from 'react';
import { Trip } from '../types/travel';
import { 
  Plus, Calendar, MapPin, DollarSign, Users, ArrowRight, Bookmark, 
  TrendingUp, Sparkles, Clock, CheckCircle2, Copy, Trash2 
} from 'lucide-react';

interface DashboardViewProps {
  trips: Trip[];
  currency: string;
  onOpenTrip: (trip: Trip) => void;
  onStartNewTrip: () => void;
  onDuplicateTrip: (tripId: string) => void;
  onDeleteTrip: (tripId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  trips,
  currency,
  onOpenTrip,
  onStartNewTrip,
  onDuplicateTrip,
  onDeleteTrip
}) => {
  const upcomingTrips = trips.filter(t => new Date(t.startDate) >= new Date());
  const pastTrips = trips.filter(t => new Date(t.startDate) < new Date());

  const totalDestinations = new Set(trips.map(t => t.destination)).size;
  const totalPlannedSpend = trips.reduce((sum, t) => sum + t.totalEstimatedCost, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-teal-600">
            Travel Command Center
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1 font-serif">
            Welcome Back, Explorer
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl">
            Manage your AI-synthesized itineraries, track upcoming flight & hotel bookings, or design your next holiday.
          </p>
        </div>

        <button
          onClick={onStartNewTrip}
          className="px-5 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all hover:shadow active:scale-[0.98] shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Itinerary</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Total Saved Trips</span>
            <Bookmark className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{trips.length}</div>
          <p className="text-xs text-slate-500 mt-0.5">Across {totalDestinations} destination(s)</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Upcoming Journeys</span>
            <Calendar className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{upcomingTrips.length}</div>
          <p className="text-xs text-slate-500 mt-0.5">Ready for departure</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Cumulative Planned Spend</span>
            <DollarSign className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-bold text-teal-700">
            {currency} {totalPlannedSpend.toLocaleString()}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Combined estimated expense</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">AI Optimization Engine</span>
            <Sparkles className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-sm font-bold text-slate-900 mt-1">Multi-Stop Clustered</div>
          <p className="text-xs text-emerald-600 mt-0.5 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Optimal transit enabled</span>
          </p>
        </div>
      </div>

      {/* Upcoming Trips Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Upcoming Trips ({upcomingTrips.length})</h2>
          <span className="text-xs text-slate-500">Sorted by departure date</span>
        </div>

        {upcomingTrips.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {upcomingTrips.map(trip => (
              <TripCard
                key={trip.id}
                trip={trip}
                onOpen={() => onOpenTrip(trip)}
                onDuplicate={() => onDuplicateTrip(trip.id)}
                onDelete={() => onDeleteTrip(trip.id)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white p-8 rounded-2xl border border-dashed border-slate-300 text-center space-y-3">
            <Calendar className="w-8 h-8 text-slate-400 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">No Upcoming Trips Planned</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Plan your next getaway in seconds with personalized AI scheduling.
            </p>
            <button
              onClick={onStartNewTrip}
              className="px-4 py-2 rounded-lg bg-teal-600 text-white text-xs font-medium hover:bg-teal-700 transition-colors shadow-2xs"
            >
              Plan a Trip Now
            </button>
          </div>
        )}
      </div>

      {/* Completed / Past Trips */}
      {pastTrips.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-slate-200">
          <h2 className="text-lg font-bold text-slate-900">Past & Archived Itineraries ({pastTrips.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {pastTrips.map(trip => (
              <TripCard
                key={trip.id}
                trip={trip}
                onOpen={() => onOpenTrip(trip)}
                onDuplicate={() => onDuplicateTrip(trip.id)}
                onDelete={() => onDeleteTrip(trip.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Reusable Trip Card Sub-component
export const TripCard: React.FC<{
  trip: Trip;
  onOpen: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}> = ({ trip, onOpen, onDuplicate, onDelete }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group">
      <div className="p-5 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <MapPin className="w-3.5 h-3.5 text-teal-600" />
              <span className="font-semibold text-slate-800">{trip.destination}</span>
            </div>
            <h3 
              onClick={onOpen}
              className="text-base font-bold text-slate-900 leading-snug cursor-pointer group-hover:text-teal-700 transition-colors line-clamp-1"
            >
              {trip.title}
            </h3>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200/60 shrink-0">
            {trip.days.length} Days
          </span>
        </div>

        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
          {trip.summary}
        </p>

        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{trip.startDate}</span>
          </span>
          <span>·</span>
          <span className="capitalize">{trip.travelPace} pace</span>
          <span>·</span>
          <span>{trip.collaborators.length} collaborator(s)</span>
        </div>
      </div>

      <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
        <div>
          <span className="text-[10px] text-slate-400 block uppercase">Est. Cost</span>
          <span className="text-sm font-bold text-teal-700">
            {trip.currency} {trip.totalEstimatedCost.toLocaleString()}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={onDuplicate}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-md transition-colors"
            title="Duplicate itinerary"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
            title="Delete itinerary"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onOpen}
            className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold flex items-center gap-1 shadow-2xs transition-colors"
          >
            <span>View</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
