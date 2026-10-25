import React, { useState } from 'react';
import { TripCollaborator } from '../types/travel';
import { Users, Mail, UserPlus, Trash2, Shield, X, Check } from 'lucide-react';

interface CollaborateModalProps {
  collaborators: TripCollaborator[];
  tripTitle: string;
  onAddCollaborator: (email: string, role: 'editor' | 'viewer') => Promise<void>;
  onRemoveCollaborator: (collabId: string) => Promise<void>;
  onClose: () => void;
}

export const CollaborateModal: React.FC<CollaborateModalProps> = ({
  collaborators,
  tripTitle,
  onAddCollaborator,
  onRemoveCollaborator,
  onClose
}) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'editor' | 'viewer'>('editor');
  const [loading, setLoading] = useState(false);
  const [invitedSuccess, setInvitedSuccess] = useState(false);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    try {
      await onAddCollaborator(email.trim(), role);
      setEmail('');
      setInvitedSuccess(true);
      setTimeout(() => setInvitedSuccess(false), 3000);
    } finally {
      setLoading(false);
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
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Trip Collaboration</h3>
              <p className="text-xs text-slate-500 truncate max-w-[260px]">{tripTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Invite Form */}
        <form onSubmit={handleInvite} className="mt-4 space-y-3">
          <label className="block text-xs font-semibold text-slate-700">
            Invite Friends & Travel Partners
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="email"
                required
                placeholder="friend@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>
            <select
              value={role}
              onChange={e => setRole(e.target.value as 'editor' | 'viewer')}
              className="px-2.5 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            >
              <option value="editor">Editor</option>
              <option value="viewer">Viewer</option>
            </select>
            <button
              type="submit"
              disabled={loading}
              className="px-3.5 py-2 text-xs font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors flex items-center gap-1 shadow-sm disabled:opacity-50"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Invite</span>
            </button>
          </div>

          {invitedSuccess && (
            <div className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg p-2 flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Invitation sent! Collaborator added to trip.</span>
            </div>
          )}
        </form>

        {/* Current Collaborators */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <h4 className="text-xs font-semibold text-slate-700 mb-2.5">
            Active Members ({collaborators.length})
          </h4>
          <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
            {collaborators.map(c => (
              <div
                key={c.id}
                className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200/80"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <div className="w-7 h-7 rounded-full bg-teal-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-semibold text-slate-900 truncate">{c.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{c.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                    c.role === 'owner' 
                      ? 'bg-amber-100 text-amber-800' 
                      : c.role === 'editor'
                      ? 'bg-teal-100 text-teal-800'
                      : 'bg-slate-200 text-slate-700'
                  }`}>
                    {c.role.toUpperCase()}
                  </span>

                  {c.role !== 'owner' && (
                    <button
                      onClick={() => onRemoveCollaborator(c.id)}
                      className="p-1 text-slate-400 hover:text-red-600 transition-colors rounded"
                      title="Remove member"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
