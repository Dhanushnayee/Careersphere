import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  Search,
  Code,
  Award,
  Clock,
  Play,
  RotateCw,
  Plus,
  HelpCircle,
  AlertTriangle,
  Layers,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { CandidateProfile, AssessmentAttempt } from '../../types';
import { apiClient } from '../../services/api';

interface LearnAndPracticeWorkspaceProps {
  profile: CandidateProfile | null;
  initialTab?: 'dashboard' | 'resources' | 'quizzes' | 'coding' | 'plans';
  onTabChange?: (tab: string) => void;
}

export const LearnAndPracticeWorkspace: React.FC<LearnAndPracticeWorkspaceProps> = ({
  profile,
  initialTab = 'dashboard',
  onTabChange,
}) => {
  const normalizeTab = (t: string): 'dashboard' | 'resources' | 'quizzes' | 'coding' => {
    if (t === 'plans') return 'dashboard';
    if (t === 'resources' || t === 'quizzes' || t === 'coding') return t;
    return 'dashboard';
  };

  const [activeTab, setActiveTab] = useState<'dashboard' | 'resources' | 'quizzes' | 'coding'>(
    normalizeTab(initialTab)
  );

  useEffect(() => {
    if (initialTab) {
      const normalized = normalizeTab(initialTab);
      if (normalized !== activeTab) {
        setActiveTab(normalized);
      }
    }
  }, [initialTab]);

  const handleSelectTab = (tab: 'dashboard' | 'resources' | 'quizzes' | 'coding') => {
    setActiveTab(tab);
    onTabChange?.(tab);
  };

  // Resources state
  const [resources, setResources] = useState<any[]>([]);
  const [resourceCategory, setResourceCategory] = useState<string>('All');
  const [resourceLevel, setResourceLevel] = useState<string>('All');
  const [searchResource, setSearchResource] = useState('');
  const [loadingResources, setLoadingResources] = useState(false);

  // Learning plans state
  const [plans, setPlans] = useState<any[]>([]);
  const [showNewPlanModal, setShowNewPlanModal] = useState(false);
  const [newPlanTitle, setNewPlanTitle] = useState('');
  const [newPlanRole, setNewPlanRole] = useState(profile?.targetRole || 'Senior Python Architect');

  // Quizzes & Assessments state
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [attempts, setAttempts] = useState<AssessmentAttempt[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<any | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [quizResult, setQuizResult] = useState<any | null>(null);
  const [submittingQuiz, setSubmittingQuiz] = useState(false);

  // Coding Practice state
  const [challenges, setChallenges] = useState<any[]>([]);
  const [activeChallengeId, setActiveChallengeId] = useState<string>('');
  const [codeLanguage, setCodeLanguage] = useState<'python' | 'javascript'>('python');
  const [codeContent, setCodeContent] = useState<string>('');
  const [runningCode, setRunningCode] = useState(false);
  const [codeSubmissionResult, setCodeSubmissionResult] = useState<any | null>(null);

  useEffect(() => {
    loadResources();
    loadPlans();
    loadQuizzes();
    loadCodingChallenges();
  }, []);

  const loadResources = async () => {
    setLoadingResources(true);
    try {
      const data = await apiClient.getLearningResources();
      setResources(data);
    } catch (err) {
      console.warn('Failed to load learning resources:', err);
    } finally {
      setLoadingResources(false);
    }
  };

  const loadPlans = async () => {
    try {
      const list = await apiClient.getLearningPlans();
      setPlans(list);
    } catch (err) {
      console.warn('Failed to load learning plans:', err);
    }
  };

  const loadQuizzes = async () => {
    try {
      const data = await apiClient.getAssessmentQuizzes();
      setQuizzes(data.quizzes || []);
      setAttempts(data.attempts || []);
    } catch (err) {
      console.warn('Failed to load quizzes:', err);
    }
  };

  const loadCodingChallenges = async () => {
    try {
      const list = await apiClient.getCodingChallenges();
      setChallenges(list);
      if (list.length > 0 && !activeChallengeId) {
        setActiveChallengeId(list[0].id);
        setCodeContent(list[0].starterCodePython);
      }
    } catch (err) {
      console.warn('Failed to load coding challenges:', err);
    }
  };

  const handleToggleBookmark = async (id: string) => {
    try {
      const updated = await apiClient.bookmarkLearningResource(id);
      setResources((prev) => prev.map((r) => (r.id === id ? { ...r, isBookmarked: updated.isBookmarked } : r)));
    } catch (err) {
      console.warn('Failed to bookmark resource:', err);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const updated = await apiClient.updateResourceStatus(id, status);
      setResources((prev) => prev.map((r) => (r.id === id ? { ...r, status: updated.status } : r)));
    } catch (err) {
      console.warn('Failed to update resource status:', err);
    }
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlanTitle.trim()) return;
    try {
      const created = await apiClient.createLearningPlan({
        title: newPlanTitle.trim(),
        targetRole: newPlanRole,
        milestones: [
          { title: 'Foundations & Architectural Patterns', completed: false },
          { title: 'Hands-on Implementation with Verified Tests', completed: false },
          { title: 'Mock Interview Review & Assessment Retake', completed: false },
        ],
      });
      setPlans((prev) => [created, ...prev]);
      setShowNewPlanModal(false);
      setNewPlanTitle('');
    } catch (err) {
      console.warn('Failed to create learning plan:', err);
    }
  };

  const handleTogglePlanMilestone = async (planId: string, mIdx: number) => {
    try {
      const updated = await apiClient.togglePlanMilestone(planId, mIdx);
      setPlans((prev) => prev.map((p) => (p.id === planId ? updated : p)));
    } catch (err) {
      console.warn('Failed to toggle plan milestone:', err);
    }
  };

  const handleStartQuiz = (quiz: any) => {
    setActiveQuiz(quiz);
    setQuizAnswers(new Array(quiz.questions.length).fill(-1));
    setQuizResult(null);
  };

  const handleSelectQuizAnswer = (qIdx: number, optIdx: number) => {
    setQuizAnswers((prev) => {
      const next = [...prev];
      next[qIdx] = optIdx;
      return next;
    });
  };

  const handleSubmitQuiz = async () => {
    if (!activeQuiz) return;
    setSubmittingQuiz(true);
    try {
      const res = await apiClient.submitAssessment({
        quizId: activeQuiz.id,
        answers: quizAnswers,
      });
      setQuizResult(res);
      setAttempts((prev) => [res.attempt, ...prev]);
    } catch (err) {
      console.warn('Failed to submit quiz:', err);
    } finally {
      setSubmittingQuiz(false);
    }
  };

  const handleSelectChallenge = (c: any) => {
    setActiveChallengeId(c.id);
    setCodeContent(codeLanguage === 'python' ? c.starterCodePython : c.starterCodeJs);
    setCodeSubmissionResult(null);
  };

  const handleRunCode = async () => {
    if (!activeChallengeId) return;
    setRunningCode(true);
    try {
      const res = await apiClient.submitCodingChallenge(activeChallengeId, codeContent, codeLanguage);
      setCodeSubmissionResult(res);
    } catch (err) {
      console.warn('Failed to run code:', err);
    } finally {
      setRunningCode(false);
    }
  };

  // Filtered resources
  const filteredResources = resources.filter((r) => {
    const matchCat = resourceCategory === 'All' || r.skillCategory.toLowerCase().includes(resourceCategory.toLowerCase());
    const matchLvl = resourceLevel === 'All' || r.level.toLowerCase() === resourceLevel.toLowerCase();
    const matchSearch =
      !searchResource ||
      r.title.toLowerCase().includes(searchResource.toLowerCase()) ||
      r.skillCategory.toLowerCase().includes(searchResource.toLowerCase());
    return matchCat && matchLvl && matchSearch;
  });

  const completedActivities = resources.filter((r) => r.status === 'completed').length;
  const inProgressActivities = resources.filter((r) => r.status === 'in_progress').length;
  const avgQuizScore = attempts.length > 0 ? Math.round(attempts.reduce((acc, a) => acc + a.scorePct, 0) / attempts.length) : 85;

  const currentChallenge = challenges.find((c) => c.id === activeChallengeId) || challenges[0];

  return (
    <div className="space-y-6 text-left">
      {/* Top Header */}
      <div className="p-5 sm:p-6 rounded-2xl border border-indigo-900/60 bg-gradient-to-r from-slate-950 via-indigo-950/40 to-slate-950 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600/30 text-indigo-400 border border-indigo-500/40">
              <BookOpen className="h-4.5 w-4.5" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Learn & Practice Center
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Close verified skill gaps with authorized learning documentation, interactive server-evaluated quizzes, and sandboxed coding challenges.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 self-start md:self-auto shrink-0">
          <button
            onClick={() => handleSelectTab('dashboard')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'dashboard' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Dashboard</span>
          </button>
          <button
            onClick={() => handleSelectTab('resources')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'resources' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Resources</span>
          </button>
          <button
            onClick={() => handleSelectTab('quizzes')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'quizzes' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Award className="h-3.5 w-3.5" />
            <span>Quizzes</span>
          </button>
          <button
            onClick={() => handleSelectTab('coding')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'coding' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Code className="h-3.5 w-3.5" />
            <span>Coding Practice</span>
          </button>
        </div>
      </div>

      {/* =====================================================================
          TAB 1: LEARNING DASHBOARD & ACTIVE PLANS
         ===================================================================== */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Diagnostic Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-1">
              <div className="text-xs font-medium text-slate-400 flex items-center justify-between">
                <span>In-Progress Activities</span>
                <Clock className="h-4 w-4 text-indigo-400" />
              </div>
              <div className="text-2xl font-bold font-mono text-white">{inProgressActivities}</div>
              <div className="text-[11px] text-slate-500">Currently being studied</div>
            </div>

            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-1">
              <div className="text-xs font-medium text-slate-400 flex items-center justify-between">
                <span>Completed Topics</span>
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold font-mono text-emerald-400">{completedActivities}</div>
              <div className="text-[11px] text-slate-500">Verified module completions</div>
            </div>

            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-1">
              <div className="text-xs font-medium text-slate-400 flex items-center justify-between">
                <span>Average Quiz Score</span>
                <Award className="h-4 w-4 text-cyan-400" />
              </div>
              <div className="text-2xl font-bold font-mono text-cyan-400">{avgQuizScore}%</div>
              <div className="text-[11px] text-slate-500">Across {attempts.length} evaluations</div>
            </div>

            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-1">
              <div className="text-xs font-medium text-slate-400 flex items-center justify-between">
                <span>Active Learning Plans</span>
                <Layers className="h-4 w-4 text-purple-400" />
              </div>
              <div className="text-2xl font-bold font-mono text-white">{plans.length}</div>
              <div className="text-[11px] text-slate-500">Milestone tracked plans</div>
            </div>
          </div>

          {/* Active Learning Plans Section */}
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Layers className="h-4 w-4 text-indigo-400" />
                  <span>My Custom Learning Plans</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Track weekly competencies and milestone progress toward your target role.
                </p>
              </div>
              <button
                onClick={() => setShowNewPlanModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-sm transition-colors cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>New Plan</span>
              </button>
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {plans.map((p) => (
                <div key={p.id} className="p-5 rounded-xl border border-slate-800 bg-slate-950/70 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white">{p.title}</span>
                    <span className="font-mono text-emerald-400 font-bold">{p.progressPct}% Done</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full"
                      style={{ width: `${p.progressPct}%` }}
                    />
                  </div>
                  <div className="space-y-1.5 pt-1">
                    {p.milestones?.map((m: any, mIdx: number) => (
                      <div
                        key={mIdx}
                        onClick={() => handleTogglePlanMilestone(p.id, mIdx)}
                        className="flex items-center gap-2 text-xs text-slate-300 hover:text-white cursor-pointer select-none"
                      >
                        <div
                          className={`h-4 w-4 rounded flex items-center justify-center border text-[10px] shrink-0 ${
                            m.completed
                              ? 'bg-emerald-600 border-emerald-500 text-white'
                              : 'border-slate-700 bg-slate-900'
                          }`}
                        >
                          {m.completed && '✓'}
                        </div>
                        <span className={m.completed ? 'line-through text-slate-500' : ''}>{m.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Quiz History */}
          {attempts.length > 0 && (
            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Award className="h-4 w-4 text-emerald-400" />
                <span>Recent Assessment Attempts</span>
              </h3>
              <div className="overflow-x-auto google-photos-scrollbar">
                <table className="w-full text-left text-xs min-w-[500px]">
                  <thead className="border-b border-slate-800 text-slate-400 font-medium">
                    <tr>
                      <th className="py-2 px-3">Assessment Title</th>
                      <th className="py-2 px-3">Category</th>
                      <th className="py-2 px-3">Score</th>
                      <th className="py-2 px-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {attempts.slice(0, 5).map((att) => (
                      <tr key={att.id} className="hover:bg-slate-800/40">
                        <td className="py-2.5 px-3 font-semibold text-white">{att.assessmentTitle}</td>
                        <td className="py-2.5 px-3 text-slate-400">{att.category}</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-emerald-400">{att.scorePct}%</td>
                        <td className="py-2.5 px-3 text-slate-400">{new Date(att.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =====================================================================
          TAB 2: RESOURCE LIBRARY
         ===================================================================== */}
      {activeTab === 'resources' && (
        <div className="space-y-5">
          {/* Filter Bar */}
          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1">
                <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search resources by skill or topic (e.g. Python, PostgreSQL, Docker, React)..."
                  value={searchResource}
                  onChange={(e) => setSearchResource(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={resourceCategory}
                  onChange={(e) => setResourceCategory(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="All">All Categories</option>
                  <option value="Python">Python Core</option>
                  <option value="Databases">Databases (SQL)</option>
                  <option value="AI">AI & Machine Learning</option>
                  <option value="Cloud">Cloud & DevOps</option>
                  <option value="React">React & Frontend</option>
                  <option value="System Design">System Design</option>
                  <option value="Algorithms">Algorithms</option>
                </select>

                <select
                  value={resourceLevel}
                  onChange={(e) => setResourceLevel(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="All">All Levels</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            </div>
          </div>

          {/* Resources Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredResources.map((res) => (
              <div
                key={res.id}
                className="p-5 rounded-xl border border-slate-800 bg-slate-900/70 hover:border-slate-700 flex flex-col justify-between space-y-4 text-left transition-all"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-indigo-950/80 text-indigo-300 border border-indigo-800/60">
                      {res.skillCategory}
                    </span>
                    <button
                      onClick={() => handleToggleBookmark(res.id)}
                      className="text-slate-400 hover:text-indigo-400 cursor-pointer"
                      title={res.isBookmarked ? 'Remove Bookmark' : 'Bookmark Resource'}
                    >
                      {res.isBookmarked ? (
                        <BookmarkCheck className="h-4 w-4 text-indigo-400" />
                      ) : (
                        <Bookmark className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  <h4 className="font-semibold text-xs text-white leading-snug">{res.title}</h4>
                  <div className="text-[11px] text-slate-400">Provider: {res.provider}</div>

                  <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
                    <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                      {res.level}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                      {res.durationHours} hrs
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/50">
                      {res.isFree ? 'Free Access' : 'Verified'}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  {/* Status toggle */}
                  <select
                    value={res.status || 'not_started'}
                    onChange={(e) => handleUpdateStatus(res.id, e.target.value)}
                    className="px-2 py-1 rounded bg-slate-950 border border-slate-800 text-[11px] text-slate-300 focus:outline-none cursor-pointer"
                  >
                    <option value="not_started">Not Started</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>

                  <a
                    href={res.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-[11px] font-semibold text-indigo-400 hover:text-white transition-colors"
                  >
                    <span>Official Guide</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 3: ASSESSMENTS & QUIZZES (SERVER-EVALUATED)
         ===================================================================== */}
      {activeTab === 'quizzes' && (
        <div className="space-y-6">
          {!activeQuiz ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quizzes.map((quiz) => (
                <div key={quiz.id} className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-cyan-950/80 text-cyan-300 border border-cyan-800">
                      {quiz.category}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {quiz.questions?.length || 3} Questions
                    </span>
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white">{quiz.title}</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Server-evaluated technical assessment with detailed explanation breakdown upon submission.
                    </p>
                  </div>
                  <button
                    onClick={() => handleStartQuiz(quiz)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md transition-colors cursor-pointer"
                  >
                    <Play className="h-3.5 w-3.5" />
                    <span>Start Assessment</span>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            /* Active Quiz Player */
            <div className="p-6 rounded-2xl border border-indigo-900/60 bg-slate-900/90 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <span className="text-xs font-mono text-indigo-400 font-bold uppercase tracking-wider">
                    {activeQuiz.category}
                  </span>
                  <h3 className="text-lg font-bold text-white">{activeQuiz.title}</h3>
                </div>
                <button
                  onClick={() => setActiveQuiz(null)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 cursor-pointer"
                >
                  Back to All Quizzes
                </button>
              </div>

              {/* Questions List */}
              <div className="space-y-6">
                {activeQuiz.questions.map((q: any, qIdx: number) => (
                  <div key={q.id} className="p-5 rounded-xl border border-slate-800 bg-slate-950/70 space-y-3">
                    <div className="font-semibold text-xs text-white">
                      Q{qIdx + 1}: {q.question}
                    </div>

                    <div className="space-y-2">
                      {q.options.map((opt: string, optIdx: number) => {
                        const isSelected = quizAnswers[qIdx] === optIdx;
                        return (
                          <div
                            key={optIdx}
                            onClick={() => !quizResult && handleSelectQuizAnswer(qIdx, optIdx)}
                            className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-center gap-3 ${
                              isSelected
                                ? 'border-indigo-500 bg-indigo-950/60 text-white font-medium'
                                : 'border-slate-800/80 bg-slate-900/50 hover:bg-slate-800/40 text-slate-300'
                            }`}
                          >
                            <div
                              className={`h-4 w-4 rounded-full flex items-center justify-center border text-[10px] shrink-0 ${
                                isSelected
                                  ? 'border-indigo-400 bg-indigo-600 text-white'
                                  : 'border-slate-700 bg-slate-950'
                              }`}
                            >
                              {isSelected && '•'}
                            </div>
                            <span>{opt}</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanations shown after server evaluation */}
                    {quizResult && quizResult.questionsWithAnswers && (
                      <div className="p-3.5 rounded-lg border border-slate-800 bg-slate-900/90 text-xs space-y-1">
                        <div className="font-semibold text-emerald-400">
                          {quizResult.questionsWithAnswers[qIdx]?.isCorrect ? '✓ Correct Answer' : '✗ Incorrect'}
                        </div>
                        <p className="text-slate-300">{q.explanation}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Submission / Results Bar */}
              {!quizResult ? (
                <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                  <span className="text-xs text-slate-400">
                    Answered: {quizAnswers.filter((a) => a !== -1).length} of {activeQuiz.questions.length} questions
                  </span>
                  <button
                    onClick={handleSubmitQuiz}
                    disabled={submittingQuiz || quizAnswers.some((a) => a === -1)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 shadow-md transition-colors cursor-pointer"
                  >
                    {submittingQuiz ? <RotateCw className="h-4 w-4 animate-spin" /> : <Award className="h-4 w-4" />}
                    <span>{submittingQuiz ? 'Evaluating on Server...' : 'Submit Answers'}</span>
                  </button>
                </div>
              ) : (
                <div className="p-5 rounded-xl border border-emerald-800/80 bg-emerald-950/40 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-bold text-white">Assessment Results Verified</h4>
                    <p className="text-xs text-slate-300">
                      Score: <span className="font-mono font-bold text-emerald-400 text-sm">{quizResult.attempt?.scorePct}%</span> ({quizResult.attempt?.correctCount}/{activeQuiz.questions.length} correct)
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setQuizAnswers(new Array(activeQuiz.questions.length).fill(-1));
                      setQuizResult(null);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-sm cursor-pointer"
                  >
                    Retake Assessment
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* =====================================================================
          TAB 4: CODING PRACTICE (SANDBOXED EVALUATION)
         ===================================================================== */}
      {activeTab === 'coding' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-[680px]">
          {/* Challenges List */}
          <div className="lg:col-span-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-3 h-full overflow-y-auto google-photos-scrollbar">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Curated Challenges ({challenges.length})
            </span>
            <div className="space-y-2">
              {challenges.map((c) => (
                <div
                  key={c.id}
                  onClick={() => handleSelectChallenge(c)}
                  className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all space-y-1.5 ${
                    activeChallengeId === c.id
                      ? 'border-indigo-500/80 bg-indigo-950/40 text-white'
                      : 'border-slate-800/80 bg-slate-950/50 hover:bg-slate-800/40 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs truncate">{c.title}</span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                        c.difficulty === 'Easy'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/50'
                          : 'bg-amber-950 text-amber-400 border border-amber-800/50'
                      }`}
                    >
                      {c.difficulty}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">{c.category}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Code Editor & Test Runner */}
          <div className="lg:col-span-8 rounded-2xl border border-slate-800 bg-slate-900/60 flex flex-col justify-between h-full overflow-hidden">
            {/* Editor Header */}
            <div className="p-3.5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between gap-3 shrink-0">
              <div>
                <h4 className="font-bold text-xs text-white">{currentChallenge?.title}</h4>
                <div className="text-[11px] text-slate-400">{currentChallenge?.difficulty} · {currentChallenge?.category}</div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setCodeLanguage('python');
                    setCodeContent(currentChallenge?.starterCodePython);
                  }}
                  className={`px-2.5 py-1 rounded text-xs font-mono font-semibold transition-colors cursor-pointer ${
                    codeLanguage === 'python' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  Python
                </button>
                <button
                  onClick={() => {
                    setCodeLanguage('javascript');
                    setCodeContent(currentChallenge?.starterCodeJs);
                  }}
                  className={`px-2.5 py-1 rounded text-xs font-mono font-semibold transition-colors cursor-pointer ${
                    codeLanguage === 'javascript' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  JavaScript
                </button>
              </div>
            </div>

            {/* Problem Description & Code Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 google-photos-scrollbar">
              <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60 text-xs text-slate-300 whitespace-pre-line leading-relaxed">
                {currentChallenge?.description}
              </div>

              {/* Code Input */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>Solution Code ({codeLanguage})</span>
                  <span>O(n) Target Complexity</span>
                </div>
                <textarea
                  value={codeContent}
                  onChange={(e) => setCodeContent(e.target.value)}
                  rows={10}
                  className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-300 focus:outline-none focus:border-indigo-500 leading-relaxed"
                />
              </div>

              {/* Test Cases Results */}
              {codeSubmissionResult && (
                <div className="p-4 rounded-xl border border-emerald-800/80 bg-emerald-950/40 text-xs space-y-2 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>{codeSubmissionResult.message}</span>
                    </span>
                    <span className="font-mono text-emerald-400 font-bold">
                      {codeSubmissionResult.data?.score}% Pass Rate
                    </span>
                  </div>
                  <div className="space-y-1 text-[11px] font-mono text-slate-300">
                    {codeSubmissionResult.data?.testResults?.map((tr: any) => (
                      <div key={tr.testCaseIndex} className="p-2 rounded bg-slate-950/70 border border-emerald-900/40 flex items-center justify-between">
                        <span>Test Case {tr.testCaseIndex}: {tr.input}</span>
                        <span className="text-emerald-400 font-bold">Passed ({tr.runtimeMs}ms)</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Runner */}
            <div className="p-3.5 border-t border-slate-800 bg-slate-950 flex items-center justify-between shrink-0">
              <span className="text-xs text-slate-500">
                Sandboxed evaluation verifies correctness against edge-case inputs.
              </span>
              <button
                onClick={handleRunCode}
                disabled={runningCode}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 shadow-md transition-colors cursor-pointer"
              >
                {runningCode ? <RotateCw className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
                <span>{runningCode ? 'Evaluating...' : 'Run Tests & Submit'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Plan Modal */}
      {showNewPlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">Create Custom Learning Plan</h3>
            <form onSubmit={handleCreatePlan} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Plan Title</label>
                <input
                  type="text"
                  placeholder="e.g. FastAPI & Distributed Systems Mastery"
                  value={newPlanTitle}
                  onChange={(e) => setNewPlanTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Target Role</label>
                <input
                  type="text"
                  value={newPlanRole}
                  onChange={(e) => setNewPlanRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewPlanModal(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newPlanTitle.trim()}
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 shadow-md cursor-pointer"
                >
                  Create Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
