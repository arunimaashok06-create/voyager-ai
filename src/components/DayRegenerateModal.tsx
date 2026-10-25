import React, { useState } from 'react';
import { Sparkles, RefreshCw, X, Umbrella, Coffee, Compass, Mountain, Utensils } from 'lucide-react';

interface DayRegenerateModalProps {
  dayNumber: number;
  currentTheme: string;
  onRegenerate: (instruction: string) => Promise<void>;
  onClose: () => void;
}

const PRESET_INSTRUCTIONS = [
  { label: 'Rainy Day Indoor Activities', icon: Umbrella, text: 'Swap outdoor sightseeing for indoor covered museums, historic arcades, and cozy cultural venues due to rain.' },
  { label: 'Relaxed & Slower Pace', icon: Coffee, text: 'Reduce the number of stops, start later in the morning, and prioritize peaceful cafes and scenic resting spots.' },
  { label: 'Local Food & Street Dining', icon: Utensils, text: 'Focus heavily on food markets, culinary tasting stops, and authentic neighborhood eateries.' },
  { label: 'Outdoor Nature & Viewpoints', icon: Mountain, text: 'Maximize panoramic viewpoints, botanical gardens, and scenic walking paths.' },
  { label: 'Hidden Gems & Artisan Studios', icon: Compass, text: 'Avoid mainstream tourist crowds and focus on lesser-known artisan workshops and quiet districts.' }
];

export const DayRegenerateModal: React.FC<DayRegenerateModalProps> = ({
  dayNumber,
  currentTheme,
  onRegenerate,
  onClose
}) => {
  const [customInstruction, setCustomInstruction] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (textToUse: string) => {
    setIsSubmitting(true);
    try {
      await onRegenerate(textToUse);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Regenerate Day {dayNumber}</h3>
              <p className="text-xs text-slate-500 truncate max-w-[260px]">{currentTheme}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Choose an AI Optimization Preset
            </label>
            <div className="space-y-1.5">
              {PRESET_INSTRUCTIONS.map((preset, idx) => {
                const Icon = preset.icon;
                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => {
                      setCustomInstruction(preset.text);
                    }}
                    className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all flex items-center gap-2.5 ${
                      customInstruction === preset.text
                        ? 'bg-teal-50/70 border-teal-300 text-teal-900 font-medium'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-teal-600 shrink-0" />
                    <span className="truncate">{preset.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Or specify custom requirements
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Include a vintage flea market and an early evening jazz cafe..."
              value={customInstruction}
              onChange={e => setCustomInstruction(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSubmit(customInstruction || 'Generate fresh alternative activities for this day')}
              className="px-4 py-2 text-xs font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSubmitting ? 'animate-spin' : ''}`} />
              {isSubmitting ? 'Regenerating...' : 'Regenerate Day'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
