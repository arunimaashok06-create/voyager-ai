import React, { useState, useEffect } from 'react';
import { UserProfile, TravelPace } from '../types/travel';
import { TravelApi } from '../services/api';
import { User, DollarSign, Sparkles, Check, ShieldCheck, Server, Globe } from 'lucide-react';

interface SettingsViewProps {
  user: { name: string; email: string; avatar: string } | null;
  currency: string;
  onCurrencyChange: (curr: string) => void;
  onUpdateUser: (userData: { name: string; email: string; avatar: string }) => void;
}

const CURRENCIES = [
  { code: 'USD', name: 'US Dollar ($)' },
  { code: 'EUR', name: 'Euro (€)' },
  { code: 'GBP', name: 'British Pound (£)' },
  { code: 'JPY', name: 'Japanese Yen (¥)' },
  { code: 'INR', name: 'Indian Rupee (₹)' },
  { code: 'AUD', name: 'Australian Dollar (A$)' },
  { code: 'CAD', name: 'Canadian Dollar (C$)' }
];

export const SettingsView: React.FC<SettingsViewProps> = ({
  user,
  currency,
  onCurrencyChange,
  onUpdateUser
}) => {
  const [name, setName] = useState(user?.name || 'Arunima Ashok');
  const [email, setEmail] = useState(user?.email || 'arunimaashok06@gmail.com');
  const [defaultPace, setDefaultPace] = useState<TravelPace>('balanced');
  const [homeCity, setHomeCity] = useState('San Francisco, CA');
  const [aiStatus, setAiStatus] = useState<{ status: string; aiProvider: string; tripsCount: number } | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    TravelApi.getHealth().then(status => setAiStatus(status));
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      name,
      email,
      avatar: user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 font-serif">
          Planner Preferences & Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Customize your default travel styles, home airport, and AI synthesis defaults
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Details */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
            User Profile
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Home Origin City / Airport</label>
            <input
              type="text"
              placeholder="e.g. San Francisco (SFO) or London (LHR)"
              value={homeCity}
              onChange={e => setHomeCity(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>
        </div>

        {/* Currency & Travel Defaults */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
            Travel Defaults
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Default Base Currency</label>
              <select
                value={currency}
                onChange={e => onCurrencyChange(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              >
                {CURRENCIES.map(c => (
                  <option key={c.code} value={c.code}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Default Travel Pace</label>
              <select
                value={defaultPace}
                onChange={e => setDefaultPace(e.target.value as TravelPace)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              >
                <option value="relaxed">Relaxed (1-2 stops/day)</option>
                <option value="balanced">Balanced (2-3 stops/day)</option>
                <option value="packed">Packed & Energetic (4+ stops/day)</option>
              </select>
            </div>
          </div>
        </div>

        {/* AI Engine & System Status */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
              AI Service & System Health
            </h2>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
              Operational
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
              <span className="text-slate-400 block text-[11px]">Active Synthesis Engine</span>
              <span className="font-semibold text-slate-900 mt-0.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                {aiStatus?.aiProvider || 'Gemini 3.8 Flash / Travel Engine'}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
              <span className="text-slate-400 block text-[11px]">Backend Server State</span>
              <span className="font-semibold text-emerald-700 mt-0.5 flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-emerald-600" />
                {aiStatus?.status === 'healthy' ? 'Express REST API Healthy' : 'Active Local Bridge'}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
              <span className="text-slate-400 block text-[11px]">Storage Synchronization</span>
              <span className="font-semibold text-slate-900 mt-0.5 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                {aiStatus?.tripsCount || 3} Loaded Trip(s)
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          {savedSuccess && (
            <span className="text-xs text-emerald-600 flex items-center gap-1 font-medium">
              <Check className="w-3.5 h-3.5" />
              Preferences saved successfully!
            </span>
          )}
          <button
            type="submit"
            className="px-5 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            Save Preferences
          </button>
        </div>
      </form>
    </div>
  );
};
