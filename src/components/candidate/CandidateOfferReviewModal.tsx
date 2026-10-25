/**
 * CareerSphere AI — Candidate Job Offer Review & Response Modal
 * Phase 4: Candidate-facing compensation package inspection, acceptance/decline, and hiring synchronization.
 */
import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { JobOffer } from '../../types';
import { apiClient } from '../../services/api';
import {
  DollarSign,
  Gift,
  CheckCircle2,
  XCircle,
  Clock,
  Shield,
  Loader2,
  AlertTriangle,
  FileText,
  Percent,
  MapPin,
  Calendar,
} from 'lucide-react';

interface CandidateOfferReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  offer: JobOffer;
  onResponseSubmitted: (updatedOffer: JobOffer) => void;
}

export const CandidateOfferReviewModal: React.FC<CandidateOfferReviewModalProps> = ({
  isOpen,
  onClose,
  offer,
  onResponseSubmitted,
}) => {
  const [candidateNotes, setCandidateNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const formattedSalary = `${offer.currency || 'USD'} ${Number(offer.baseSalary).toLocaleString()} / ${offer.payFrequency || 'annual'}`;
  const isExpired = offer.expiryDate && new Date(offer.expiryDate) < new Date() && offer.status === 'issued';
  const isDecided = offer.status === 'accepted' || offer.status === 'declined' || offer.status === 'withdrawn';

  const handleRespond = async (action: 'accept' | 'decline') => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await apiClient.respondToOffer(offer.id, action, candidateNotes.trim() || undefined);
      onResponseSubmitted(res.offer);
      onClose();
    } catch (err: any) {
      setError(err?.message || `Failed to ${action} offer.`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Formal Job Offer Package — ${offer.jobTitle}`}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-5 text-left text-xs">
        {/* Top Status Banner */}
        {offer.status === 'accepted' ? (
          <div className="p-3.5 rounded-xl border border-emerald-700 bg-emerald-950/50 text-emerald-300 flex items-center gap-2.5">
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
            <div>
              <span className="font-bold">Offer Formally Accepted</span>
              <p className="text-[11px] text-emerald-200/90 mt-0.5">
                Congratulations! You have joined the team. Your onboarding coordinator will reach out with start date details.
              </p>
            </div>
          </div>
        ) : offer.status === 'declined' ? (
          <div className="p-3.5 rounded-xl border border-rose-800 bg-rose-950/50 text-rose-300 flex items-center gap-2.5">
            <XCircle className="h-5 w-5 text-rose-400 shrink-0" />
            <div>
              <span className="font-bold">Offer Declined</span>
              <p className="text-[11px] text-rose-200/90 mt-0.5">
                You have declined this compensation package.
              </p>
            </div>
          </div>
        ) : isExpired ? (
          <div className="p-3.5 rounded-xl border border-slate-700 bg-slate-900 text-slate-400 flex items-center gap-2.5">
            <Clock className="h-5 w-5 text-slate-500 shrink-0" />
            <div>
              <span className="font-bold text-white">Offer Expired</span>
              <p className="text-[11px] mt-0.5">
                The response window for this offer closed on {new Date(offer.expiryDate!).toLocaleDateString()}.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-3.5 rounded-xl border border-teal-800/60 bg-gradient-to-r from-teal-950/60 via-slate-900 to-slate-950 flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="font-bold text-white text-sm">Official Job Offer (v{offer.version || 1})</span>
              <p className="text-teal-300 text-[11px]">
                Please review your comprehensive compensation and equity terms below.
              </p>
            </div>
            {offer.expiryDate && (
              <span className="font-mono text-xs text-amber-300 bg-amber-950/80 px-2.5 py-1 rounded-lg border border-amber-800/60 shrink-0">
                Expires: {new Date(offer.expiryDate).toLocaleDateString()}
              </span>
            )}
          </div>
        )}

        {error && (
          <div className="p-3 rounded-xl border border-rose-800/60 bg-rose-950/40 text-rose-300 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Compensation Card Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-1">
            <div className="text-[11px] text-slate-400 flex items-center justify-between">
              <span>Base Compensation</span>
              <DollarSign className="h-3.5 w-3.5 text-emerald-400" />
            </div>
            <div className="text-lg font-bold font-mono text-emerald-400">
              {formattedSalary}
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-1">
            <div className="text-[11px] text-slate-400 flex items-center justify-between">
              <span>Bonus & Equity Terms</span>
              <Percent className="h-3.5 w-3.5 text-indigo-400" />
            </div>
            <div className="text-sm font-semibold text-white truncate" title={offer.bonusOrEquity || 'None'}>
              {offer.bonusOrEquity || 'Standard Package'}
            </div>
          </div>
        </div>

        {/* Details List */}
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-400">Workplace Arrangement:</span>
              <strong className="text-white ml-2 capitalize">{offer.workplaceType || 'Remote'}</strong>
            </div>
            {offer.startDate && (
              <div>
                <span className="text-slate-400">Target Start Date:</span>
                <strong className="text-white ml-2 font-mono">
                  {new Date(offer.startDate).toLocaleDateString()}
                </strong>
              </div>
            )}
          </div>

          {/* Benefits */}
          {offer.benefits && offer.benefits.length > 0 && (
            <div className="space-y-1.5 pt-2 border-t border-slate-800">
              <span className="text-slate-400 font-medium">Benefits & Perks:</span>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-[11px] leading-relaxed">
                {offer.benefits.join(' • ')}
              </div>
            </div>
          )}

          {/* Special Terms / Cover note */}
          {offer.specialTerms && (
            <div className="space-y-1.5 pt-2 border-t border-slate-800">
              <span className="text-slate-400 font-medium">Note from the Hiring Team:</span>
              <p className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-[11px] leading-relaxed italic">
                "{offer.specialTerms}"
              </p>
            </div>
          )}
        </div>

        {/* Response Action Section if not decided */}
        {!isDecided && !isExpired && (
          <div className="space-y-3 pt-2">
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Optional Response Comments or Acceptance Note
              </label>
              <textarea
                rows={2}
                value={candidateNotes}
                onChange={(e) => setCandidateNotes(e.target.value)}
                placeholder="I am thrilled to accept this offer / Reason for declining..."
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleRespond('decline')}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-rose-300 hover:text-rose-200 hover:bg-rose-950/40 border border-rose-900/50 transition-colors cursor-pointer"
              >
                Decline Offer
              </button>

              <button
                type="button"
                disabled={submitting}
                onClick={() => handleRespond('accept')}
                className="flex items-center gap-1.5 px-6 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                )}
                <span>Accept Offer Package</span>
              </button>
            </div>
          </div>
        )}

        {/* Close Button if already decided */}
        {(isDecided || isExpired) && (
          <div className="flex justify-end pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs bg-slate-800 text-white hover:bg-slate-700 cursor-pointer"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
};
