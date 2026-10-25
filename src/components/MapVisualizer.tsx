import React, { useState } from 'react';
import { Trip, Activity } from '../types/travel';
import { MapPin, Navigation, Compass, ZoomIn, ZoomOut, Maximize2, Info } from 'lucide-react';

interface MapVisualizerProps {
  trip: Trip;
  activeDayNumber: number;
}

export const MapVisualizer: React.FC<MapVisualizerProps> = ({ trip, activeDayNumber }) => {
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showAllDays, setShowAllDays] = useState(false);

  const activeDay = trip.days.find(d => d.dayNumber === activeDayNumber) || trip.days[0];

  const activitiesToPlot = showAllDays 
    ? trip.days.flatMap(d => d.activities) 
    : activeDay.activities;

  // Compute bounding box
  const lats = activitiesToPlot.map(a => a.coordinates?.lat || 0).filter(Boolean);
  const lngs = activitiesToPlot.map(a => a.coordinates?.lng || 0).filter(Boolean);

  const minLat = lats.length > 0 ? Math.min(...lats) : 48.85;
  const maxLat = lats.length > 0 ? Math.max(...lats) : 48.87;
  const minLng = lngs.length > 0 ? Math.min(...lngs) : 2.34;
  const maxLng = lngs.length > 0 ? Math.max(...lngs) : 2.36;

  const latSpan = Math.max(0.015, (maxLat - minLat) * 1.4);
  const lngSpan = Math.max(0.015, (maxLng - minLng) * 1.4);

  const centerLat = (minLat + maxLat) / 2;
  const centerLng = (minLng + maxLng) / 2;

  // Project lat/lng to SVG viewport [100..700, 80..420]
  const project = (lat: number, lng: number) => {
    const x = 400 + ((lng - centerLng) / lngSpan) * 260 * zoomLevel;
    const y = 250 - ((lat - centerLat) / latSpan) * 180 * zoomLevel;
    return { x, y };
  };

  // Generate SVG path points
  const points = activitiesToPlot.map(act => {
    const lat = act.coordinates?.lat || centerLat;
    const lng = act.coordinates?.lng || centerLng;
    return { ...project(lat, lng), activity: act };
  });

  const pathD = points.length > 1
    ? points.reduce((acc, curr, idx) => (idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`), '')
    : '';

  return (
    <div className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 text-white shadow-xl relative">
      {/* Top Map Bar */}
      <div className="px-5 py-3.5 bg-slate-800/80 backdrop-blur border-b border-slate-700/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Navigation className="w-4 h-4 text-teal-400" />
          <span className="text-sm font-semibold tracking-tight text-slate-100">
            {showAllDays ? `All Trip Waypoints (${trip.destination})` : `${activeDay.theme} Route Map`}
          </span>
          <span className="text-xs text-slate-400">· {activitiesToPlot.length} stops plotted</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-700/80 p-0.5 rounded-lg border border-slate-600">
            <button
              onClick={() => setShowAllDays(false)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                !showAllDays ? 'bg-teal-500 text-slate-950 font-semibold shadow' : 'text-slate-300 hover:text-white'
              }`}
            >
              Day {activeDayNumber}
            </button>
            <button
              onClick={() => setShowAllDays(true)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                showAllDays ? 'bg-teal-500 text-slate-950 font-semibold shadow' : 'text-slate-300 hover:text-white'
              }`}
            >
              Full Journey
            </button>
          </div>

          <div className="flex items-center bg-slate-700/80 rounded-lg border border-slate-600 divide-x divide-slate-600">
            <button
              onClick={() => setZoomLevel(prev => Math.min(2.5, prev + 0.25))}
              className="p-1.5 hover:bg-slate-600 text-slate-300 hover:text-white transition-colors"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel(prev => Math.max(0.75, prev - 0.25))}
              className="p-1.5 hover:bg-slate-600 text-slate-300 hover:text-white transition-colors"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="p-1.5 hover:bg-slate-600 text-slate-300 hover:text-white transition-colors"
              title="Reset view"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Map Visual Stage */}
      <div className="relative w-full h-[400px] sm:h-[450px] bg-slate-950 overflow-hidden select-none">
        {/* Subtle Map Grid & Topographic contour lines */}
        <div 
          className="absolute inset-0 opacity-20 pointer-events-none" 
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #38bdf8 1px, transparent 0)`,
            backgroundSize: '28px 28px'
          }}
        />

        <svg className="w-full h-full" viewBox="0 0 800 500" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#14b8a6" />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="glow" />
              <feComposite in="SourceGraphic" in2="glow" operator="over" />
            </filter>
          </defs>

          {/* District ambient circular fields */}
          <circle cx="400" cy="250" r="180" fill="#0f172a" stroke="#1e293b" strokeWidth="1.5" strokeDasharray="4 4" />
          <circle cx="380" cy="230" r="90" fill="#1e293b" fillOpacity="0.4" stroke="#334155" strokeWidth="1" />

          {/* Route Polyline connecting waypoints */}
          {pathD && (
            <>
              <path
                d={pathD}
                fill="none"
                stroke="#0f766e"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.4"
              />
              <path
                d={pathD}
                fill="none"
                stroke="url(#routeGradient)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="5 3"
              />
            </>
          )}

          {/* Render Waypoint Pins */}
          {points.map((pt, idx) => {
            const isSelected = selectedActivity?.id === pt.activity.id;
            return (
              <g
                key={pt.activity.id}
                transform={`translate(${pt.x}, ${pt.y})`}
                onClick={() => setSelectedActivity(pt.activity)}
                className="cursor-pointer group"
              >
                {/* Pulse ring when selected */}
                {isSelected && (
                  <circle r="22" fill="#2dd4bf" opacity="0.25" className="animate-ping" />
                )}

                <circle
                  r={isSelected ? '14' : '11'}
                  fill={isSelected ? '#0d9488' : '#0f172a'}
                  stroke={isSelected ? '#5eead4' : '#14b8a6'}
                  strokeWidth={isSelected ? '2.5' : '2'}
                  filter="url(#glow)"
                />

                <text
                  textAnchor="middle"
                  dy="4"
                  fontSize="10"
                  fontWeight="bold"
                  fill="#ffffff"
                  className="pointer-events-none select-none font-sans"
                >
                  {idx + 1}
                </text>

                {/* Quiet Label */}
                <text
                  x="16"
                  y="4"
                  fontSize="11"
                  fill={isSelected ? '#5eead4' : '#cbd5e1'}
                  fontWeight={isSelected ? '600' : '500'}
                  className="transition-colors group-hover:fill-teal-300 pointer-events-none drop-shadow"
                >
                  {pt.activity.name.length > 24 ? pt.activity.name.slice(0, 24) + '...' : pt.activity.name}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Selected Activity Detail Floater */}
        {selectedActivity && (
          <div className="absolute bottom-4 left-4 right-4 sm:left-6 sm:right-auto sm:w-96 bg-slate-800/95 backdrop-blur-md rounded-xl p-4 border border-teal-500/40 shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-150">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[11px] font-semibold tracking-wider uppercase text-teal-400">
                  {selectedActivity.category} · {selectedActivity.startTime} - {selectedActivity.endTime}
                </span>
                <h4 className="text-sm font-bold text-white mt-0.5 leading-snug">
                  {selectedActivity.name}
                </h4>
              </div>
              <button
                onClick={() => setSelectedActivity(null)}
                className="text-slate-400 hover:text-white text-xs px-1.5 py-0.5 rounded bg-slate-700"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 mt-2 line-clamp-2 leading-relaxed">
              {selectedActivity.description}
            </p>

            <div className="mt-3 pt-2.5 border-t border-slate-700/80 flex items-center justify-between text-xs text-slate-300">
              <span className="flex items-center gap-1 text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span className="truncate max-w-[180px]">{selectedActivity.location}</span>
              </span>
              <span className="font-semibold text-teal-300">
                {selectedActivity.estimatedCost > 0
                  ? `${selectedActivity.currency} ${selectedActivity.estimatedCost}`
                  : 'Free'}
              </span>
            </div>

            {selectedActivity.transportationToNext && (
              <div className="mt-2 text-[11px] text-teal-200/90 flex items-center gap-1.5 bg-teal-950/60 px-2 py-1 rounded">
                <Navigation className="w-3 h-3 text-teal-400 shrink-0" />
                <span>Next stop: {selectedActivity.transportationToNext}</span>
              </div>
            )}
          </div>
        )}

        {/* Legend */}
        <div className="absolute top-4 right-4 bg-slate-900/90 backdrop-blur px-3 py-2 rounded-lg border border-slate-700 text-[11px] text-slate-300 flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-400 inline-block" />
            <span>Itinerary Stops</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-0.5 border-t border-dashed border-sky-400 inline-block" />
            <span>Optimized Sequence</span>
          </div>
        </div>
      </div>
    </div>
  );
};
