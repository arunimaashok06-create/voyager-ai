import React from 'react';
import { Compass, ShieldCheck, Heart, Sparkles, Globe } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-800">
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2.5 text-white font-bold text-lg">
              <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center text-slate-950 font-black">
                <Compass className="w-4 h-4 text-white" />
              </div>
              <span>Voyager AI</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Full-stack personalized itinerary planner synthesizing tailored daily schedules, realistic budgets, and verified local recommendations.
            </p>
          </div>

          {/* Destination Ideas */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">
              Popular Itineraries
            </h4>
            <ul className="space-y-2 text-xs">
              <li><span className="hover:text-teal-400 cursor-pointer">Kyoto Zen Gardens & Temples</span></li>
              <li><span className="hover:text-teal-400 cursor-pointer">Paris Hidden Gastronomy & Art</span></li>
              <li><span className="hover:text-teal-400 cursor-pointer">Amalfi Coast Scenic Cliffways</span></li>
              <li><span className="hover:text-teal-400 cursor-pointer">Tokyo High-Energy Tech & Food</span></li>
            </ul>
          </div>

          {/* Architecture & AI */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">
              Platform Features
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-teal-400" /> Day-by-Day AI Synthesis</li>
              <li>Interactive Route Waypoint Maps</li>
              <li>Budget Breakdown & Variance Warnings</li>
              <li>Collaborative Group Planning</li>
              <li>Printable PDF Travel Vouchers</li>
            </ul>
          </div>

          {/* Transparency & Safety */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">
              Verification & Transparency
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Itinerary estimates, operating hours, and costs are calculated from seasonal averages. Travelers should verify specific venues prior to ticket purchases.
            </p>
            <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-300">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              <span>Standard Data Safety & RLS Protected</span>
            </div>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 Voyager AI Platform. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-300 cursor-pointer">Privacy Policy</span>
            <span>·</span>
            <span className="hover:text-slate-300 cursor-pointer">Terms of Service</span>
            <span>·</span>
            <span className="hover:text-slate-300 cursor-pointer">Security Practices</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
