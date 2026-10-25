/**
 * CareerSphere AI — Recruiter Interview Scheduling Modal
 * Phase 3 & 6 Recruiter Capability
 */
import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { apiClient } from '../../services/api';
import { Application, Interview } from '../../types';
import { Calendar, Video, User, Clock, Loader2, AlertCircle } from 'lucide-react';

interface ScheduleInterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: Application | null;
  onSuccess: (interview: Interview) => void;
}

export const ScheduleInterviewModal: React.FC<ScheduleInterviewModalProps> = ({
  isOpen,
  onClose,
  application,
  onSuccess,
}) => {
  const [interviewType, setInterviewType] = useState<'Technical Screen' | 'Hiring Manager' | 'System Design' | 'Executive'>('Technical Screen');
  const [date, setDate] = useState('2026-10-18');
  const [time, setTime] = useState('14:00');
  const [interviewerName, setInterviewerName] = useState('Sarah Jenkins (VP Talent)');
  const [meetingUrl, setMeetingUrl] = useState('https://meet.google.com/xyz-careersphere-demo');
  const [notes, setNotes] = useState('Review distributed systems architecture, API versioning, and state management.');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!application) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const scheduledAt = new Date(`${date}T${time}:00Z`).toISOString();
      const newInterview = await apiClient.scheduleInterview({
        applicationId: application.id,
        scheduledAt,
        interviewType,
        meetingUrl,
        interviewerName,
        notes,
      });

      onSuccess(newInterview);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to schedule interview.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Schedule Candidate Interview"
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-left text-xs">
        
        {/* Candidate Context */}
        <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/70 space-y-1">
          <div className="font-semibold text-white">
            {application.candidateName || 'Candidate'}
          </div>
          <div className="text-slate-400">
            Applying for: <span className="text-indigo-400 font-medium">{application.jobTitle}</span>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg border border-rose-900/40 bg-rose-950/20 text-rose-300 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Interview Type Selector */}
        <div>
          <label className="block text-slate-300 font-medium mb-1">Interview Round</label>
          <select
            value={interviewType}
            onChange={(e: any) => setInterviewType(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="Technical Screen">Technical Screen (1 hour)</option>
            <option value="System Design">System Design & Architecture (1.5 hours)</option>
            <option value="Hiring Manager">Hiring Manager Deep Dive (45 mins)</option>
            <option value="Executive">Executive Leadership Fit (30 mins)</option>
          </select>
        </div>

        {/* Date and Time Row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Date</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-slate-300 font-medium mb-1">Time (UTC)</label>
            <input
              type="time"
              required
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Interviewer Name */}
        <div>
          <label className="block text-slate-300 font-medium mb-1">Interviewer Name</label>
          <input
            type="text"
            required
            value={interviewerName}
            onChange={(e) => setInterviewerName(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Meeting URL */}
        <div>
          <label className="block text-slate-300 font-medium mb-1">Video Meeting URL (Google Meet / Zoom)</label>
          <input
            type="url"
            required
            value={meetingUrl}
            onChange={(e) => setMeetingUrl(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500 font-mono"
          />
        </div>

        {/* Agenda Notes */}
        <div>
          <label className="block text-slate-300 font-medium mb-1">Agenda & Prep Notes</label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-slate-400 hover:text-white cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 flex items-center gap-1.5 rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            <span>Confirm & Schedule Interview</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
