/**
 * CareerSphere AI — Recruiter Interview Scheduling Wizard Modal
 * Phase 4: Full scheduling wizard with conflict detection, multi-round support, and override capabilities.
 */
import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { apiClient } from '../../services/api';
import { Application, Interview } from '../../types';
import {
  Calendar,
  Clock,
  Video,
  User,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  Shield,
  FileText,
  MapPin,
  HelpCircle,
} from 'lucide-react';

interface ScheduleInterviewWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  application?: Application | null;
  applications?: Application[];
  onSuccess: (interview: Interview) => void;
}

export const ScheduleInterviewWizardModal: React.FC<ScheduleInterviewWizardModalProps> = ({
  isOpen,
  onClose,
  application: initialApplication,
  applications = [],
  onSuccess,
}) => {
  const [selectedAppId, setSelectedAppId] = useState<string>(initialApplication?.id || '');
  const [roundName, setRoundName] = useState('Round 1: Technical & System Architecture Screen');
  const [roundNumber, setRoundNumber] = useState<number>(1);
  const [interviewType, setInterviewType] = useState<'video' | 'phone' | 'in_person' | 'technical_screen' | 'system_design' | 'behavioral' | 'final'>('video');
  const [date, setDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 2);
    return tomorrow.toISOString().split('T')[0];
  });
  const [startTime, setStartTime] = useState('14:00');
  const [durationMinutes, setDurationMinutes] = useState<number>(45);
  const [timezone, setTimezone] = useState('America/Los_Angeles');
  const [interviewerName, setInterviewerName] = useState('Sarah Jenkins (VP Talent)');
  const [interviewerEmail, setInterviewerEmail] = useState('sarah.jenkins@synthetix.com');
  const [meetingUrl, setMeetingUrl] = useState('https://meet.google.com/xyz-careersphere-demo');
  const [candidateInstructions, setCandidateInstructions] = useState(
    'Please join using the Google Meet link 5 minutes prior to start. Have a quiet room, stable internet connection, and your favorite IDE ready.'
  );
  const [internalNotes, setInternalNotes] = useState(
    'Assess distributed data pipelines, concurrency bottlenecks, and communication under ambiguity.'
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  useEffect(() => {
    if (initialApplication?.id) {
      setSelectedAppId(initialApplication.id);
    } else if (applications.length > 0 && !selectedAppId) {
      setSelectedAppId(applications[0].id);
    }
  }, [initialApplication, applications]);

  if (!isOpen) return null;

  const currentApp = applications.find((a) => a.id === selectedAppId) || initialApplication;

  const calculateEndAt = (startIso: string, duration: number) => {
    const d = new Date(startIso);
    d.setMinutes(d.getMinutes() + duration);
    return d.toISOString();
  };

  const handleSubmit = async (override = false) => {
    if (!selectedAppId) {
      setError('Please select a candidate application.');
      return;
    }

    setLoading(true);
    setError(null);
    setConflictWarning(null);

    try {
      const scheduledAt = new Date(`${date}T${startTime}:00Z`).toISOString();
      const endAt = calculateEndAt(scheduledAt, durationMinutes);

      const interviewers = [
        {
          id: 'int_usr_01',
          name: interviewerName.trim() || 'Hiring Lead',
          email: interviewerEmail.trim() || 'interviews@careersphere.ai',
          role: 'Primary Technical Interviewer',
        },
      ];

      const res = await apiClient.scheduleRecruiterInterview({
        applicationId: selectedAppId,
        roundName: roundName.trim(),
        roundNumber,
        scheduledAt,
        durationMinutes,
        timeZone: timezone,
        interviewType,
        meetingUrl: meetingUrl.trim(),
        candidateInstructions: candidateInstructions.trim(),
        internalNotes: internalNotes.trim(),
        interviewers,
        overrideConflict: override,
      });

      onSuccess(res.interview);
      onClose();
    } catch (err: any) {
      if (err?.conflict) {
        setConflictWarning(
          `Scheduling Conflict Detected: ${err.message || 'One or more participants have overlapping sessions at this time.'}`
        );
      } else {
        setError(err?.message || 'Failed to schedule interview. Please check the provided details.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Schedule Candidate Interview Wizard" maxWidth="max-w-2xl">
      <div className="space-y-5 text-left text-xs">
        {/* Top Guidance */}
        <div className="p-3.5 rounded-xl border border-indigo-900/40 bg-indigo-950/30 flex items-start gap-3">
          <Calendar className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <div className="font-semibold text-white">Production-Ready Interview Scheduling</div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Invitations automatically deliver RFC 5545 calendar invitations, notify candidates with safe instructions,
              and protect confidential internal notes from candidate visibility.
            </p>
          </div>
        </div>

        {/* Conflict Warning Banner */}
        {conflictWarning && (
          <div className="p-4 rounded-xl border border-amber-600/60 bg-amber-950/40 space-y-3 animate-fadeIn">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-amber-200">Calendar Conflict Warning</span>
                <p className="text-amber-300/90 text-xs mt-0.5">{conflictWarning}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => handleSubmit(true)}
                disabled={loading}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white transition-colors cursor-pointer"
              >
                {loading ? 'Overriding...' : 'Override & Schedule Anyway'}
              </button>
              <button
                type="button"
                onClick={() => setConflictWarning(null)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-800 transition-colors cursor-pointer"
              >
                Change Time
              </button>
            </div>
          </div>
        )}

        {/* Generic Error */}
        {error && (
          <div className="p-3 rounded-xl border border-rose-800/60 bg-rose-950/40 text-rose-300 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(false);
          }}
          className="space-y-4"
        >
          {/* Target Application Selector */}
          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Candidate Application <span className="text-rose-400">*</span>
            </label>
            {applications.length > 0 ? (
              <select
                value={selectedAppId}
                onChange={(e) => setSelectedAppId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-cyan-500 text-xs"
                required
              >
                {applications.map((app) => (
                  <option key={app.id} value={app.id}>
                    {app.candidateName || 'Candidate'} — {app.jobTitle} (Stage: {app.stage})
                  </option>
                ))}
              </select>
            ) : (
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white">
                {currentApp?.candidateName || 'Candidate'} — {currentApp?.jobTitle || 'Requisition'}
              </div>
            )}
          </div>

          {/* Round Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-slate-300 font-medium mb-1">
                Round Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={roundName}
                onChange={(e) => setRoundName(e.target.value)}
                placeholder="e.g. Round 2: Technical Deep Dive"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-cyan-500 text-xs"
                required
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Round Number</label>
              <input
                type="number"
                min={1}
                max={10}
                value={roundNumber}
                onChange={(e) => setRoundNumber(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-cyan-500 text-xs"
                required
              />
            </div>
          </div>

          {/* Type and Timezone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Interview Format</label>
              <select
                value={interviewType}
                onChange={(e) => setInterviewType(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-cyan-500 text-xs"
              >
                <option value="video">Google Meet / Video Call</option>
                <option value="phone">Phone Screen</option>
                <option value="in_person">On-site / In Person</option>
                <option value="technical_screen">Technical Coding Screen</option>
                <option value="system_design">System Architecture Design</option>
                <option value="behavioral">Behavioral & Values Alignment</option>
                <option value="final">Final Executive Debrief</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Timezone</label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-cyan-500 text-xs"
              >
                <option value="America/Los_Angeles">Pacific Time (US & Canada)</option>
                <option value="America/Denver">Mountain Time (US & Canada)</option>
                <option value="America/Chicago">Central Time (US & Canada)</option>
                <option value="America/New_York">Eastern Time (US & Canada)</option>
                <option value="Europe/London">London / GMT</option>
                <option value="Europe/Berlin">Central European Time (CET)</option>
                <option value="Asia/Kolkata">India Standard Time (IST)</option>
                <option value="UTC">Coordinated Universal Time (UTC)</option>
              </select>
            </div>
          </div>

          {/* Date, Time, Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Date <span className="text-rose-400">*</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-cyan-500 text-xs font-mono"
                required
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Start Time <span className="text-rose-400">*</span>
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-cyan-500 text-xs font-mono"
                required
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Duration</label>
              <select
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 45)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-cyan-500 text-xs"
              >
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>60 minutes (1 hour)</option>
                <option value={90}>90 minutes (1.5 hours)</option>
                <option value={120}>120 minutes (2 hours)</option>
              </select>
            </div>
          </div>

          {/* Interviewer Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Interviewer Name</label>
              <input
                type="text"
                value={interviewerName}
                onChange={(e) => setInterviewerName(e.target.value)}
                placeholder="e.g. Sarah Jenkins (VP Talent)"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-cyan-500 text-xs"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Interviewer Email</label>
              <input
                type="email"
                value={interviewerEmail}
                onChange={(e) => setInterviewerEmail(e.target.value)}
                placeholder="e.g. sarah.jenkins@synthetix.com"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-cyan-500 text-xs"
              />
            </div>
          </div>

          {/* Meeting URL */}
          <div>
            <label className="block text-slate-300 font-medium mb-1">Meeting Link or Location</label>
            <input
              type="text"
              value={meetingUrl}
              onChange={(e) => setMeetingUrl(e.target.value)}
              placeholder="https://meet.google.com/xyz-careersphere-demo"
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-cyan-500 text-xs font-mono"
            />
          </div>

          {/* Candidate-facing Instructions */}
          <div>
            <label className="block text-slate-300 font-medium mb-1 flex items-center justify-between">
              <span>Candidate-Facing Instructions (Disclosed to Candidate)</span>
              <span className="text-[10px] text-emerald-400 font-normal">Candidate Visible</span>
            </label>
            <textarea
              rows={2}
              value={candidateInstructions}
              onChange={(e) => setCandidateInstructions(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-xs"
            />
          </div>

          {/* Confidential Internal Notes */}
          <div>
            <label className="block text-slate-300 font-medium mb-1 flex items-center justify-between">
              <span>Confidential Internal Notes</span>
              <span className="text-[10px] text-rose-400 font-normal flex items-center gap-1">
                <Shield className="h-3 w-3" />
                Never Disclosed to Candidate
              </span>
            </label>
            <textarea
              rows={2}
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              placeholder="Internal focus areas, rubrics, and interviewer expectations..."
              className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-xs"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 shadow-md shadow-cyan-600/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Checking Schedules...</span>
                </>
              ) : (
                <>
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Schedule & Send Invitation</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
