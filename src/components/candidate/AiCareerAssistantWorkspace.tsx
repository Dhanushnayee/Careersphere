import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Send,
  Plus,
  Trash2,
  Download,
  Copy,
  Check,
  RotateCw,
  MapPin,
  Briefcase,
  Layers,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Search,
  ChevronRight,
  BookOpen,
  Code,
  FileText,
  Target,
  ExternalLink,
  MessageSquare,
  Compass,
} from 'lucide-react';
import { CandidateProfile, ResumeDocument, Application, CareerRoadmap } from '../../types';
import { apiClient } from '../../services/api';

interface AiCareerAssistantWorkspaceProps {
  profile: CandidateProfile | null;
  primaryResume?: ResumeDocument;
  applications: Application[];
  scheduledInterviews?: any[];
  jobs?: any[];
  initialTab?: 'chat' | 'roadmap' | 'interview-prep';
  onNavigateTab?: (tab: string) => void;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isAiGenerated?: boolean;
}

interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  lastMessagePreview?: string;
  messageCount?: number;
}

export const AiCareerAssistantWorkspace: React.FC<AiCareerAssistantWorkspaceProps> = ({
  profile,
  primaryResume,
  applications,
  scheduledInterviews = [],
  jobs = [],
  initialTab = 'chat',
  onNavigateTab,
}) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'roadmap' | 'interview-prep'>(initialTab);

  useEffect(() => {
    if (initialTab && initialTab !== activeTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const handleSelectTab = (tab: 'chat' | 'roadmap' | 'interview-prep') => {
    setActiveTab(tab);
    onNavigateTab?.(tab);
  };
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [searchConvQuery, setSearchConvQuery] = useState('');
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);

  // Roadmap State
  const [roadmap, setRoadmap] = useState<CareerRoadmap | null>(null);
  const [generatingRoadmap, setGeneratingRoadmap] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConversations();
    loadRoadmap();
  }, []);

  useEffect(() => {
    if (activeConvId) {
      loadMessages(activeConvId);
    }
  }, [activeConvId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const loadConversations = async () => {
    setLoadingConversations(true);
    try {
      const list = await apiClient.getAiConversations();
      setConversations(list);
      if (list.length > 0 && !activeConvId) {
        setActiveConvId(list[0].id);
      }
    } catch (err) {
      console.warn('Failed to load conversations:', err);
    } finally {
      setLoadingConversations(false);
    }
  };

  const loadMessages = async (convId: string) => {
    try {
      const data = await apiClient.getAiConversationMessages(convId);
      setMessages(data.messages || []);
    } catch (err) {
      console.warn('Failed to load messages:', err);
    }
  };

  const loadRoadmap = async () => {
    try {
      const rm = await apiClient.generateCareerRoadmap(profile?.targetRole);
      setRoadmap(rm);
    } catch (err) {
      console.warn('Failed to load career roadmap:', err);
    }
  };

  const handleStartNewChat = async (promptText?: string) => {
    const text = promptText || 'What skills should I learn for my target role?';
    setSending(true);
    try {
      const res = await apiClient.createAiConversation(text);
      if (res.conversation) {
        setConversations((prev) => [res.conversation, ...prev]);
        setActiveConvId(res.conversation.id);
        setMessages(res.messages || []);
      }
    } catch (err) {
      console.warn('Failed to create conversation:', err);
    } finally {
      setSending(false);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = inputText.trim();
    if (!text || sending) return;

    if (!activeConvId) {
      await handleStartNewChat(text);
      setInputText('');
      return;
    }

    const optimisticMsg: Message = {
      id: `opt_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setInputText('');
    setSending(true);

    try {
      const res = await apiClient.sendAiMessage(activeConvId, text);
      if (res.assistantMessage) {
        setMessages((prev) => [...prev.filter((m) => m.id !== optimisticMsg.id), res.userMessage, res.assistantMessage]);
      }
      loadConversations();
    } catch (err) {
      console.warn('Failed to send message:', err);
    } finally {
      setSending(false);
    }
  };

  const handleDeleteConversation = async (convId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await apiClient.deleteAiConversation(convId);
      const remaining = conversations.filter((c) => c.id !== convId);
      setConversations(remaining);
      if (activeConvId === convId) {
        setActiveConvId(remaining.length > 0 ? remaining[0].id : '');
        setMessages([]);
      }
    } catch (err) {
      console.warn('Failed to delete conversation:', err);
    }
  };

  const handleExportConversation = () => {
    if (!activeConvId) return;
    const conv = conversations.find((c) => c.id === activeConvId);
    const content = `# CareerSphere AI — Career Guidance Transcript
Topic: ${conv?.title || 'Advisory Session'}
Date: ${new Date().toLocaleDateString()}

${messages.map((m) => `### ${m.role === 'assistant' ? '🤖 AI Career Copilot' : '👤 You'} (${new Date(m.timestamp).toLocaleTimeString()}):\n${m.content}\n`).join('\n---\n')}
`;
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `career-guidance-${activeConvId}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(id);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  const handleToggleRoadmapMilestone = async (mIdx: number) => {
    if (!roadmap) return;
    try {
      const updated = await apiClient.toggleRoadmapMilestone(roadmap.id, mIdx);
      if (updated) setRoadmap(updated);
    } catch (err) {
      console.warn('Failed to toggle roadmap milestone:', err);
    }
  };

  const handleRegenerateRoadmap = async () => {
    setGeneratingRoadmap(true);
    try {
      const rm = await apiClient.generateCareerRoadmap(profile?.targetRole);
      setRoadmap(rm);
    } catch (err) {
      console.warn('Failed to regenerate roadmap:', err);
    } finally {
      setGeneratingRoadmap(false);
    }
  };

  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchConvQuery.toLowerCase())
  );

  const suggestedQuestions = [
    'What skills should I learn for my target role?',
    'Analyze my profile and identify missing skills',
    'How do I improve my resume for Anthropic or Synthetix?',
    'Prepare me for a Technical Screen interview round',
    'Explain why a job matches or does not match my profile',
  ];

  return (
    <div className="space-y-6 text-left">
      {/* Top Banner & Module Navigation Header */}
      <div className="p-5 sm:p-6 rounded-2xl border border-indigo-900/60 bg-gradient-to-r from-slate-950 via-indigo-950/40 to-slate-950 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600/30 text-indigo-400 border border-indigo-500/40">
              <Sparkles className="h-4.5 w-4.5" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              AI Career Assistant & Strategic Copilot
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Personalized career navigation grounded in your verified skills ({profile?.skills?.slice(0, 4).join(', ') || 'Python, PostgreSQL'}), ATS readiness ({primaryResume?.atsScore || 88}%), and active pipeline applications.
          </p>
        </div>

        {/* View Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 self-start md:self-auto shrink-0">
          <button
            onClick={() => handleSelectTab('chat')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'chat'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>Advisory Chat</span>
          </button>
          <button
            onClick={() => handleSelectTab('roadmap')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'roadmap'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Compass className="h-3.5 w-3.5" />
            <span>Career Roadmap</span>
          </button>
          <button
            onClick={() => handleSelectTab('interview-prep')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'interview-prep'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Briefcase className="h-3.5 w-3.5" />
            <span>Interview Prep</span>
          </button>
        </div>
      </div>

      {/* =====================================================================
          TAB 1: ADVISORY CHAT WITH GROUNDED CONVERSATION HISTORY
         ===================================================================== */}
      {activeTab === 'chat' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-[680px]">
          {/* Left Column: Conversation Sessions List */}
          <div className="lg:col-span-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 flex flex-col justify-between space-y-3 h-full overflow-hidden">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Career Discussions ({conversations.length})
                </span>
                <button
                  onClick={() => handleStartNewChat()}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition-colors cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>New Chat</span>
                </button>
              </div>

              {/* Search conversations */}
              <div className="relative">
                <Search className="h-3.5 w-3.5 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search discussions..."
                  value={searchConvQuery}
                  onChange={(e) => setSearchConvQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Conversation list */}
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 google-photos-scrollbar">
              {filteredConversations.map((c) => (
                <div
                  key={c.id}
                  onClick={() => setActiveConvId(c.id)}
                  className={`group p-3 rounded-xl border text-left cursor-pointer transition-all flex items-start justify-between gap-2 ${
                    activeConvId === c.id
                      ? 'border-indigo-500/80 bg-indigo-950/40 text-white'
                      : 'border-slate-800/80 bg-slate-950/50 hover:bg-slate-800/40 text-slate-300'
                  }`}
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="font-semibold text-xs truncate leading-snug">{c.title}</div>
                    <div className="text-[11px] text-slate-400 truncate">
                      {c.lastMessagePreview || 'Active session'}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      {new Date(c.updatedAt).toLocaleDateString()} · {c.messageCount || 2} msgs
                    </div>
                  </div>

                  <button
                    onClick={(e) => handleDeleteConversation(c.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 transition-opacity"
                    title="Delete Chat"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}

              {filteredConversations.length === 0 && (
                <div className="p-6 text-center text-xs text-slate-500 space-y-2">
                  <p>No career discussions found.</p>
                  <button
                    onClick={() => handleStartNewChat()}
                    className="text-indigo-400 hover:underline"
                  >
                    Start your first conversation
                  </button>
                </div>
              )}
            </div>

            {/* Grounding Context Info Pill */}
            <div className="p-3 rounded-xl border border-slate-800 bg-slate-950/80 text-[11px] text-slate-400 space-y-1 shrink-0">
              <div className="font-semibold text-white flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                <span>Active Candidate Context</span>
              </div>
              <div className="truncate">
                Role: <span className="text-slate-300 font-medium">{profile?.targetRole || 'Software Architect'}</span>
              </div>
              <div className="truncate">
                ATS Score: <span className="text-emerald-400 font-mono font-bold">{primaryResume?.atsScore || 88}%</span>
              </div>
            </div>
          </div>

          {/* Right Column: Chat Stream & Message Input */}
          <div className="lg:col-span-8 rounded-2xl border border-slate-800 bg-slate-900/60 flex flex-col justify-between h-full overflow-hidden">
            {/* Chat View Header */}
            <div className="p-3.5 border-b border-slate-800 flex items-center justify-between gap-3 bg-slate-950/60 shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-semibold text-xs text-white truncate">
                  {conversations.find((c) => c.id === activeConvId)?.title || 'Career Copilot Advisory'}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950/80 border border-indigo-800 text-indigo-300 hidden sm:inline">
                  gemini-3.8-flash Grounded
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleExportConversation}
                  className="flex items-center gap-1 px-2.5 py-1 rounded text-xs text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
                  title="Export Transcript as Markdown"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Export</span>
                </button>
              </div>
            </div>

            {/* Message Stream */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 google-photos-scrollbar">
              {messages.map((m) => {
                const isAssistant = m.role === 'assistant';
                return (
                  <div
                    key={m.id}
                    className={`flex items-start gap-3 ${isAssistant ? '' : 'flex-row-reverse'}`}
                  >
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                        isAssistant
                          ? 'bg-gradient-to-tr from-indigo-600 to-violet-500 text-white shadow-sm shadow-indigo-600/30'
                          : 'bg-slate-700 text-white'
                      }`}
                    >
                      {isAssistant ? <Sparkles className="h-4 w-4" /> : 'You'}
                    </div>

                    <div
                      className={`max-w-[85%] sm:max-w-[78%] rounded-2xl p-4 text-xs leading-relaxed space-y-2 text-left relative group ${
                        isAssistant
                          ? 'border border-slate-800 bg-slate-950/80 text-slate-200'
                          : 'bg-indigo-600 text-white shadow-md'
                      }`}
                    >
                      {isAssistant && (
                        <div className="flex items-center justify-between text-[10px] text-slate-500 border-b border-slate-800/80 pb-1.5">
                          <span className="font-semibold uppercase tracking-wider text-indigo-400">
                            Career Copilot
                          </span>
                          <button
                            onClick={() => handleCopyMessage(m.id, m.content)}
                            className="text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                            title="Copy response"
                          >
                            {copiedMsgId === m.id ? (
                              <>
                                <Check className="h-3 w-3 text-emerald-400" />
                                <span className="text-emerald-400">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3 w-3" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}

                      <div className="whitespace-pre-line font-sans">{m.content}</div>

                      <div className="text-[10px] opacity-60 text-right">
                        {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                );
              })}

              {sending && (
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shrink-0">
                    <Sparkles className="h-4 w-4 animate-spin" />
                  </div>
                  <div className="p-3.5 rounded-2xl border border-slate-800 bg-slate-950/80 text-xs text-indigo-300 flex items-center gap-2">
                    <RotateCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Analyzing your candidate profile & real market requirements...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Workflow Questions Bar */}
            <div className="px-4 py-2 border-t border-slate-800 bg-slate-950/40 flex items-center gap-1.5 overflow-x-auto google-photos-scrollbar shrink-0">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 shrink-0">
                Suggested:
              </span>
              {suggestedQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setInputText(q);
                  }}
                  className="px-2.5 py-1 rounded-lg text-[11px] bg-slate-900 hover:bg-indigo-950/80 text-slate-300 hover:text-indigo-200 border border-slate-800 shrink-0 transition-colors cursor-pointer"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendMessage} className="p-3 sm:p-4 border-t border-slate-800 bg-slate-950 flex items-center gap-2 shrink-0">
              <input
                type="text"
                placeholder="Ask career questions: missing skills, interview strategy, resume feedback, salary negotiation..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={sending}
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={sending || !inputText.trim()}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 transition-colors shadow-md cursor-pointer shrink-0"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Send</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 2: CAREER ROADMAP GENERATOR & PROGRESS TRACKER
         ===================================================================== */}
      {activeTab === 'roadmap' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Compass className="h-4 w-4 text-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Target Role Roadmap: {roadmap?.targetRole || profile?.targetRole || 'Senior AI & Systems Architect'}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white">
                Personalized 6-Week Competency Roadmap
              </h3>
              <p className="text-xs text-slate-400">
                Milestones generated specifically to close your verified skill gaps and reach 95%+ ATS readiness.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={handleRegenerateRoadmap}
                disabled={generatingRoadmap}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 transition-colors cursor-pointer shadow-md"
              >
                <RotateCw className={`h-3.5 w-3.5 ${generatingRoadmap ? 'animate-spin' : ''}`} />
                <span>{generatingRoadmap ? 'Regenerating...' : 'Regenerate Roadmap'}</span>
              </button>
            </div>
          </div>

          {/* Readiness Progress Bar */}
          {roadmap && (
            <div className="p-5 rounded-2xl border border-slate-800 bg-slate-950/70 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">
                  Current Readiness Alignment
                </span>
                <span className="font-mono text-emerald-400 font-bold text-sm">
                  {roadmap.currentReadinessPct}% Ready
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full transition-all duration-500"
                  style={{ width: `${roadmap.currentReadinessPct}%` }}
                />
              </div>
            </div>
          )}

          {/* Milestones Timeline */}
          {roadmap && roadmap.milestones && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Weekly Milestone Progression
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {roadmap.milestones.map((m, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleToggleRoadmapMilestone(idx)}
                    className={`p-5 rounded-xl border text-left cursor-pointer transition-all space-y-3 ${
                      m.completed
                        ? 'border-emerald-800/80 bg-emerald-950/30'
                        : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-slate-900 border border-slate-800 text-indigo-300">
                        Week {m.week || idx + 1}
                      </span>
                      <div className="flex items-center gap-1.5 text-xs">
                        {m.completed ? (
                          <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                            <CheckCircle2 className="h-4 w-4" />
                            Completed
                          </span>
                        ) : (
                          <span className="text-slate-500 hover:text-slate-300">Mark Complete</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-white">{m.title}</h4>
                      <p className="text-xs text-slate-300 leading-relaxed mt-1">{m.description}</p>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {m.skills?.map((s, sIdx) => (
                        <span
                          key={sIdx}
                          className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-950 text-slate-300 border border-slate-800"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommended Capstone Projects */}
          {roadmap && roadmap.recommendedProjects && (
            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Code className="h-4 w-4 text-indigo-400" />
                <span>Recommended Practical Projects to Validate Skill Gaps</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {roadmap.recommendedProjects.map((p, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-2">
                    <h5 className="font-semibold text-xs text-white">{p.title}</h5>
                    <p className="text-xs text-slate-400 leading-relaxed">{p.description}</p>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {p.technologies?.map((tech, tIdx) => (
                        <span
                          key={tIdx}
                          className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-950/60 text-indigo-300 border border-indigo-800/60"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* =====================================================================
          TAB 3: INTERVIEW PREPARATION COACHING & STAR METHOD
         ===================================================================== */}
      {activeTab === 'interview-prep' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl border border-indigo-900/60 bg-slate-900/60 space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                <Target className="h-4 w-4" />
                <span>STAR Framework</span>
              </div>
              <h4 className="text-sm font-bold text-white">Behavioral Answer Structure</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Structure stories into Situation (15%), Task (15%), Action (50%), and measurable Result (20%).
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-emerald-900/60 bg-slate-900/60 space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Code className="h-4 w-4" />
                <span>Technical Architecture</span>
              </div>
              <h4 className="text-sm font-bold text-white">System Trade-Offs</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Always explain the trade-offs between consistency and availability, indexing overhead vs query speed.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-purple-900/60 bg-slate-900/60 space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                <span>Upcoming Screens</span>
              </div>
              <h4 className="text-sm font-bold text-white">
                {scheduledInterviews.length > 0 ? scheduledInterviews[0].jobTitle : 'Technical Screen Ready'}
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {scheduledInterviews.length > 0 ? scheduledInterviews[0].companyName : 'Synthetix Dynamics'} · Architecture Screen
              </p>
            </div>
          </div>

          {/* Quick Practice Prompts */}
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-indigo-400" />
              <span>Practice Questions for {profile?.targetRole || 'Software Engineer'}</span>
            </h4>
            <div className="space-y-3">
              {[
                {
                  q: 'Tell me about a time you optimized a slow query or database bottleneck in production.',
                  type: 'Behavioral STAR',
                  tip: 'Focus on query execution plans (EXPLAIN), connection pooling saturation, and quantifiable milliseconds saved.',
                },
                {
                  q: 'How would you architect an idempotent webhook processing pipeline absorbing 5,000 requests/sec?',
                  type: 'System Architecture',
                  tip: 'Highlight Redis event queues, transaction isolation, dead letter queues, and consumer autoscaling.',
                },
                {
                  q: 'What strategies do you use to ensure zero-downtime database schema migrations in PostgreSQL?',
                  type: 'Database Reliability',
                  tip: 'Mention lock timeouts, adding columns without defaults, and running CREATE INDEX CONCURRENTLY.',
                },
              ].map((item, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-white">{item.q}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-950 text-indigo-300 border border-indigo-800">
                      {item.type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    <strong className="text-slate-300">Coach Tip:</strong> {item.tip}
                  </p>
                  <button
                    onClick={() => {
                      setActiveTab('chat');
                      setInputText(`Help me formulate a strong STAR answer for: "${item.q}"`);
                    }}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
                  >
                    Draft answer with AI Copilot →
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
