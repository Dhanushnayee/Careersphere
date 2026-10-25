import React, { useState, useEffect } from 'react';
import { Application } from '../../types';
import { apiClient } from '../../services/api';
import {
  Calendar,
  Video,
  Sparkles,
  Send,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  BookOpen,
  Award,
  Clock,
  ExternalLink,
  Loader2,
  ChevronRight,
  MessageSquare,
  Bell,
  Plus,
  CalendarCheck,
  AlertCircle,
  X,
  Check,
} from 'lucide-react';

export type InterviewWorkspaceTab = 'calendar' | 'mock' | 'bank' | 'reminders';

interface ScheduledInterviewItem {
  id: string;
  applicationId?: string;
  jobTitle: string;
  companyName: string;
  roundType: string;
  scheduledTime: string;
  meetingUrl: string;
  status: 'confirmed' | 'reschedule_requested';
  rescheduleReason?: string;
  rescheduleRequestedDate?: string;
  remindersEnabled: boolean;
}

interface AiMockInterviewWorkspaceProps {
  applications: Application[];
  initialTab?: InterviewWorkspaceTab | string;
  onTabChange?: (tab: InterviewWorkspaceTab) => void;
}

export const AiMockInterviewWorkspace: React.FC<AiMockInterviewWorkspaceProps> = ({
  applications,
  initialTab = 'calendar',
  onTabChange,
}) => {
  const normalizeTab = (t: string): InterviewWorkspaceTab => {
    if (t === 'calendar' || t === 'mock' || t === 'bank' || t === 'reminders') return t;
    return 'calendar';
  };

  const [activeTab, setActiveTab] = useState<InterviewWorkspaceTab>(normalizeTab(initialTab));

  useEffect(() => {
    if (initialTab) {
      const norm = normalizeTab(initialTab);
      if (norm !== activeTab) {
        setActiveTab(norm);
      }
    }
  }, [initialTab]);

  const handleTabClick = (tab: InterviewWorkspaceTab) => {
    setActiveTab(tab);
    onTabChange?.(tab);
  };

  // Mock Interview State
  const [topic, setTopic] = useState<'Python' | 'SQL' | 'DSA' | 'Behavioral'>('Python');
  const [selectedQuestion, setSelectedQuestion] = useState(
    'Explain how Python handles concurrency under the Global Interpreter Lock (GIL) and when you should choose asyncio vs multiprocessing.'
  );
  const [candidateAnswer, setCandidateAnswer] = useState('');
  const [evaluating, setEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<any | null>(null);

  // Question Bank State
  const [questionBank, setQuestionBank] = useState<Record<string, string[]>>({});
  const [loadingBank, setLoadingBank] = useState(false);

  // Scheduled Interviews State
  const [interviewList, setInterviewList] = useState<ScheduledInterviewItem[]>([
    {
      id: 'int_01',
      applicationId: applications.find((a) => a.stage === 'Interview Scheduled')?.id || 'app_01',
      jobTitle: 'Senior Python & Systems Architect',
      companyName: 'Synthetix Dynamics',
      roundType: 'Technical Screen & System Architecture Round',
      scheduledTime: 'Friday, 2:00 PM PST',
      meetingUrl: 'https://meet.google.com/xyz-careersphere-demo',
      status: 'confirmed',
      remindersEnabled: true,
    },
    {
      id: 'int_02',
      jobTitle: 'Distributed Systems Staff Engineer',
      companyName: 'ScaleGrid Systems',
      roundType: 'Behavioral & Leadership Screen',
      scheduledTime: 'Next Tuesday, 10:30 AM PST',
      meetingUrl: 'https://meet.google.com/abc-careersphere-demo',
      status: 'confirmed',
      remindersEnabled: true,
    },
  ]);

  // Reschedule Modal State
  const [rescheduleTarget, setRescheduleTarget] = useState<ScheduledInterviewItem | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState('2026-10-24');
  const [rescheduleTime, setRescheduleTime] = useState('14:00');
  const [rescheduleReason, setRescheduleReason] = useState('Conflict with critical production deployment');

  // Schedule New Session Modal State
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [newTitle, setNewTitle] = useState('Senior Full-Stack AI Engineer');
  const [newCompany, setNewCompany] = useState('Veloce Automations');
  const [newRound, setNewRound] = useState('Mock Technical Screen');
  const [newDate, setNewDate] = useState('2026-10-22');
  const [newTime, setNewTime] = useState('11:00');

  // Feedback Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Preparation Checklist State
  const [checklist, setChecklist] = useState<Record<string, boolean>>({
    'Review system architecture & microservices notes': true,
    'Prepare 2 STAR method behavioral examples': true,
    'Test microphone and webcam setup': true,
    'Review Synthetix Dynamics job requirements': false,
  });

  const handleToggleReminder = (id: string) => {
    setInterviewList((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const next = !item.remindersEnabled;
          showToast(next ? `Reminder activated for ${item.companyName} interview.` : `Reminder disabled.`);
          return { ...item, remindersEnabled: next };
        }
        return item;
      })
    );
  };

  const handleOpenReschedule = (item: ScheduledInterviewItem) => {
    setRescheduleTarget(item);
  };

  const handleConfirmReschedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleTarget) return;

    setInterviewList((prev) =>
      prev.map((item) => {
        if (item.id === rescheduleTarget.id) {
          return {
            ...item,
            status: 'reschedule_requested',
            rescheduleRequestedDate: `${rescheduleDate} at ${rescheduleTime}`,
            rescheduleReason: rescheduleReason.trim(),
          };
        }
        return item;
      })
    );

    showToast(`Reschedule request sent to ${rescheduleTarget.companyName} recruiting team.`);
    setRescheduleTarget(null);
  };

  const handleCreateNewSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newCompany.trim()) return;

    const newItem: ScheduledInterviewItem = {
      id: `int_${Date.now()}`,
      jobTitle: newTitle.trim(),
      companyName: newCompany.trim(),
      roundType: newRound,
      scheduledTime: `${newDate} at ${newTime}`,
      meetingUrl: 'https://meet.google.com/cs-custom-mock',
      status: 'confirmed',
      remindersEnabled: true,
    };

    setInterviewList((prev) => [newItem, ...prev]);
    setShowScheduleModal(false);
    showToast(`New interview session scheduled with ${newCompany}!`);
  };

  useEffect(() => {
    async function loadBank() {
      setLoadingBank(true);
      try {
        const bank = await apiClient.getInterviewQuestions();
        if (bank && Object.keys(bank).length > 0) {
          setQuestionBank(bank);
        }
      } catch (err) {
        console.warn('Questions bank fallback:', err);
      } finally {
        setLoadingBank(false);
      }
    }
    loadBank();
  }, []);

  const handleSelectQuestion = (q: string, cat: any) => {
    setSelectedQuestion(q);
    setTopic(cat);
    setEvaluationResult(null);
    setCandidateAnswer('');
    setActiveTab('mock');
  };

  const handleEvaluateAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidateAnswer.trim()) return;
    setEvaluating(true);
    try {
      const res = await apiClient.evaluateMockInterviewAnswer({
        question: selectedQuestion,
        candidateAnswer,
        topic,
      });
      setEvaluationResult(res);
    } catch (err: any) {
      console.error('Answer evaluation failed:', err);
    } finally {
      setEvaluating(false);
    }
  };

  const toggleChecklistItem = (item: string) => {
    setChecklist((prev) => ({ ...prev, [item]: !prev[item] }));
  };

  return (
    <div className="space-y-6 text-left">
      {/* Workspace Header */}
      <div className="p-6 rounded-2xl border border-indigo-900/60 bg-gradient-to-r from-indigo-950/60 via-slate-900 to-slate-950 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-indigo-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
              Interview Preparation Command
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
            AI Mock Interviewer & Scheduling Center
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed mt-1">
            Simulate real technical and behavioral interview screens with turn-by-turn evaluations from Gemini 3.8 Flash, and track scheduled recruiter screens.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowScheduleModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-md transition-colors cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Schedule Session</span>
          </button>
          <span className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-400">
            {interviewList.length} Sessions Active
          </span>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-3.5 rounded-xl border border-indigo-500/60 bg-indigo-950/80 text-white text-xs flex items-center justify-between gap-3 shadow-lg animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => handleTabClick('calendar')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'calendar'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
          }`}
        >
          <Calendar className="h-3.5 w-3.5 text-purple-400" />
          <span>Schedule & Calendar ({interviewList.length})</span>
        </button>

        <button
          onClick={() => handleTabClick('mock')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'mock'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
          }`}
        >
          <MessageSquare className="h-3.5 w-3.5" />
          <span>Interactive AI Mock Interview</span>
        </button>

        <button
          onClick={() => handleTabClick('bank')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'bank'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
          }`}
        >
          <BookOpen className="h-3.5 w-3.5 text-cyan-400" />
          <span>Question Bank</span>
        </button>

        <button
          onClick={() => handleTabClick('reminders')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'reminders'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
          }`}
        >
          <Bell className="h-3.5 w-3.5 text-amber-400" />
          <span>Interview Reminders & Sync</span>
        </button>
      </div>

      {/* =====================================================================
          TAB 1: AI MOCK INTERVIEW INTERACTIVE
         ===================================================================== */}
      {activeTab === 'mock' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-indigo-400 bg-indigo-950/80 px-2.5 py-0.5 rounded border border-indigo-800/60 font-semibold uppercase">
                  {topic} Screen
                </span>
                <span className="text-xs text-slate-400">
                  Simulated Real Interview Question
                </span>
              </div>
              <button
                onClick={() => setActiveTab('bank')}
                className="text-xs text-indigo-400 hover:text-white underline cursor-pointer"
              >
                Change Question
              </button>
            </div>

            <div className="p-4 rounded-xl border border-indigo-900/60 bg-indigo-950/20 text-white font-medium text-sm leading-relaxed">
              "{selectedQuestion}"
            </div>

            <form onSubmit={handleEvaluateAnswer} className="space-y-3">
              <label className="block text-xs font-medium text-slate-400">
                Your Answer (Explain concepts clearly; for behavioral questions use Situation, Task, Action, Result):
              </label>
              <textarea
                rows={5}
                value={candidateAnswer}
                onChange={(e) => setCandidateAnswer(e.target.value)}
                placeholder="Type your response here as you would speak it in an interview screen..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500 placeholder-slate-600 leading-relaxed"
              />

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-500 font-mono">
                  {candidateAnswer.split(/\s+/).filter(Boolean).length} words
                </span>

                <button
                  type="submit"
                  disabled={evaluating || candidateAnswer.trim().length < 5}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md transition-colors cursor-pointer disabled:opacity-50"
                >
                  {evaluating ? (
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                  ) : (
                    <Send className="h-4 w-4 text-white" />
                  )}
                  <span>{evaluating ? 'Analyzing with Gemini 3.8 Flash...' : 'Submit Answer for AI Evaluation'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Evaluation Results */}
          {evaluationResult && (
            <div className="p-5 rounded-2xl border border-emerald-900/60 bg-slate-900/80 space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    AI Interviewer Feedback & Evaluation
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xl font-bold font-mono text-emerald-400">
                    {evaluationResult.score}/100
                  </span>
                  <span className="text-[10px] text-slate-400 block">Assessment Score</span>
                </div>
              </div>

              {/* Strengths */}
              {evaluationResult.strengths && (
                <div className="space-y-1.5">
                  <div className="text-xs font-semibold text-emerald-400">Strong Points in Answer:</div>
                  <ul className="space-y-1 text-xs text-slate-300">
                    {evaluationResult.strengths.map((str: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-emerald-400 font-bold shrink-0">✓</span>
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Improvements */}
              {evaluationResult.improvements && (
                <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                  <div className="text-xs font-semibold text-amber-400">Key Gaps & Recommendations:</div>
                  <ul className="space-y-1 text-xs text-slate-300">
                    {evaluationResult.improvements.map((imp: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-amber-400 font-bold shrink-0">!</span>
                        <span>{imp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Model Answer Summary */}
              {evaluationResult.idealAnswerSummary && (
                <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950 space-y-1.5 text-xs">
                  <div className="font-semibold text-indigo-300">Ideal Benchmark Summary:</div>
                  <p className="text-slate-300 leading-relaxed">
                    {evaluationResult.idealAnswerSummary}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* =====================================================================
          TAB 2: QUESTION BANK
         ===================================================================== */}
      {activeTab === 'bank' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-cyan-400" />
                <span>Technical & Behavioral Question Bank</span>
              </h3>
              <p className="text-xs text-slate-400">
                Click any question to load it into the AI Mock Interview interactive simulator.
              </p>
            </div>

            <div className="space-y-4">
              {Object.entries(questionBank).map(([cat, questions]) => (
                <div key={cat} className="space-y-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                    {cat} Interview Questions
                  </div>
                  <div className="space-y-2">
                    {questions.map((q, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleSelectQuestion(q, cat)}
                        className="p-3 rounded-xl border border-slate-800 bg-slate-950 hover:border-indigo-600 hover:bg-slate-900/80 transition-all cursor-pointer flex items-center justify-between gap-3 text-xs"
                      >
                        <span className="text-slate-200">{q}</span>
                        <ChevronRight className="h-4 w-4 text-slate-500 shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 3: SCHEDULED INTERVIEWS & RESCHEDULING
         ===================================================================== */}
      {activeTab === 'calendar' && (
        <div className="space-y-6">
          {/* Scheduled Screen Cards */}
          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-purple-400" />
                  <span>Scheduled Recruiter & Technical Screens</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Track dates, join live authorized video rooms, request rescheduling, and manage reminders.
                </p>
              </div>

              <button
                onClick={() => setShowScheduleModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors cursor-pointer w-fit"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Scheduled Interview</span>
              </button>
            </div>

            {interviewList.length > 0 ? (
              <div className="space-y-3">
                {interviewList.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl border border-indigo-900/60 bg-gradient-to-r from-indigo-950/40 via-slate-900/70 to-slate-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{item.jobTitle}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                            item.status === 'reschedule_requested'
                              ? 'bg-amber-950 text-amber-300 border-amber-800'
                              : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                          }`}
                        >
                          {item.status === 'reschedule_requested' ? 'Reschedule Requested' : 'Confirmed'}
                        </span>
                      </div>

                      <div className="text-slate-300">
                        {item.companyName} · <span className="text-slate-400">{item.roundType}</span>
                      </div>

                      <div className="text-indigo-300 font-mono flex items-center gap-1.5 pt-0.5">
                        <Clock className="h-3.5 w-3.5 text-indigo-400" />
                        <span>{item.scheduledTime}</span>
                        {item.status === 'reschedule_requested' && item.rescheduleRequestedDate && (
                          <span className="text-amber-400 text-[11px] ml-1">
                            (Proposed alternate: {item.rescheduleRequestedDate})
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => handleToggleReminder(item.id)}
                        className={`p-2 rounded-lg border transition-colors cursor-pointer flex items-center gap-1 ${
                          item.remindersEnabled
                            ? 'bg-amber-950/80 border-amber-700/60 text-amber-300'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                        title={item.remindersEnabled ? 'Reminder active' : 'Turn on reminder'}
                      >
                        <Bell className="h-3.5 w-3.5" />
                        <span className="text-[11px]">{item.remindersEnabled ? 'Reminder On' : 'Remind Me'}</span>
                      </button>

                      <button
                        onClick={() => handleOpenReschedule(item)}
                        className="px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
                      >
                        Request Reschedule
                      </button>

                      <a
                        href={item.meetingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md transition-colors"
                      >
                        <Video className="h-3.5 w-3.5" />
                        <span>Join Meeting</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">No scheduled interviews currently in progress.</p>
            )}
          </div>

          {/* Preparation Checklist */}
          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-3 text-xs">
            <h3 className="text-sm font-bold text-white">Pre-Interview Preparation Checklist</h3>
            <div className="space-y-2">
              {Object.entries(checklist).map(([item, checked]) => (
                <label key={item} className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleChecklistItem(item)}
                    className="rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                  />
                  <span className={checked ? 'line-through text-slate-500' : 'text-slate-200'}>
                    {item}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 4: INTERVIEW REMINDERS & CALENDAR SYNC
         ===================================================================== */}
      {activeTab === 'reminders' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Bell className="h-4 w-4 text-amber-400" />
                <span>Interview Reminders & Calendar Synchronization</span>
              </h3>
              <p className="text-xs text-slate-400">
                Configure automated multi-channel alert reminders (24 hours and 1 hour before scheduled screens) and sync with Google Calendar or Outlook.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 space-y-3">
                <div className="font-semibold text-white flex items-center gap-2">
                  <CalendarCheck className="h-4 w-4 text-emerald-400" />
                  <span>Calendar Integrations</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Export scheduled technical interviews to your personal calendar or sync via standard iCal (.ics) format.
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <a
                    href="https://calendar.google.com/calendar"
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium flex items-center gap-1.5 transition-colors"
                  >
                    <ExternalLink className="h-3 w-3" />
                    <span>Open Google Calendar</span>
                  </a>
                  <button
                    onClick={() => showToast('Calendar .ics invite exported successfully.')}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors cursor-pointer"
                  >
                    Download .ics File
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 space-y-3">
                <div className="font-semibold text-white flex items-center gap-2">
                  <Bell className="h-4 w-4 text-amber-400" />
                  <span>Reminder Channel Preferences</span>
                </div>
                <div className="space-y-2 text-slate-300 text-[11px]">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span>Email Reminder (24 hours prior)</span>
                    <input type="checkbox" defaultChecked className="rounded border-slate-700 bg-slate-800 text-indigo-600 h-4 w-4" />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer">
                    <span>Email & SMS Reminder (1 hour prior)</span>
                    <input type="checkbox" defaultChecked className="rounded border-slate-700 bg-slate-800 text-indigo-600 h-4 w-4" />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer">
                    <span>In-App Sound & Push Notification</span>
                    <input type="checkbox" defaultChecked className="rounded border-slate-700 bg-slate-800 text-indigo-600 h-4 w-4" />
                  </label>
                </div>
              </div>
            </div>

            {/* Active Reminder Schedule Table */}
            <div className="pt-2">
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Active Interview Alert Schedule
              </h4>
              <div className="space-y-2">
                {interviewList.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl border border-slate-800 bg-slate-950 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="font-semibold text-white">{item.companyName} — {item.jobTitle}</div>
                      <div className="text-[11px] text-slate-400">{item.scheduledTime}</div>
                    </div>
                    <button
                      onClick={() => handleToggleReminder(item.id)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                        item.remindersEnabled
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {item.remindersEnabled ? 'Alert Active' : 'Enable Alert'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          RESCHEDULE INTERVIEW MODAL
         ===================================================================== */}
      {rescheduleTarget && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 w-full max-w-md p-6 space-y-4 shadow-2xl text-left">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-indigo-400" />
                <h3 className="font-bold text-white text-sm">Request Interview Reschedule</h3>
              </div>
              <button
                onClick={() => setRescheduleTarget(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Target Position: <span className="text-white font-semibold">{rescheduleTarget.jobTitle}</span> at{' '}
              <span className="text-indigo-300 font-semibold">{rescheduleTarget.companyName}</span>
            </p>

            <form onSubmit={handleConfirmReschedule} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Proposed Alternate Date:</label>
                <input
                  type="date"
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Proposed Time Window:</label>
                <input
                  type="time"
                  value={rescheduleTime}
                  onChange={(e) => setRescheduleTime(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Reason for Rescheduling:</label>
                <textarea
                  rows={3}
                  value={rescheduleReason}
                  onChange={(e) => setRescheduleReason(e.target.value)}
                  placeholder="Provide brief context for the recruiting team..."
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setRescheduleTarget(null)}
                  className="px-3.5 py-2 rounded-lg text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md cursor-pointer"
                >
                  Send Reschedule Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          SCHEDULE NEW SESSION MODAL
         ===================================================================== */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 w-full max-w-md p-6 space-y-4 shadow-2xl text-left">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-emerald-400" />
                <h3 className="font-bold text-white text-sm">Schedule Interview / Mock Session</h3>
              </div>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNewSchedule} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Job Title / Target Role:</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Company / Organization:</label>
                <input
                  type="text"
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Round Type:</label>
                <select
                  value={newRound}
                  onChange={(e) => setNewRound(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="Technical Screen & Architecture">Technical Screen & Architecture</option>
                  <option value="System Design Round">System Design Round</option>
                  <option value="Live Coding Screen (Python/SQL)">Live Coding Screen (Python/SQL)</option>
                  <option value="Behavioral & STAR Leadership">Behavioral & STAR Leadership</option>
                  <option value="Hiring Manager Final Chat">Hiring Manager Final Chat</option>
                  <option value="AI Practice Mock Interview">AI Practice Mock Interview</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Date:</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Time:</label>
                  <input
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-3.5 py-2 rounded-lg text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md cursor-pointer"
                >
                  Confirm & Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
