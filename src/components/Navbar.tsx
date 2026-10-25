import React from 'react';
import { Compass, Sparkles, MapPin, User, Bookmark, PlusCircle, Settings, LogOut, Check } from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  selectedCurrency: string;
  onCurrencyChange: (curr: string) => void;
  user: { name: string; email: string; avatar: string } | null;
  onOpenAuth: () => void;
  onLogout: () => void;
}

const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'INR', 'AUD', 'CAD'];

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onNavigate,
  selectedCurrency,
  onCurrencyChange,
  user,
  onOpenAuth,
  onLogout
}) => {
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);
  const [currencyMenuOpen, setCurrencyMenuOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div 
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
            <Compass className="w-5 h-5 text-teal-100" />
          </div>
          <div>
            <span className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
              Voyager AI
              <span className="text-teal-600 text-xs font-semibold px-1.5 py-0.5 rounded bg-teal-50 border border-teal-200/60">
                PRO
              </span>
            </span>
            <p className="text-[11px] text-slate-500 hidden sm:block">Personalized Travel Itinerary Planner</p>
          </div>
        </div>

        {/* Center Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          <button
            onClick={() => onNavigate('landing')}
            className={`px-3.5 py-2 text-sm font-medium transition-colors rounded-lg ${
              currentTab === 'landing' 
                ? 'text-teal-700 bg-teal-50/70 font-semibold' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Explore
          </button>
          <button
            onClick={() => onNavigate('dashboard')}
            className={`px-3.5 py-2 text-sm font-medium transition-colors rounded-lg ${
              currentTab === 'dashboard' 
                ? 'text-teal-700 bg-teal-50/70 font-semibold' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => onNavigate('saved-trips')}
            className={`px-3.5 py-2 text-sm font-medium transition-colors rounded-lg ${
              currentTab === 'saved-trips' 
                ? 'text-teal-700 bg-teal-50/70 font-semibold' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            My Trips
          </button>
          <button
            onClick={() => onNavigate('settings')}
            className={`px-3.5 py-2 text-sm font-medium transition-colors rounded-lg ${
              currentTab === 'settings' 
                ? 'text-teal-700 bg-teal-50/70 font-semibold' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Preferences
          </button>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Currency Selector */}
          <div className="relative">
            <button
              onClick={() => {
                setCurrencyMenuOpen(!currencyMenuOpen);
                setUserMenuOpen(false);
              }}
              className="text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 px-2.5 py-1.5 rounded-md border border-slate-200 transition-colors flex items-center gap-1"
            >
              {selectedCurrency}
            </button>
            {currencyMenuOpen && (
              <div className="absolute right-0 mt-2 w-28 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                {CURRENCIES.map(curr => (
                  <button
                    key={curr}
                    onClick={() => {
                      onCurrencyChange(curr);
                      setCurrencyMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs font-medium flex items-center justify-between hover:bg-slate-50 ${
                      selectedCurrency === curr ? 'text-teal-600 font-semibold' : 'text-slate-700'
                    }`}
                  >
                    {curr}
                    {selectedCurrency === curr && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* New Trip Button */}
          <button
            onClick={() => onNavigate('builder')}
            className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-medium px-3.5 py-2 rounded-lg shadow-sm transition-all hover:shadow active:scale-[0.98]"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Plan Trip</span>
            <span className="sm:hidden">Plan</span>
          </button>

          {/* User Account / Sign In */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => {
                  setUserMenuOpen(!userMenuOpen);
                  setCurrencyMenuOpen(false);
                }}
                className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-teal-500/20 transition-all"
              >
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover border border-slate-200"
                />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in duration-150">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-sm font-semibold text-slate-900 truncate">{user.name}</p>
                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => {
                        onNavigate('dashboard');
                        setUserMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <Compass className="w-4 h-4 text-slate-400" />
                      Dashboard
                    </button>
                    <button
                      onClick={() => {
                        onNavigate('saved-trips');
                        setUserMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <Bookmark className="w-4 h-4 text-slate-400" />
                      Saved Itineraries
                    </button>
                    <button
                      onClick={() => {
                        onNavigate('settings');
                        setUserMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <Settings className="w-4 h-4 text-slate-400" />
                      Preferences & Settings
                    </button>
                  </div>
                  <div className="border-t border-slate-100 pt-1">
                    <button
                      onClick={() => {
                        onLogout();
                        setUserMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium"
                    >
                      <LogOut className="w-4 h-4 text-red-500" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="text-xs sm:text-sm font-medium text-slate-700 hover:text-slate-900 px-3 py-1.5 rounded-lg border border-slate-300 hover:border-slate-400 transition-colors"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
