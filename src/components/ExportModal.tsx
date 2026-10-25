import React from 'react';
import { Trip } from '../types/travel';
import { Printer, Download, Share2, X, Check, FileText } from 'lucide-react';

interface ExportModalProps {
  trip: Trip;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ trip, onClose }) => {
  const [copied, setCopied] = React.useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(trip, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${trip.destination.toLowerCase().replace(/[^a-z0-9]/g, '_')}_itinerary.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Export & Print Itinerary</h3>
              <p className="text-xs text-slate-500 truncate max-w-[280px]">{trip.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-5 space-y-3">
          {/* Print Clean Layout */}
          <button
            onClick={handlePrint}
            className="w-full p-3.5 rounded-xl border border-slate-200 hover:border-teal-500/50 hover:bg-teal-50/30 transition-all text-left flex items-start gap-3.5 group"
          >
            <div className="p-2 rounded-lg bg-slate-100 text-slate-700 group-hover:bg-teal-100 group-hover:text-teal-700 transition-colors">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900 group-hover:text-teal-800">
                Print or Save as PDF
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Formatted for clean physical travel vouchers, daily checklists, and phone offline saves.
              </p>
            </div>
          </button>

          {/* Download JSON */}
          <button
            onClick={handleDownloadJSON}
            className="w-full p-3.5 rounded-xl border border-slate-200 hover:border-teal-500/50 hover:bg-teal-50/30 transition-all text-left flex items-start gap-3.5 group"
          >
            <div className="p-2 rounded-lg bg-slate-100 text-slate-700 group-hover:bg-teal-100 group-hover:text-teal-700 transition-colors">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900 group-hover:text-teal-800">
                Download Raw JSON Travel Data
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Structured schema with day activities, coordinates, budgets, and recommendations.
              </p>
            </div>
          </button>

          {/* Share Web Link */}
          <button
            onClick={handleCopyLink}
            className="w-full p-3.5 rounded-xl border border-slate-200 hover:border-teal-500/50 hover:bg-teal-50/30 transition-all text-left flex items-start gap-3.5 group"
          >
            <div className="p-2 rounded-lg bg-slate-100 text-slate-700 group-hover:bg-teal-100 group-hover:text-teal-700 transition-colors">
              {copied ? <Check className="w-5 h-5 text-emerald-600" /> : <Share2 className="w-5 h-5" />}
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900 group-hover:text-teal-800">
                {copied ? 'Link Copied to Clipboard!' : 'Copy Shareable Link'}
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Share this interactive travel itinerary directly with friends and family.
              </p>
            </div>
          </button>
        </div>

        <div className="mt-6 pt-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
