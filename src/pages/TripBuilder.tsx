import React, { useState } from 'react';
import { TripRequest, TravelerType, TravelPace, AccommodationType, TransportationPreference } from '../types/travel';
import { 
  Compass, MapPin, Calendar, Users, DollarSign, Sparkles, ArrowRight, ArrowLeft,
  Check, Coffee, Utensils, Zap, Hotel, Car, CheckCircle2, AlertCircle, Eye, Info
} from 'lucide-react';

interface TripBuilderProps {
  initialData?: Partial<TripRequest>;
  defaultCurrency: string;
  onGenerate: (request: TripRequest) => Promise<void>;
  onCancel: () => void;
}

const INTEREST_OPTIONS = [
  { id: 'culture', label: 'Culture & Heritage', icon: '🏛️' },
  { id: 'food', label: 'Food & Gastronomy', icon: '🍜' },
  { id: 'sightseeing', label: 'Iconic Sightseeing', icon: '📸' },
  { id: 'nature', label: 'Nature & Parks', icon: '🌿' },
  { id: 'adventure', label: 'Outdoor Adventure', icon: '🧗' },
  { id: 'shopping', label: 'Shopping & Markets', icon: '🛍️' },
  { id: 'relaxation', label: 'Wellness & Relaxation', icon: '💆' },
  { id: 'nightlife', label: 'Evening & Nightlife', icon: '🍸' },
  { id: 'history', label: 'History & Museums', icon: '📜' }
];

const DIETARY_OPTIONS = [
  'Vegetarian', 'Vegan', 'Halal', 'Kosher', 'Gluten-Free', 'Dairy-Free', 'Nut Allergy', 'No Restrictions'
];

const ACCESSIBILITY_OPTIONS = [
  'Wheelchair Accessible', 'Step-Free Entrances', 'Low Walking Distances', 'Elevator Access', 'Standard Accessibility'
];

const PRESETS: { title: string; subtitle: string; data: Partial<TripRequest> }[] = [
  {
    title: 'Kyoto Zen & Heritage',
    subtitle: 'Balanced cultural discovery with matcha & gardens',
    data: {
      destination: 'Kyoto, Japan',
      departureCity: 'San Francisco, CA',
      travelerCount: 2,
      travelerType: 'couple',
      budget: 2600,
      travelPace: 'balanced',
      accommodationPreference: 'boutique',
      transportationPreference: 'public',
      interests: ['culture', 'food', 'nature', 'sightseeing'],
      dietaryRequirements: ['No Restrictions'],
      accessibilityPreferences: ['Standard Accessibility'],
      additionalInstructions: 'Focus on zen rock gardens, traditional tea ceremony, and Gion evening canal walk.'
    }
  },
  {
    title: 'Paris Art & Cozy Gastronomy',
    subtitle: 'Relaxed walking tour of hidden galleries & bistros',
    data: {
      destination: 'Paris, France',
      departureCity: 'New York, NY',
      travelerCount: 1,
      travelerType: 'solo',
      budget: 1900,
      travelPace: 'relaxed',
      accommodationPreference: 'mid-range',
      transportationPreference: 'walking',
      interests: ['food', 'culture', 'shopping', 'relaxation'],
      dietaryRequirements: ['Vegetarian'],
      accessibilityPreferences: ['Standard Accessibility'],
      additionalInstructions: 'Cozy bookshops in the Latin Quarter, impressionist galleries, and artisan bakeries.'
    }
  },
  {
    title: 'Amalfi Coast Scenic Retreat',
    subtitle: 'Cliffside seafood dining & coastal boat excursions',
    data: {
      destination: 'Amalfi Coast, Italy',
      departureCity: 'London, UK',
      travelerCount: 4,
      travelerType: 'friends',
      budget: 4500,
      travelPace: 'balanced',
      accommodationPreference: 'luxury',
      transportationPreference: 'rental_car',
      interests: ['outdoor', 'food', 'relaxation', 'sightseeing'],
      dietaryRequirements: ['Gluten-Free'],
      accessibilityPreferences: ['Standard Accessibility'],
      additionalInstructions: 'Path of the Gods hike, sunset lemon grove cocktails, and boat transfer to Capri.'
    }
  }
];

export const TripBuilder: React.FC<TripBuilderProps> = ({
  initialData,
  defaultCurrency,
  onGenerate,
  onCancel
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generationStepText, setGenerationStepText] = useState('');

  // Default dates 2 weeks out
  const defaultStart = new Date();
  defaultStart.setDate(defaultStart.getDate() + 14);
  const defaultEnd = new Date(defaultStart);
  defaultEnd.setDate(defaultStart.getDate() + 3);

  const [form, setForm] = useState<TripRequest>({
    destination: initialData?.destination || 'Tokyo, Japan',
    departureCity: initialData?.departureCity || '',
    startDate: initialData?.startDate || defaultStart.toISOString().split('T')[0],
    endDate: initialData?.endDate || defaultEnd.toISOString().split('T')[0],
    travelerCount: initialData?.travelerCount || 2,
    travelerType: initialData?.travelerType || 'couple',
    budget: initialData?.budget || 2200,
    currency: defaultCurrency || 'USD',
    interests: initialData?.interests || ['culture', 'food', 'sightseeing'],
    travelPace: initialData?.travelPace || 'balanced',
    accommodationPreference: initialData?.accommodationPreference || 'mid-range',
    transportationPreference: initialData?.transportationPreference || 'public',
    dietaryRequirements: initialData?.dietaryRequirements || ['No Restrictions'],
    accessibilityPreferences: initialData?.accessibilityPreferences || ['Standard Accessibility'],
    additionalInstructions: initialData?.additionalInstructions || ''
  });

  const toggleInterest = (id: string) => {
    setForm(prev => {
      const exists = prev.interests.includes(id);
      if (exists) {
        return { ...prev, interests: prev.interests.filter(i => i !== id) };
      } else {
        return { ...prev, interests: [...prev.interests, id] };
      }
    });
  };

  const toggleDietary = (item: string) => {
    setForm(prev => {
      if (item === 'No Restrictions') return { ...prev, dietaryRequirements: ['No Restrictions'] };
      const filtered = prev.dietaryRequirements.filter(d => d !== 'No Restrictions');
      const exists = filtered.includes(item);
      const updated = exists ? filtered.filter(d => d !== item) : [...filtered, item];
      return { ...prev, dietaryRequirements: updated.length ? updated : ['No Restrictions'] };
    });
  };

  const toggleAccessibility = (item: string) => {
    setForm(prev => {
      if (item === 'Standard Accessibility') return { ...prev, accessibilityPreferences: ['Standard Accessibility'] };
      const filtered = prev.accessibilityPreferences.filter(a => a !== 'Standard Accessibility');
      const exists = filtered.includes(item);
      const updated = exists ? filtered.filter(a => a !== item) : [...filtered, item];
      return { ...prev, accessibilityPreferences: updated.length ? updated : ['Standard Accessibility'] };
    });
  };

  const handleApplyPreset = (presetData: Partial<TripRequest>) => {
    setForm(prev => ({
      ...prev,
      ...presetData
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setGenerationStepText('Analyzing destination geography and seasonality...');

    const timer1 = setTimeout(() => {
      setGenerationStepText('Synthesizing optimal morning, afternoon & evening activity clusters...');
    }, 1200);

    const timer2 = setTimeout(() => {
      setGenerationStepText('Matching authentic local dining spots & dietary requirements...');
    }, 2400);

    const timer3 = setTimeout(() => {
      setGenerationStepText('Calculating transit durations and validating budget constraints...');
    }, 3800);

    try {
      await onGenerate(form);
    } finally {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      setIsSubmitting(false);
    }
  };

  // Compute number of days
  const startDateObj = new Date(form.startDate);
  const endDateObj = new Date(form.endDate);
  const diffDays = Math.max(1, Math.round((endDateObj.getTime() - startDateObj.getTime()) / (1000 * 60 * 60 * 24)) + 1);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Top Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600">
              Smart Trip Builder · Step {currentStep} of 5
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1 font-serif">
              Craft Your Personalized Itinerary
            </h1>
          </div>
          <button
            onClick={onCancel}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
        </div>

        {/* Multi-step Progress Bar */}
        <div className="mt-6 grid grid-cols-5 gap-2">
          {['Destination & Dates', 'Travelers & Budget', 'Interests & Vibe', 'Pace & Stay', 'Review & Generate'].map((stepName, i) => {
            const stepNum = i + 1;
            const isCompleted = currentStep > stepNum;
            const isCurrent = currentStep === stepNum;
            return (
              <div key={i} className="space-y-1.5">
                <div
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    isCompleted ? 'bg-teal-600' : isCurrent ? 'bg-teal-500 ring-2 ring-teal-500/20' : 'bg-slate-200'
                  }`}
                />
                <p className={`text-[11px] truncate hidden sm:block ${isCurrent ? 'font-bold text-teal-800' : 'text-slate-500'}`}>
                  {stepName}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Preset Quick-Fill Bar */}
      {currentStep === 1 && (
        <div className="mb-6 p-4 rounded-xl bg-teal-50/70 border border-teal-200/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-teal-900 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              Quick Inspiration Presets
            </span>
            <span className="text-[11px] text-teal-700">1-click auto-fill</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {PRESETS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyPreset(p.data)}
                className="p-2.5 rounded-lg bg-white border border-teal-200/60 hover:border-teal-400 text-left transition-all hover:shadow-xs group"
              >
                <div className="text-xs font-bold text-slate-900 group-hover:text-teal-700">{p.title}</div>
                <div className="text-[11px] text-slate-500 truncate mt-0.5">{p.subtitle}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Form Content Steps */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        {/* Step 1: Destination & Dates */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Where and when are you traveling?</h2>
              <p className="text-xs text-slate-500 mt-1">Specify destination city or region and trip duration</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Destination City / Country *
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kyoto, Japan or Paris, France"
                    value={form.destination}
                    onChange={e => setForm({ ...form, destination: e.target.value })}
                    className="w-full pl-10 pr-3 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Departure Origin (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. San Francisco (SFO) or London (LHR)"
                  value={form.departureCity || ''}
                  onChange={e => setForm({ ...form, departureCity: e.target.value })}
                  className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Start Date *
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type="date"
                    required
                    value={form.startDate}
                    onChange={e => setForm({ ...form, startDate: e.target.value })}
                    className="w-full pl-10 pr-3 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  End Date *
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type="date"
                    required
                    value={form.endDate}
                    onChange={e => setForm({ ...form, endDate: e.target.value })}
                    className="w-full pl-10 pr-3 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
              <span>Calculated Journey Duration:</span>
              <span className="font-bold text-teal-700">{diffDays} Days / {Math.max(1, diffDays - 1)} Nights</span>
            </div>
          </div>
        )}

        {/* Step 2: Travelers & Budget */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Who is traveling and what is the budget?</h2>
              <p className="text-xs text-slate-500 mt-1">This informs accommodation room counts and daily allowances</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Traveler Group Type
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { id: 'solo', label: 'Solo Traveler', desc: '1 independent explorer' },
                  { id: 'couple', label: 'Couple', desc: '2 partners / duo' },
                  { id: 'family', label: 'Family', desc: 'Parents & children' },
                  { id: 'friends', label: 'Friends Group', desc: 'Group of companions' }
                ].map(type => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setForm({ ...form, travelerType: type.id as TravelerType })}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      form.travelerType === type.id
                        ? 'border-teal-600 bg-teal-50/60 ring-2 ring-teal-500/20'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-xs font-bold text-slate-900">{type.label}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{type.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Total Number of Travelers
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, travelerCount: Math.max(1, form.travelerCount - 1) })}
                    className="w-10 h-10 rounded-xl border border-slate-300 flex items-center justify-center text-slate-700 font-bold hover:bg-slate-100"
                  >
                    -
                  </button>
                  <span className="text-base font-bold text-slate-900 w-8 text-center">
                    {form.travelerCount}
                  </span>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, travelerCount: form.travelerCount + 1 })}
                    className="w-10 h-10 rounded-xl border border-slate-300 flex items-center justify-center text-slate-700 font-bold hover:bg-slate-100"
                  >
                    +
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Total Target Trip Budget ({form.currency})
                </label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type="number"
                    min="100"
                    step="50"
                    value={form.budget}
                    onChange={e => setForm({ ...form, budget: Number(e.target.value) })}
                    className="w-full pl-10 pr-3 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  ~{form.currency} {Math.round(form.budget / (diffDays || 1))} per day total
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Interests & Vibe */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-lg font-bold text-slate-900">What are your interests & travel vibe?</h2>
              <p className="text-xs text-slate-500 mt-1">Select all categories that excite your group</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {INTEREST_OPTIONS.map(item => {
                const isSelected = form.interests.includes(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleInterest(item.id)}
                    className={`p-3.5 rounded-xl border text-left transition-all flex items-center gap-3 ${
                      isSelected
                        ? 'border-teal-600 bg-teal-50/70 ring-2 ring-teal-500/20'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span className={`text-xs font-semibold ${isSelected ? 'text-teal-900' : 'text-slate-800'}`}>
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 4: Pace, Accommodation & Transport */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Pace, Accommodation & Transport</h2>
              <p className="text-xs text-slate-500 mt-1">Fine-tune the rhythm and comfort level of your journey</p>
            </div>

            {/* Travel Pace */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Travel Pace
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'relaxed', label: 'Relaxed', desc: '1-2 leisurely stops per day, late starts & coffee breaks' },
                  { id: 'balanced', label: 'Balanced', desc: '2-3 activities per day, comfortable buffers between stops' },
                  { id: 'packed', label: 'Packed & Energetic', desc: '4+ stops, early morning starts to see as much as possible' }
                ].map(pace => (
                  <button
                    key={pace.id}
                    type="button"
                    onClick={() => setForm({ ...form, travelPace: pace.id as TravelPace })}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      form.travelPace === pace.id
                        ? 'border-teal-600 bg-teal-50/70 ring-2 ring-teal-500/20'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-xs font-bold text-slate-900">{pace.label}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">{pace.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Accommodation Tier */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Accommodation Preference
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { id: 'budget', label: 'Budget-Friendly', desc: 'Hostels, clean guesthouses' },
                  { id: 'mid-range', label: 'Mid-Range Hotel', desc: '3-4 star comfort, prime location' },
                  { id: 'luxury', label: 'Luxury & 5-Star', desc: 'Premium suites, high-end amenities' },
                  { id: 'none', label: 'Already Booked', desc: 'Focus strictly on daily activities' }
                ].map(acc => (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => setForm({ ...form, accommodationPreference: acc.id as AccommodationType })}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      form.accommodationPreference === acc.id
                        ? 'border-teal-600 bg-teal-50/70 ring-2 ring-teal-500/20'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-xs font-bold text-slate-900">{acc.label}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{acc.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Transport Preference */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Preferred Way of Getting Around
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { id: 'public', label: 'Public Transit', desc: 'Metro, buses, trams' },
                  { id: 'walking', label: 'Walking & Strolling', desc: 'Pedestrian routes' },
                  { id: 'taxi_rideshare', label: 'Taxi & Rideshare', desc: 'Direct convenience' },
                  { id: 'rental_car', label: 'Rental Car', desc: 'Road trip independence' }
                ].map(trans => (
                  <button
                    key={trans.id}
                    type="button"
                    onClick={() => setForm({ ...form, transportationPreference: trans.id as TransportationPreference })}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      form.transportationPreference === trans.id
                        ? 'border-teal-600 bg-teal-50/70 ring-2 ring-teal-500/20'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-xs font-bold text-slate-900">{trans.label}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{trans.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Dietary, Accessibility & Review */}
        {currentStep === 5 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Review & Dietary Requirements</h2>
              <p className="text-xs text-slate-500 mt-1">Specify dietary needs, accessibility, and review the prompt</p>
            </div>

            {/* Dietary */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Dietary Requirements
              </label>
              <div className="flex flex-wrap gap-2">
                {DIETARY_OPTIONS.map(d => {
                  const active = form.dietaryRequirements.includes(d);
                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() => toggleDietary(d)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                        active
                          ? 'bg-teal-600 text-white border-teal-600'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Accessibility */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Accessibility Preferences
              </label>
              <div className="flex flex-wrap gap-2">
                {ACCESSIBILITY_OPTIONS.map(a => {
                  const active = form.accessibilityPreferences.includes(a);
                  return (
                    <button
                      key={a}
                      type="button"
                      onClick={() => toggleAccessibility(a)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                        active
                          ? 'bg-teal-600 text-white border-teal-600'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {a}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Additional Instructions */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Special Requests or Custom Instructions
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Include a vintage bookshop, skip tourist traps, prefer outdoor seating..."
                value={form.additionalInstructions || ''}
                onChange={e => setForm({ ...form, additionalInstructions: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>

            {/* Summary Review Card */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Trip Synthesis Summary</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Destination</span>
                  <span className="font-semibold text-slate-900">{form.destination}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Duration</span>
                  <span className="font-semibold text-slate-900">{diffDays} Days ({form.startDate} to {form.endDate})</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Travelers</span>
                  <span className="font-semibold text-slate-900">{form.travelerCount} ({form.travelerType})</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Budget Cap</span>
                  <span className="font-semibold text-teal-700">{form.currency} {form.budget}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading Overlay during Generation */}
        {isSubmitting && (
          <div className="my-6 p-6 rounded-2xl bg-teal-950 text-white border border-teal-800 text-center space-y-4 animate-in fade-in duration-200">
            <div className="w-12 h-12 rounded-full border-4 border-teal-400 border-t-transparent animate-spin mx-auto" />
            <div>
              <h3 className="text-base font-bold text-white font-serif">
                Synthesizing Your Personalized Itinerary
              </h3>
              <p className="text-xs text-teal-300 mt-1 font-sans">
                {generationStepText}
              </p>
            </div>
            <div className="max-w-md mx-auto text-[11px] text-slate-400">
              Allocating daily schedules, coordinating travel buffers, and optimizing dining stops.
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            disabled={currentStep === 1 || isSubmitting}
            onClick={() => setCurrentStep(prev => prev - 1)}
            className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-40"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>

          {currentStep < 5 ? (
            <button
              type="button"
              onClick={() => setCurrentStep(prev => prev + 1)}
              className="px-5 py-2.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm active:scale-[0.98]"
            >
              <span>Next Step</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmit}
              className="px-6 py-2.5 text-xs font-bold text-slate-950 bg-teal-400 hover:bg-teal-300 rounded-lg transition-all flex items-center gap-2 shadow-md hover:shadow-teal-400/20 active:scale-[0.98] disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>Generate My Itinerary</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
