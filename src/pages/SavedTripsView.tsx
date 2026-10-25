import React, { useState } from 'react';
import { Trip } from '../types/travel';
import { TripCard } from './DashboardView';
import { Search, Filter, Plus, Compass } from 'lucide-react';

interface SavedTripsViewProps {
  trips: Trip[];
  currency: string;
  onOpenTrip: (trip: Trip) => void;
  onStartNewTrip: () => void;
  onDuplicateTrip: (tripId: string) => void;
  onDeleteTrip: (tripId: string) => void;
}

export const SavedTripsView: React.FC<SavedTripsViewProps> = ({
  trips,
  currency,
  onOpenTrip,
  onStartNewTrip,
  onDuplicateTrip,
  onDeleteTrip
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'saved' | 'confirmed' | 'draft'>('all');

  const filteredTrips = trips.filter(t => {
    const matchesSearch = 
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.summary.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 font-serif">
            Saved Travel Itineraries
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Browse, search, edit, and duplicate your stored itineraries
          </p>
        </div>

        <button
          onClick={onStartNewTrip}
          className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs sm:text-sm flex items-center gap-1.5 shadow-sm transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Itinerary</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by city, title, or tags..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto overflow-x-auto w-full sm:w-auto">
          <span className="text-xs text-slate-500 shrink-0">Filter:</span>
          {(['all', 'saved', 'confirmed', 'draft'] as const).map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors capitalize ${
                statusFilter === status
                  ? 'bg-teal-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Trips */}
      {filteredTrips.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTrips.map(trip => (
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
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
          <Compass className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Itineraries Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery
              ? `No itineraries matching "${searchQuery}". Try clearing search filters.`
              : 'You haven’t created any itineraries yet.'}
          </p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="px-3 py-1.5 text-xs font-medium text-teal-700 bg-teal-50 rounded-lg"
            >
              Clear Search Query
            </button>
          )}
        </div>
      )}
    </div>
  );
};
