import React, { useState } from 'react';
import { Trip, ItineraryDay, Activity, DayMeal, TripCollaborator } from '../types/travel';
import { MapVisualizer } from '../components/MapVisualizer';
import { BudgetAnalytics } from '../components/BudgetAnalytics';
import { ActivityEditModal } from '../components/ActivityEditModal';
import { DayRegenerateModal } from '../components/DayRegenerateModal';
import { CollaborateModal } from '../components/CollaborateModal';
import { ExportModal } from '../components/ExportModal';
import { 
  Calendar, MapPin, Users, DollarSign, Clock, Navigation, Sparkles, 
  Share2, Printer, Plus, Edit2, Trash2, ChevronDown, ChevronUp, RefreshCw, 
  AlertTriangle, Utensils, Bed, CheckCircle2, Bookmark, ArrowLeft, Sun, CloudRain,
  Compass
} from 'lucide-react';

interface ItineraryDetailViewProps {
  trip: Trip;
  onUpdateActivity: (updated: Activity) => Promise<void>;
  onDeleteActivity: (actId: string) => Promise<void>;
  onRegenerateDay: (dayNum: number, instruction?: string) => Promise<void>;
  onAddCollaborator: (email: string, role: 'editor' | 'viewer') => Promise<void>;
  onRemoveCollaborator: (collabId: string) => Promise<void>;
  onDuplicateTrip: () => void;
  onBackToDashboard: () => void;
}

export const ItineraryDetailView: React.FC<ItineraryDetailViewProps> = ({
  trip,
  onUpdateActivity,
  onDeleteActivity,
  onRegenerateDay,
  onAddCollaborator,
  onRemoveCollaborator,
  onDuplicateTrip,
  onBackToDashboard
}) => {
  const [activeTab, setActiveTab] = useState<'schedule' | 'map' | 'budget' | 'stay_dining' | 'tips'>('schedule');
  const [activeDayNumber, setActiveDayNumber] = useState<number>(1);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [isRegeneratingDay, setIsRegeneratingDay] = useState(false);
  const [isCollaborateOpen, setIsCollaborateOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isAddActivityOpen, setIsAddActivityOpen] = useState(false);

  // New activity template
  const [newActName, setNewActName] = useState('');
  const [newActTime, setNewActTime] = useState('14:00');
  const [newActDuration, setNewActDuration] = useState(90);
  const [newActCost, setNewActCost] = useState(20);
  const [newActLocation, setNewActLocation] = useState(trip.destination);
  const [newActDesc, setNewActDesc] = useState('');

  const activeDay = trip.days.find(d => d.dayNumber === activeDayNumber) || trip.days[0];

  // Group activities into Morning (<12:00), Afternoon (12:00-17:00), Evening (>=17:00)
  const morningActivities = activeDay.activities.filter(a => {
    const hour = parseInt(a.startTime.split(':')[0], 10);
    return hour < 12;
  });

  const afternoonActivities = activeDay.activities.filter(a => {
    const hour = parseInt(a.startTime.split(':')[0], 10);
    return hour >= 12 && hour < 17;
  });

  const eveningActivities = activeDay.activities.filter(a => {
    const hour = parseInt(a.startTime.split(':')[0], 10);
    return hour >= 17;
  });

  const handleAddCustomActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActName.trim()) return;

    const newActivity: Activity = {
      id: `act-${activeDayNumber}-custom-${Date.now()}`,
      name: newActName.trim(),
      description: newActDesc.trim() || `Custom activity planned in ${trip.destination}`,
      category: 'sightseeing',
      startTime: newActTime,
      endTime: `${parseInt(newActTime.split(':')[0], 10) + Math.floor(newActDuration / 60)}:${(parseInt(newActTime.split(':')[1] || '0', 10) + (newActDuration % 60)).toString().padStart(2, '0')}`,
      durationMinutes: newActDuration,
      location: newActLocation.trim(),
      coordinates: activeDay.activities[0]?.coordinates || { lat: 48.8566, lng: 2.3522 },
      estimatedCost: Number(newActCost) || 0,
      currency: trip.currency,
      verifiedStatus: 'ai_estimated',
      tips: 'Custom user addition'
    };

    onUpdateActivity(newActivity);
    setNewActName('');
    setNewActDesc('');
    setIsAddActivityOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Breadcrumb & Action Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 no-print">
        <button
          onClick={onBackToDashboard}
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Trips</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsCollaborateOpen(true)}
            className="px-3 py-1.5 rounded-lg border border-slate-300 hover:border-slate-400 bg-white text-xs font-medium text-slate-700 flex items-center gap-1.5 shadow-2xs hover:bg-slate-50 transition-colors"
          >
            <Users className="w-3.5 h-3.5 text-teal-600" />
            <span>Share & Collaborate ({trip.collaborators.length})</span>
          </button>

          <button
            onClick={onDuplicateTrip}
            className="px-3 py-1.5 rounded-lg border border-slate-300 hover:border-slate-400 bg-white text-xs font-medium text-slate-700 flex items-center gap-1.5 shadow-2xs hover:bg-slate-50 transition-colors"
          >
            <Bookmark className="w-3.5 h-3.5 text-slate-600" />
            <span>Duplicate</span>
          </button>

          <button
            onClick={() => setIsExportOpen(true)}
            className="px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-medium flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Export & Print</span>
          </button>
        </div>
      </div>

      {/* Main Destination Hero Header Card */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-slate-800">
        <div 
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #14b8a6 1px, transparent 0)`,
            backgroundSize: '24px 24px'
          }}
        />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-xs text-teal-300 font-medium">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-teal-400" />
                {trip.destination}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-teal-400" />
                {trip.startDate} to {trip.endDate}
              </span>
              <span>·</span>
              <span className="capitalize">{trip.travelerCount} {trip.travelerType} traveler(s)</span>
              <span>·</span>
              <span className="capitalize">{trip.travelPace} pace</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-serif">
              {trip.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              {trip.summary}
            </p>
          </div>

          {/* Quick Metrics Badge */}
          <div className="bg-slate-800/90 backdrop-blur rounded-xl p-4 border border-slate-700/80 shrink-0 text-right min-w-[200px]">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 block">Total Est. Cost</span>
            <span className="text-2xl font-bold text-teal-300">
              {trip.currency} {trip.totalEstimatedCost.toLocaleString()}
            </span>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-end gap-1">
              <span>Target: {trip.currency} {trip.budget.toLocaleString()}</span>
              {trip.totalEstimatedCost <= trip.budget ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-200/80 rounded-xl border border-slate-300/80 no-print overflow-x-auto">
        <button
          onClick={() => setActiveTab('schedule')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
            activeTab === 'schedule'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Daily Schedule ({trip.days.length} Days)
        </button>

        <button
          onClick={() => setActiveTab('map')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
            activeTab === 'map'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Interactive Route Map
        </button>

        <button
          onClick={() => setActiveTab('budget')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
            activeTab === 'budget'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Budget & Spending Breakdown
        </button>

        <button
          onClick={() => setActiveTab('stay_dining')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
            activeTab === 'stay_dining'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Stays & Dining Guide
        </button>

        <button
          onClick={() => setActiveTab('tips')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
            activeTab === 'tips'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Packing & Local Tips
        </button>
      </div>

      {/* SCHEDULE VIEW */}
      {activeTab === 'schedule' && (
        <div className="space-y-6">
          {/* Day Selector Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-print">
            {trip.days.map(d => (
              <button
                key={d.dayNumber}
                onClick={() => setActiveDayNumber(d.dayNumber)}
                className={`px-4 py-2.5 rounded-xl text-left border transition-all shrink-0 ${
                  activeDayNumber === d.dayNumber
                    ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className={`text-[11px] font-bold uppercase ${activeDayNumber === d.dayNumber ? 'text-teal-100' : 'text-slate-400'}`}>
                  Day {d.dayNumber}
                </div>
                <div className="text-xs font-semibold truncate max-w-[150px]">{d.theme.replace(/^Day \d+:\s*/, '')}</div>
              </button>
            ))}
          </div>

          {/* Active Day Header with Actions */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-teal-700 font-semibold mb-1">
                <span>Day {activeDay.dayNumber}</span>
                <span>·</span>
                <span>{activeDay.date}</span>
                <span>·</span>
                <span>Est. Day Spend: {trip.currency} {activeDay.estimatedDayCost}</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 font-serif">
                {activeDay.theme}
              </h2>
            </div>

            <div className="flex items-center gap-2 no-print">
              <button
                onClick={() => setIsAddActivityOpen(true)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 hover:border-slate-400 text-xs font-medium text-slate-700 flex items-center gap-1.5 hover:bg-slate-50 transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-teal-600" />
                <span>Add Stop</span>
              </button>

              <button
                onClick={() => setIsRegeneratingDay(true)}
                className="px-3.5 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200/80 text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5 text-teal-600" />
                <span>Regenerate Day</span>
              </button>
            </div>
          </div>

          {/* Weather Alternative Notice Banner */}
          {activeDay.weatherAlternative && (
            <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-3.5 text-xs text-amber-900 flex items-start gap-2.5">
              <CloudRain className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold">Inclement Weather Alternative:</strong> {activeDay.weatherAlternative}
              </div>
            </div>
          )}

          {/* Schedule Sections: Morning, Afternoon, Evening */}
          <div className="space-y-6">
            {/* Morning */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span>Morning Activities</span>
              </div>
              {morningActivities.length > 0 ? (
                <div className="space-y-3">
                  {morningActivities.map((act, i) => (
                    <ActivityCard
                      key={act.id}
                      activity={act}
                      currency={trip.currency}
                      index={i + 1}
                      onEdit={() => setEditingActivity(act)}
                      onDelete={() => onDeleteActivity(act.id)}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic bg-white p-4 rounded-xl border border-slate-200">
                  No morning stops scheduled. Enjoy a relaxing sleep-in or leisurely breakfast.
                </p>
              )}
            </div>

            {/* Mid-Day Lunch Break */}
            {activeDay.meals.find(m => m.mealType === 'lunch') && (
              <MealCard meal={activeDay.meals.find(m => m.mealType === 'lunch')!} currency={trip.currency} />
            )}

            {/* Afternoon */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                <Compass className="w-3.5 h-3.5 text-teal-600" />
                <span>Afternoon Activities</span>
              </div>
              {afternoonActivities.length > 0 ? (
                <div className="space-y-3">
                  {afternoonActivities.map((act, i) => (
                    <ActivityCard
                      key={act.id}
                      activity={act}
                      currency={trip.currency}
                      index={morningActivities.length + i + 1}
                      onEdit={() => setEditingActivity(act)}
                      onDelete={() => onDeleteActivity(act.id)}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic bg-white p-4 rounded-xl border border-slate-200">
                  Free afternoon for self-paced exploration or relaxation.
                </p>
              )}
            </div>

            {/* Dinner Break */}
            {activeDay.meals.find(m => m.mealType === 'dinner') && (
              <MealCard meal={activeDay.meals.find(m => m.mealType === 'dinner')!} currency={trip.currency} />
            )}

            {/* Evening */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                <span>Evening & Night Activities</span>
              </div>
              {eveningActivities.length > 0 ? (
                <div className="space-y-3">
                  {eveningActivities.map((act, i) => (
                    <ActivityCard
                      key={act.id}
                      activity={act}
                      currency={trip.currency}
                      index={morningActivities.length + afternoonActivities.length + i + 1}
                      onEdit={() => setEditingActivity(act)}
                      onDelete={() => onDeleteActivity(act.id)}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic bg-white p-4 rounded-xl border border-slate-200">
                  Open evening for unwinding at accommodation or self-guided night strolls.
                </p>
              )}
            </div>
          </div>

          {/* Day Notes & Walking Footnotes */}
          {activeDay.notes && activeDay.notes.length > 0 && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
              <span className="font-semibold text-slate-800 block">Day Notes & Practical Advice:</span>
              <ul className="list-disc list-inside space-y-0.5 text-slate-600">
                {activeDay.notes.map((note, nIdx) => (
                  <li key={nIdx}>{note}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* MAP VIEW */}
      {activeTab === 'map' && (
        <div className="space-y-4">
          <MapVisualizer trip={trip} activeDayNumber={activeDayNumber} />
        </div>
      )}

      {/* BUDGET ANALYTICS VIEW */}
      {activeTab === 'budget' && (
        <BudgetAnalytics trip={trip} />
      )}

      {/* ACCOMMODATIONS & DINING GUIDE */}
      {activeTab === 'stay_dining' && (
        <div className="space-y-6">
          {/* Accommodations */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Recommended Accommodations</h3>
                <p className="text-xs text-slate-500">Curated neighborhood stays aligned with your group preferences</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {trip.accommodationOptions.map(acc => (
                <div key={acc.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 block">
                        {acc.type}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 leading-snug">{acc.name}</h4>
                    </div>
                    {acc.rating && (
                      <span className="text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded">
                        ★ {acc.rating}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">{acc.description}</p>

                  <div className="text-xs text-slate-500 flex items-center gap-1 truncate">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{acc.location}</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {acc.perks.map((p, pIdx) => (
                      <span key={pIdx} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                        {p}
                      </span>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Est. Rate</span>
                      <span className="text-sm font-bold text-teal-700">
                        {acc.currency} {acc.estimatedNightlyCost} / night
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 italic">Seasonal estimate</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Complete Meals Directory across all days */}
          <div className="pt-6 border-t border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">Daily Culinary Spot Directory</h3>
            <p className="text-xs text-slate-500 mb-4">Authentic local dining verified for dietary preferences</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {trip.days.flatMap(d => d.meals.map(m => ({ ...m, dayNum: d.dayNumber }))).map(meal => (
                <div key={meal.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-start gap-3">
                  <div className="p-2.5 rounded-lg bg-teal-50 text-teal-700 shrink-0">
                    <Utensils className="w-4 h-4" />
                  </div>
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900">{meal.name}</span>
                      <span className="font-semibold text-teal-700">{trip.currency} {meal.estimatedCost}</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Day {meal.dayNum} · {meal.mealType.toUpperCase()} · {meal.cuisine}
                    </p>
                    <p className="text-xs text-slate-600">{meal.highlights}</p>
                    {meal.mustTryDish && (
                      <p className="text-[11px] text-teal-800 font-medium">
                        Must-try: {meal.mustTryDish}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* PACKING & LOCAL TIPS */}
      {activeTab === 'tips' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
              Essential Packing Checklist
            </h3>
            <ul className="space-y-2.5">
              {trip.packingChecklist.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
              Local Etiquette & Safety Advice
            </h3>
            <ul className="space-y-2.5">
              {trip.travelTips.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                  <Sparkles className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Add Custom Activity Modal */}
      {isAddActivityOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">Add Custom Activity</h3>
            <p className="text-xs text-slate-500 mb-4">Insert a new stop into Day {activeDayNumber}</p>

            <form onSubmit={handleAddCustomActivity} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Activity Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Visit Botanical Greenhouse"
                  value={newActName}
                  onChange={e => setNewActName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={newActTime}
                    onChange={e => setNewActTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Est. Cost ({trip.currency})</label>
                  <input
                    type="number"
                    min="0"
                    value={newActCost}
                    onChange={e => setNewActCost(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Location</label>
                <input
                  type="text"
                  value={newActLocation}
                  onChange={e => setNewActLocation(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newActDesc}
                  onChange={e => setNewActDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddActivityOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm"
                >
                  Add to Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modals */}
      {editingActivity && (
        <ActivityEditModal
          activity={editingActivity}
          currency={trip.currency}
          onSave={async updated => {
            await onUpdateActivity(updated);
            setEditingActivity(null);
          }}
          onClose={() => setEditingActivity(null)}
        />
      )}

      {isRegeneratingDay && (
        <DayRegenerateModal
          dayNumber={activeDayNumber}
          currentTheme={activeDay.theme}
          onRegenerate={async instruction => {
            await onRegenerateDay(activeDayNumber, instruction);
            setIsRegeneratingDay(false);
          }}
          onClose={() => setIsRegeneratingDay(false)}
        />
      )}

      {isCollaborateOpen && (
        <CollaborateModal
          collaborators={trip.collaborators}
          tripTitle={trip.title}
          onAddCollaborator={onAddCollaborator}
          onRemoveCollaborator={onRemoveCollaborator}
          onClose={() => setIsCollaborateOpen(false)}
        />
      )}

      {isExportOpen && (
        <ExportModal
          trip={trip}
          onClose={() => setIsExportOpen(false)}
        />
      )}
    </div>
  );
};

// Activity Card Sub-Component
interface ActivityCardProps {
  activity: Activity;
  currency: string;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
}

const ActivityCard: React.FC<ActivityCardProps> = ({
  activity,
  currency,
  index,
  onEdit,
  onDelete
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs transition-all hover:border-slate-300">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          {/* Index Counter */}
          <div className="w-7 h-7 rounded-lg bg-teal-50 border border-teal-200/80 text-teal-800 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
            {index}
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-bold text-teal-700">{activity.startTime} - {activity.endTime}</span>
              <span className="text-slate-400">·</span>
              <span className="text-slate-500 capitalize">{activity.category}</span>
              <span className="text-slate-400">·</span>
              <span className="text-slate-500">{activity.durationMinutes} min</span>
              {activity.bookingRequired && (
                <>
                  <span className="text-slate-400">·</span>
                  <span className="text-amber-700 font-semibold bg-amber-50 px-1.5 py-0.2 rounded">Booking Advised</span>
                </>
              )}
            </div>

            <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
              {activity.name}
            </h3>

            <p className="text-xs text-slate-600 leading-relaxed pt-0.5">
              {activity.description}
            </p>

            {activity.tips && (
              <p className="text-[11px] text-teal-800 italic bg-teal-50/60 px-2 py-1 rounded mt-1.5">
                Tip: {activity.tips}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-2">
              <span className="flex items-center gap-1 text-slate-500">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{activity.location}</span>
              </span>

              {activity.transportationToNext && (
                <span className="flex items-center gap-1 text-teal-700">
                  <Navigation className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span>Transit: {activity.transportationToNext}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Cost & Edit Actions */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
          <div className="text-right">
            <span className="text-sm font-bold text-slate-900">
              {activity.estimatedCost > 0 ? `${currency} ${activity.estimatedCost}` : 'Free'}
            </span>
          </div>

          <div className="flex items-center gap-1 no-print">
            <button
              onClick={onEdit}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              title="Edit activity"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onDelete}
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Remove activity"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Meal Card Sub-Component
const MealCard: React.FC<{ meal: DayMeal; currency: string }> = ({ meal, currency }) => {
  return (
    <div className="bg-amber-50/40 rounded-xl border border-amber-200/70 p-3.5 text-xs text-slate-700 flex items-start gap-3">
      <div className="p-2 rounded-lg bg-amber-100 text-amber-800 shrink-0 mt-0.5">
        <Utensils className="w-4 h-4" />
      </div>
      <div className="flex-1 space-y-0.5">
        <div className="flex items-center justify-between">
          <span className="font-bold text-slate-900 capitalize">{meal.mealType}: {meal.name}</span>
          <span className="font-semibold text-amber-900">{currency} {meal.estimatedCost}</span>
        </div>
        <p className="text-[11px] text-slate-500">{meal.cuisine} · {meal.location}</p>
        <p className="text-xs text-slate-600">{meal.highlights}</p>
        {meal.mustTryDish && (
          <p className="text-[11px] text-amber-800 font-medium pt-0.5">
            Recommended dish: {meal.mustTryDish}
          </p>
        )}
      </div>
    </div>
  );
};
