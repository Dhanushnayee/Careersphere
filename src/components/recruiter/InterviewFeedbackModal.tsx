/**
 * CareerSphere AI — Interview Feedback & Evaluation Modal
 * Phase 4: Structured criteria scoring (1-5), hire recommendations, strengths, growth areas, locked state, and recruiter-only privacy.
 */
import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { apiClient } from '../../services/api';
import { Interview, InterviewFeedback, InterviewCriteriaRatings } from '../../types';
import {
  Star,
  CheckCircle2,
  Lock,
  AlertTriangle,
  Loader2,
  Shield,
  FileText,
  UserCheck,
  Award,
} from 'lucide-react';

interface InterviewFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  interview: Interview | null;
  onFeedbackSaved: (interviewId: string, feedback: InterviewFeedback) => void;
}

export const InterviewFeedbackModal: React.FC<InterviewFeedbackModalProps> = ({
  isOpen,
  onClose,
  interview,
  onFeedbackSaved,
}) => {
  const [recommendation, setRecommendation] = useState<
    'strong_advance' | 'advance' | 'hold' | 'do_not_advance'
  >('advance');
  const [technicalSkill, setTechnicalSkill] = useState<number>(4);
  const [problemSolving, setProblemSolving] = useState<number>(4);
  const [communication, setCommunication] = useState<number>(4);
  const [culturalRoleAlignment, setCulturalRoleAlignment] = useState<number>(4);
  const [strengthsText, setStrengthsText] = useState(
    'Strong depth in distributed systems, asynchronous pipelines, and performance optimization under high throughput.'
  );
  const [growthAreasText, setGrowthAreasText] = useState(
    'Could expand on edge-case error recovery and observability telemetry strategies.'
  );
  const [privateNotes, setPrivateNotes] = useState(
    'Candidate displayed exceptional clarity during system design whiteboard tradeoffs.'
  );

  const [loading, setLoading] = useState(false);
  const [fetchingExisting, setFetchingExisting] = useState(false);
  const [existingFeedback, setExistingFeedback] = useState<InterviewFeedback | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && interview?.id) {
      setError(null);
      setFetchingExisting(true);
      apiClient
        .getInterviewFeedback(interview.id)
        .then((res) => {
          const fb = res.feedback;
          if (fb) {
            setExistingFeedback(fb);
            setRecommendation(fb.recommendation);
            if (fb.criteriaRatings) {
              setTechnicalSkill(fb.criteriaRatings.technicalSkill || 4);
              setProblemSolving(fb.criteriaRatings.problemSolving || 4);
              setCommunication(fb.criteriaRatings.communication || 4);
              setCulturalRoleAlignment(fb.criteriaRatings.culturalRoleAlignment || 4);
            }
            setStrengthsText(Array.isArray(fb.strengths) ? fb.strengths.join('\n') : (fb.strengths || ''));
            setGrowthAreasText(Array.isArray(fb.growthAreas) ? fb.growthAreas.join('\n') : (fb.growthAreas || ''));
            setPrivateNotes(fb.privateNotes || '');
          } else {
            setExistingFeedback(null);
          }
        })
        .catch(() => {
          setExistingFeedback(null);
        })
        .finally(() => {
          setFetchingExisting(false);
        });
    }
  }, [isOpen, interview]);

  if (!isOpen || !interview) return null;

  const isLocked = existingFeedback?.isLocked;

  const renderRatingStars = (
    label: string,
    value: number,
    onChange: (val: number) => void
  ) => {
    return (
      <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800">
        <span className="font-medium text-slate-300 text-xs">{label}</span>
        <div className="flex items-center gap-1.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              disabled={isLocked}
              onClick={() => onChange(star)}
              className={`p-1 rounded transition-colors ${
                star <= value ? 'text-amber-400' : 'text-slate-600'
              } ${isLocked ? 'cursor-not-allowed' : 'cursor-pointer hover:text-amber-300'}`}
              title={`${star} / 5`}
            >
              <Star className="h-4 w-4 fill-current" />
            </button>
          ))}
          <span className="font-mono text-xs text-white ml-2 w-6 text-right font-bold">
            {value}/5
          </span>
        </div>
      </div>
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;

    setLoading(true);
    setError(null);

    try {
      const criteriaRatings: InterviewCriteriaRatings = {
        technicalSkill,
        problemSolving,
        communication,
        culturalRoleAlignment,
      };

      const result = await apiClient.submitInterviewFeedback(interview.id, {
        recommendation,
        criteriaRatings,
        strengths: strengthsText.split('\n').filter(Boolean),
        growthAreas: growthAreasText.split('\n').filter(Boolean),
        privateNotes: privateNotes.trim(),
      });

      setExistingFeedback(result.feedback);
      onFeedbackSaved(interview.id, result.feedback);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to submit interview evaluation.');
    } finally {
      setLoading(false);
    }
  };

  const recommendationColorMap: Record<string, string> = {
    strong_advance: 'bg-emerald-950/80 text-emerald-400 border-emerald-700',
    advance: 'bg-teal-950/80 text-teal-400 border-teal-700',
    hold: 'bg-amber-950/80 text-amber-400 border-amber-700',
    do_not_advance: 'bg-rose-950/80 text-rose-400 border-rose-700',
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isLocked ? 'Interview Evaluation (Locked)' : 'Submit Interview Evaluation & Feedback'}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-5 text-left text-xs">
        {/* Header Summary */}
        <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="font-bold text-white text-sm">
              {interview.candidateName || 'Candidate'}
            </div>
            <div className="text-slate-400 text-xs">
              {interview.roundName || `Round ${interview.roundNumber || 1}`} • {interview.jobTitle || 'Requisition'}
            </div>
          </div>
          {isLocked ? (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 text-xs font-semibold">
              <Lock className="h-3.5 w-3.5 text-amber-400" />
              <span>Evaluation Locked</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-950/60 text-cyan-400 border border-cyan-800/60 text-xs font-semibold">
              <UserCheck className="h-3.5 w-3.5" />
              <span>Pending Evaluation</span>
            </div>
          )}
        </div>

        {/* Lock warning */}
        {isLocked && (
          <div className="p-3 rounded-xl border border-amber-800/50 bg-amber-950/30 text-amber-300 flex items-center gap-2">
            <Lock className="h-4 w-4 text-amber-400 shrink-0" />
            <span>
              This feedback scorecard was locked on{' '}
              {existingFeedback?.submittedAt
                ? new Date(existingFeedback.submittedAt).toLocaleDateString()
                : 'completion'}{' '}
              to preserve objective hiring integrity.
            </span>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="p-3 rounded-xl border border-rose-800/60 bg-rose-950/40 text-rose-300 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {fetchingExisting ? (
          <div className="p-8 text-center text-slate-400 flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />
            <span>Retrieving scorecard records...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Overall Recommendation */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">
                Hiring Recommendation <span className="text-rose-400">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'strong_advance', label: 'Strong Advance' },
                  { id: 'advance', label: 'Advance' },
                  { id: 'hold', label: 'Hold' },
                  { id: 'do_not_advance', label: 'Do Not Advance' },
                ].map((rec) => {
                  const isSelected = recommendation === rec.id;
                  return (
                    <button
                      key={rec.id}
                      type="button"
                      disabled={isLocked}
                      onClick={() => setRecommendation(rec.id as any)}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        isSelected
                          ? recommendationColorMap[rec.id] + ' ring-2 ring-offset-2 ring-offset-slate-950'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      } ${isLocked ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
                    >
                      <div className="text-[11px] font-bold">{rec.label}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Criteria Scoring */}
            <div className="space-y-2">
              <label className="block text-slate-300 font-semibold mb-1">
                Criteria Evaluation (1 - 5 Stars)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {renderRatingStars('Technical Competence', technicalSkill, setTechnicalSkill)}
                {renderRatingStars('Problem Solving & Architecture', problemSolving, setProblemSolving)}
                {renderRatingStars('Communication & Articulation', communication, setCommunication)}
                {renderRatingStars('Culture & Team Contribution', culturalRoleAlignment, setCulturalRoleAlignment)}
              </div>
            </div>

            {/* Strengths */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Key Strengths Demonstrated <span className="text-rose-400">*</span>
              </label>
              <textarea
                rows={3}
                disabled={isLocked}
                value={strengthsText}
                onChange={(e) => setStrengthsText(e.target.value)}
                placeholder="What did the candidate excel at during this interview?"
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-xs disabled:opacity-80"
                required
              />
            </div>

            {/* Areas for Growth */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Areas for Growth & Concerns
              </label>
              <textarea
                rows={2}
                disabled={isLocked}
                value={growthAreasText}
                onChange={(e) => setGrowthAreasText(e.target.value)}
                placeholder="Where did the candidate struggle or require additional ramp-up?"
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-xs disabled:opacity-80"
              />
            </div>

            {/* Confidential Private Notes */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1 flex items-center justify-between">
                <span>Internal Recruiter Notes</span>
                <span className="text-[10px] text-rose-400 font-normal flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  Strictly Confidential • HTTP 403 Protected
                </span>
              </label>
              <textarea
                rows={2}
                disabled={isLocked}
                value={privateNotes}
                onChange={(e) => setPrivateNotes(e.target.value)}
                placeholder="Compensation insights, leveling notes, or interviewer consensus comments..."
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-xs disabled:opacity-80"
              />
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                {isLocked ? 'Close' : 'Cancel'}
              </button>

              {!isLocked && (
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 shadow-md shadow-cyan-600/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Locking Feedback...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="h-3.5 w-3.5" />
                      <span>Lock & Submit Evaluation</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};
