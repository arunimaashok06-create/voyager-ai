import React, { useState } from 'react';
import { Trip, TripRequest } from '../types/travel';
import { SAMPLE_TRIPS } from '../services/mockTravelData';
import { 
  Sparkles, Calendar, MapPin, Users, ArrowRight, ShieldCheck, 
  Clock, DollarSign, Compass, Utensils, Star, CheckCircle, Navigation 
} from 'lucide-react';

interface LandingPageProps {
  onStartPlanning: (initialData?: Partial<TripRequest>) => void;
  onViewSampleTrip: (trip: Trip) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartPlanning,
  onViewSampleTrip
}) => {
  const [quickDest, setQuickDest] = useState('');
  const [quickDays, setQuickDays] = useState('3');
  const [quickTravelers, setQuickTravelers] = useState('2');
  const [activeSampleIdx, setActiveSampleIdx] = useState(0);

  const sampleTrip = SAMPLE_TRIPS[activeSampleIdx] || SAMPLE_TRIPS[0];

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dest = quickDest.trim() || 'Tokyo, Japan';
    const numDays = parseInt(quickDays, 10) || 3;
    const start = new Date();
    start.setDate(start.getDate() + 14);
    const end = new Date(start);
    end.setDate(start.getDate() + numDays - 1);

    onStartPlanning({
      destination: dest,
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
      travelerCount: parseInt(quickTravelers, 10) || 2
    });
  };

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white pt-16 pb-24 px-4 sm:px-6 lg:px-8">
        {/* Ambient atmospheric glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-teal-500/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-950/80 border border-teal-500/30 text-teal-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <span>Next-Generation Travel Synthesis</span>
            <span className="text-teal-500">·</span>
            <span className="text-slate-300 font-normal">Real Timing, Budgets & Maps</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.15] font-serif">
            Personalized Travel Itineraries, <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-teal-200 to-emerald-400">
              Engineered by AI in Seconds
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-300 leading-relaxed font-sans">
            Say goodbye to endless browser tabs and scattered notes. Tell us your dream destination, pace, and budget—our planner crafts realistic day-by-day schedules, coordinates, and local dining.
          </p>

          {/* Quick Start Search Bar */}
          <div className="max-w-3xl mx-auto mt-8 bg-white/10 backdrop-blur-md p-2.5 sm:p-3 rounded-2xl border border-white/20 shadow-2xl">
            <form onSubmit={handleQuickSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
              <div className="sm:col-span-2 relative flex items-center">
                <MapPin className="w-4 h-4 text-teal-300 absolute left-3.5 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Where to? (e.g. Kyoto, Rome, Bali, Paris)"
                  value={quickDest}
                  onChange={e => setQuickDest(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 rounded-xl bg-slate-900/80 text-white placeholder-slate-400 text-sm border border-slate-700/80 focus:outline-none focus:ring-2 focus:ring-teal-400"
                />
              </div>

              <div className="relative flex items-center">
                <Clock className="w-4 h-4 text-teal-300 absolute left-3.5 pointer-events-none" />
                <select
                  value={quickDays}
                  onChange={e => setQuickDays(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 rounded-xl bg-slate-900/80 text-white text-sm border border-slate-700/80 focus:outline-none focus:ring-2 focus:ring-teal-400"
                >
                  <option value="2">2 Days (Weekend)</option>
                  <option value="3">3 Days (Long Weekend)</option>
                  <option value="5">5 Days (Discovery)</option>
                  <option value="7">7 Days (Full Week)</option>
                  <option value="10">10 Days (Grand Tour)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm transition-all shadow-md hover:shadow-teal-500/20 flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                <span>Generate Plan</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Quick Metrics Bar */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-teal-400" />
              <span>Optimized transit timings</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-teal-400" />
              <span>Budget variance tracking</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-teal-400" />
              <span>Regenerate single days</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-teal-400" />
              <span>Printable PDF vouchers</span>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Sample Itinerary Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h2 className="text-xs font-bold uppercase tracking-wider text-teal-600 mb-1">
            Real Output Preview
          </h2>
          <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 font-serif">
            Explore Handcrafted Itinerary Syntheses
          </h3>
          <p className="text-sm text-slate-600 mt-2">
            Switch between curated destinations to see how our AI arranges schedules, meal stops, and cost calculations.
          </p>
        </div>

        {/* Sample Destination Switcher */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {SAMPLE_TRIPS.map((trip, idx) => (
            <button
              key={trip.id}
              onClick={() => setActiveSampleIdx(idx)}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all border ${
                activeSampleIdx === idx
                  ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
              }`}
            >
              {trip.destination}
            </button>
          ))}
        </div>

        {/* Sample Trip Showcase Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden max-w-5xl mx-auto">
          <div className="p-6 sm:p-8 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 text-xs text-teal-300 font-medium">
                <span>{sampleTrip.destination}</span>
                <span>·</span>
                <span>{sampleTrip.days.length} Days</span>
                <span>·</span>
                <span>{sampleTrip.travelPace} pace</span>
              </div>
              <h4 className="text-xl sm:text-2xl font-bold text-white mt-1 font-serif">
                {sampleTrip.title}
              </h4>
              <p className="text-xs text-slate-300 mt-2 max-w-xl leading-relaxed">
                {sampleTrip.summary}
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right">
                <span className="text-[11px] uppercase tracking-wider text-slate-400 block">Est. Budget</span>
                <span className="text-xl font-bold text-teal-300">
                  {sampleTrip.currency} {sampleTrip.totalEstimatedCost.toLocaleString()}
                </span>
              </div>
              <button
                onClick={() => onViewSampleTrip(sampleTrip)}
                className="px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <span>Open Full Itinerary</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Activities Preview Strip */}
          <div className="p-6 bg-slate-50 border-t border-slate-200">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Day 1 Schedule Highlights
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {sampleTrip.days[0]?.activities.slice(0, 3).map((act, i) => (
                <div key={act.id} className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                    <span className="font-semibold text-teal-600">{act.startTime} - {act.endTime}</span>
                    <span className="capitalize">{act.category}</span>
                  </div>
                  <h6 className="text-sm font-bold text-slate-900 leading-snug">{act.name}</h6>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{act.description}</p>
                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-400 flex items-center gap-1 truncate max-w-[140px]">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{act.location}</span>
                    </span>
                    <span className="font-semibold text-slate-800">
                      {act.estimatedCost > 0 ? `${act.currency} ${act.estimatedCost}` : 'Free'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works (3 Steps) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-xs font-bold uppercase tracking-wider text-teal-600 mb-1">
            Engineered Workflow
          </h2>
          <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 font-serif">
            How Voyager AI Builds Your Journey
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs relative">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-sm mb-4">
              01
            </div>
            <h4 className="text-base font-bold text-slate-900 mb-2">Define Preferences & Constraints</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Input destination, exact travel dates, traveler makeup, total budget, pace preference, dietary requirements, and specific interests.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs relative">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-sm mb-4">
              02
            </div>
            <h4 className="text-base font-bold text-slate-900 mb-2">AI Synthesizes Balanced Days</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Our intelligent engine schedules morning, afternoon, and evening activities, prevents overlapping transit times, and matches verified restaurants.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs relative">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-sm mb-4">
              03
            </div>
            <h4 className="text-base font-bold text-slate-900 mb-2">Collaborate, Edit & Print</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Tweak specific stops, reorder activities, invite travel partners, regenerate individual days, and export clean physical travel PDF vouchers.
            </p>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="bg-slate-100 py-16 px-4 sm:px-6 lg:px-8 border-y border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 font-serif">
              Built for Travelers Who Value Time & Quality
            </h3>
            <p className="text-sm text-slate-600 mt-2">
              Everything you need for stress-free travel planning in one cohesive interface.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <Navigation className="w-6 h-6 text-teal-600 mb-3" />
              <h4 className="text-sm font-bold text-slate-900 mb-1">Route & Waypoint Mapping</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Visual coordinate plotting with geographic clustering so you don't spend half your trip commuting.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <DollarSign className="w-6 h-6 text-teal-600 mb-3" />
              <h4 className="text-sm font-bold text-slate-900 mb-1">Budget Allocation Breakdown</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Real-time tracking of stay, food, transport, and admissions against your target budget constraint.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <Users className="w-6 h-6 text-teal-600 mb-3" />
              <h4 className="text-sm font-bold text-slate-900 mb-1">Shared Group Collaboration</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Invite friends and family with granular roles (Owner, Editor, Viewer) to plan together seamlessly.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <Sparkles className="w-6 h-6 text-teal-600 mb-3" />
              <h4 className="text-sm font-bold text-slate-900 mb-1">Single Day Regeneration</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Don't like Tuesday? Need a rainy day alternative? Regenerate just one day without breaking the trip.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Traveler Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-xs font-bold uppercase tracking-wider text-teal-600 mb-1">
            Traveler Feedback
          </h2>
          <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 font-serif">
            Loved by Solo Voyagers & Group Adventurers
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-700 leading-relaxed italic">
                "Voyager AI mapped out our 4-day Kyoto trip perfectly. Having transit times between temples and specific vegan dining recommendations saved us hours of stress."
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-3">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                alt="Elena"
                className="w-8 h-8 rounded-full object-cover"
              />
              <div>
                <p className="text-xs font-bold text-slate-900">Elena Rostova</p>
                <p className="text-[11px] text-slate-500">Solo Traveler · Visited Japan</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-700 leading-relaxed italic">
                "The budget breakdown and ability to regenerate individual days for our Amalfi trip made planning with four friends so painless. We stayed exactly within our budget cap!"
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-3">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
                alt="Marcus"
                className="w-8 h-8 rounded-full object-cover"
              />
              <div>
                <p className="text-xs font-bold text-slate-900">Marcus Chen</p>
                <p className="text-[11px] text-slate-500">Group Organizer · Visited Italy</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-700 leading-relaxed italic">
                "I loved the printable PDF voucher view for our family trip to Paris. Being able to print out day schedules with metro instructions gave my parents complete confidence."
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-3">
              <img
                src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80"
                alt="Sarah"
                className="w-8 h-8 rounded-full object-cover"
              />
              <div>
                <p className="text-xs font-bold text-slate-900">Sarah Jenkins</p>
                <p className="text-[11px] text-slate-500">Family Vacation · Visited France</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Bottom Banner */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-teal-700 via-teal-800 to-slate-900 rounded-3xl p-8 sm:p-12 text-white text-center shadow-xl relative overflow-hidden">
          <div className="relative z-10 space-y-4 max-w-2xl mx-auto">
            <h3 className="text-2xl sm:text-3xl font-bold font-serif">
              Ready to Design Your Next Unforgettable Journey?
            </h3>
            <p className="text-xs sm:text-sm text-teal-100 leading-relaxed font-sans">
              Build your customized trip in under two minutes with complete freedom to tweak, save, and print.
            </p>
            <div className="pt-2">
              <button
                onClick={() => onStartPlanning()}
                className="px-6 py-3 rounded-xl bg-white text-teal-900 font-bold text-sm hover:bg-teal-50 transition-all shadow-md active:scale-[0.98] inline-flex items-center gap-2"
              >
                <span>Launch Smart Trip Builder</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
