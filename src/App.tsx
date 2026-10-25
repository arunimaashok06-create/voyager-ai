/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Trip, TripRequest, Activity } from './types/travel';
import { TravelApi } from './services/api';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './pages/LandingPage';
import { DashboardView } from './pages/DashboardView';
import { TripBuilder } from './pages/TripBuilder';
import { ItineraryDetailView } from './pages/ItineraryDetailView';
import { SavedTripsView } from './pages/SavedTripsView';
import { SettingsView } from './pages/SettingsView';
import { AuthModal } from './components/AuthModal';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('landing');
  const [trips, setTrips] = useState<Trip[]>([]);
  const [currentTrip, setCurrentTrip] = useState<Trip | null>(null);
  const [initialBuilderData, setInitialBuilderData] = useState<Partial<TripRequest> | undefined>(undefined);
  const [selectedCurrency, setSelectedCurrency] = useState<string>('USD');
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Default logged in user for demo sandbox
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string; avatar: string } | null>({
    name: 'Arunima Ashok',
    email: 'arunimaashok06@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  });

  // Load trips on initial load
  useEffect(() => {
    TravelApi.getTrips().then(loaded => {
      setTrips(loaded);
      if (loaded.length > 0 && !currentTrip) {
        setCurrentTrip(loaded[0]);
      }
    });
  }, []);

  const handleStartPlanning = (initialData?: Partial<TripRequest>) => {
    setInitialBuilderData(initialData);
    setCurrentTab('builder');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGenerateItinerary = async (req: TripRequest) => {
    const generated = await TravelApi.generateItinerary(req);
    setTrips(prev => [generated, ...prev.filter(t => t.id !== generated.id)]);
    setCurrentTrip(generated);
    setCurrentTab('itinerary');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenTrip = (trip: Trip) => {
    setCurrentTrip(trip);
    setCurrentTab('itinerary');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdateActivity = async (updated: Activity) => {
    if (!currentTrip) return;
    const refreshed = await TravelApi.updateActivity(currentTrip.id, updated);
    setCurrentTrip(refreshed);
    setTrips(prev => prev.map(t => (t.id === refreshed.id ? refreshed : t)));
  };

  const handleDeleteActivity = async (actId: string) => {
    if (!currentTrip) return;
    const refreshed = await TravelApi.deleteActivity(currentTrip.id, actId);
    setCurrentTrip(refreshed);
    setTrips(prev => prev.map(t => (t.id === refreshed.id ? refreshed : t)));
  };

  const handleRegenerateDay = async (dayNum: number, instruction?: string) => {
    if (!currentTrip) return;
    const refreshed = await TravelApi.regenerateDay(currentTrip.id, dayNum, instruction);
    setCurrentTrip(refreshed);
    setTrips(prev => prev.map(t => (t.id === refreshed.id ? refreshed : t)));
  };

  const handleAddCollaborator = async (email: string, role: 'editor' | 'viewer') => {
    if (!currentTrip) return;
    const refreshed = await TravelApi.addCollaborator(currentTrip.id, email, role);
    setCurrentTrip(refreshed);
    setTrips(prev => prev.map(t => (t.id === refreshed.id ? refreshed : t)));
  };

  const handleRemoveCollaborator = async (collabId: string) => {
    if (!currentTrip) return;
    const refreshed = await TravelApi.removeCollaborator(currentTrip.id, collabId);
    setCurrentTrip(refreshed);
    setTrips(prev => prev.map(t => (t.id === refreshed.id ? refreshed : t)));
  };

  const handleDuplicateTrip = async (tripId: string) => {
    const dup = await TravelApi.duplicateTrip(tripId);
    setTrips(prev => [dup, ...prev]);
    setCurrentTrip(dup);
    setCurrentTab('itinerary');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteTrip = async (tripId: string) => {
    await TravelApi.deleteTrip(tripId);
    setTrips(prev => prev.filter(t => t.id !== tripId));
    if (currentTrip?.id === tripId) {
      setCurrentTrip(trips.find(t => t.id !== tripId) || null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      <Navbar
        currentTab={currentTab}
        onNavigate={tab => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        selectedCurrency={selectedCurrency}
        onCurrencyChange={curr => setSelectedCurrency(curr)}
        user={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={() => setCurrentUser(null)}
      />

      <main className="flex-1">
        {currentTab === 'landing' && (
          <LandingPage
            onStartPlanning={handleStartPlanning}
            onViewSampleTrip={handleOpenTrip}
          />
        )}

        {currentTab === 'dashboard' && (
          <DashboardView
            trips={trips}
            currency={selectedCurrency}
            onOpenTrip={handleOpenTrip}
            onStartNewTrip={() => handleStartPlanning()}
            onDuplicateTrip={handleDuplicateTrip}
            onDeleteTrip={handleDeleteTrip}
          />
        )}

        {currentTab === 'builder' && (
          <TripBuilder
            initialData={initialBuilderData}
            defaultCurrency={selectedCurrency}
            onGenerate={handleGenerateItinerary}
            onCancel={() => setCurrentTab('landing')}
          />
        )}

        {currentTab === 'itinerary' && currentTrip && (
          <ItineraryDetailView
            trip={currentTrip}
            onUpdateActivity={handleUpdateActivity}
            onDeleteActivity={handleDeleteActivity}
            onRegenerateDay={handleRegenerateDay}
            onAddCollaborator={handleAddCollaborator}
            onRemoveCollaborator={handleRemoveCollaborator}
            onDuplicateTrip={() => handleDuplicateTrip(currentTrip.id)}
            onBackToDashboard={() => setCurrentTab('dashboard')}
          />
        )}

        {currentTab === 'saved-trips' && (
          <SavedTripsView
            trips={trips}
            currency={selectedCurrency}
            onOpenTrip={handleOpenTrip}
            onStartNewTrip={() => handleStartPlanning()}
            onDuplicateTrip={handleDuplicateTrip}
            onDeleteTrip={handleDeleteTrip}
          />
        )}

        {currentTab === 'settings' && (
          <SettingsView
            user={currentUser}
            currency={selectedCurrency}
            onCurrencyChange={curr => setSelectedCurrency(curr)}
            onUpdateUser={updated => setCurrentUser(updated)}
          />
        )}
      </main>

      <Footer />

      {isAuthOpen && (
        <AuthModal
          onLogin={userData => setCurrentUser(userData)}
          onClose={() => setIsAuthOpen(false)}
        />
      )}
    </div>
  );
}
