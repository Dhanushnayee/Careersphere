/**
 * CareerSphere AI — Recruiter Candidate Direct Messaging Inbox
 * Phase 4: Two-pane conversation thread system, direct candidate outreach, unread badges, and notifications.
 */
import React, { useState, useEffect, useRef } from 'react';
import { apiClient } from '../../services/api';
import { Conversation, ChatMessage, Application, Job } from '../../types';
import { Modal } from '../common/Modal';
import {
  MessageSquare,
  Send,
  User,
  Search,
  RotateCw,
  Plus,
  CheckCircle2,
  Clock,
  Shield,
  Loader2,
  Briefcase,
  AlertTriangle,
} from 'lucide-react';

interface RecruiterMessagingViewProps {
  jobs: Job[];
}

export const RecruiterMessagingView: React.FC<RecruiterMessagingViewProps> = ({ jobs }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [composerText, setComposerText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // New Outreach Modal
  const [isNewOutreachOpen, setIsNewOutreachOpen] = useState(false);
  const [applications, setApplications] = useState<Application[]>([]);
  const [outreachAppId, setOutreachAppId] = useState('');
  const [outreachInitialMessage, setOutreachInitialMessage] = useState(
    'Hi, thanks for applying to Synthetix! We were very impressed by your background and would love to connect on next steps.'
  );
  const [outreachLoading, setOutreachLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async (preserveActive = true) => {
    try {
      const convos = await apiClient.getConversations();
      setConversations(convos);
      if (convos.length > 0) {
        if (!activeConversationId || !preserveActive) {
          setActiveConversationId(convos[0].id);
        }
      }
    } catch (err) {
      console.warn('Failed to load conversations:', err);
    } finally {
      setLoadingThreads(false);
    }
  };

  useEffect(() => {
    fetchConversations(false);
  }, []);

  // Fetch messages whenever active conversation changes
  useEffect(() => {
    if (!activeConversationId) return;

    setLoadingMessages(true);
    apiClient
      .getConversationMessages(activeConversationId)
      .then((res) => {
        setMessages(res.messages || []);
        // update conversation unread locally
        setConversations((prev) =>
          prev.map((c) => (c.id === activeConversationId ? { ...c, unreadCountRecruiter: 0 } : c))
        );
        setTimeout(scrollToBottom, 100);
      })
      .catch((err) => console.warn('Failed to fetch messages:', err))
      .finally(() => setLoadingMessages(false));
  }, [activeConversationId]);

  // Load applicants for outreach modal
  useEffect(() => {
    apiClient
      .getRecruiterApplicants({ limit: 50 })
      .then((res: any) => {
        const apps = res.applicants || [];
        setApplications(apps);
        if (apps.length > 0 && !outreachAppId) {
          setOutreachAppId(apps[0].id);
        }
      })
      .catch((e: any) => console.warn('Failed to load applicants for outreach:', e));
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConversationId || !composerText.trim() || sendingMessage) return;

    setSendingMessage(true);
    try {
      const res = await apiClient.sendConversationMessage(
        activeConversationId,
        composerText.trim()
      );
      setMessages((prev) => [...prev, res.message]);
      setComposerText('');
      setTimeout(scrollToBottom, 50);

      // update conversation snippet
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConversationId
            ? { ...c, lastMessageText: res.message.text, lastMessageAt: res.message.createdAt }
            : c
        )
      );
    } catch (err: any) {
      alert(err?.message || 'Failed to send message.');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleStartOutreach = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!outreachAppId) return;

    setOutreachLoading(true);
    try {
      const convo = await apiClient.initiateConversation({
        applicationId: outreachAppId,
      });

      if (outreachInitialMessage.trim()) {
        await apiClient.sendConversationMessage(convo.id, outreachInitialMessage.trim());
      }

      setIsNewOutreachOpen(false);
      await fetchConversations();
      setActiveConversationId(convo.id);
    } catch (err: any) {
      alert(err?.message || 'Failed to start outreach conversation.');
    } finally {
      setOutreachLoading(false);
    }
  };

  const filteredConversations = conversations.filter((c) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.candidateName?.toLowerCase().includes(q) ||
      c.jobTitle?.toLowerCase().includes(q) ||
      c.lastMessageText?.toLowerCase().includes(q)
    );
  });

  const activeConvo = conversations.find((c) => c.id === activeConversationId);

  return (
    <div className="space-y-6 text-left text-xs animate-fadeIn">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl border border-indigo-900/50 bg-gradient-to-r from-indigo-950/50 via-slate-900 to-slate-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-900/60 text-indigo-300 border border-indigo-700/60">
              PHASE 4 ACTIVE
            </span>
            <span className="text-xs text-slate-400">Direct Candidate Messaging</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Candidate Outreach & Messaging Center
          </h1>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Engage directly with qualified applicants, provide feedback updates, and coordinate scheduling.
            Outreach messages instantly sync with candidate in-app notifications and email summaries.
          </p>
        </div>

        <button
          onClick={() => setIsNewOutreachOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/25 transition-all cursor-pointer shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>New Outreach Thread</span>
        </button>
      </div>

      {/* Two-Pane Messaging Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[650px] min-h-[500px]">
        {/* Left Pane: Conversation Threads (4 cols) */}
        <div className="lg:col-span-4 rounded-2xl border border-slate-800 bg-slate-900/60 flex flex-col overflow-hidden">
          {/* Header & Search */}
          <div className="p-3.5 border-b border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-xs flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-indigo-400" />
                <span>Conversations ({conversations.length})</span>
              </span>
              <button
                onClick={() => fetchConversations()}
                className="p-1 rounded text-slate-400 hover:text-white"
                title="Refresh threads"
              >
                <RotateCw className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="relative">
              <Search className="h-3.5 w-3.5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search candidates or jobs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Thread List */}
          <div className="flex-1 overflow-y-auto google-photos-scrollbar p-2 space-y-1">
            {loadingThreads ? (
              <div className="p-8 text-center text-slate-400 flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
                <span>Loading threads...</span>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-slate-400 space-y-2">
                <MessageSquare className="h-8 w-8 mx-auto text-slate-600" />
                <div className="text-white font-medium">No Conversations Yet</div>
                <p className="text-[11px] text-slate-500">
                  Click "New Outreach Thread" to send a direct message to any applicant.
                </p>
              </div>
            ) : (
              filteredConversations.map((c) => {
                const isSelected = c.id === activeConversationId;
                const hasUnread = (c.unreadCountRecruiter || 0) > 0;

                return (
                  <button
                    key={c.id}
                    onClick={() => setActiveConversationId(c.id)}
                    className={`w-full text-left p-3 rounded-xl transition-all cursor-pointer flex items-start justify-between gap-2.5 ${
                      isSelected
                        ? 'bg-indigo-950/70 border border-indigo-700/70 text-white'
                        : 'bg-slate-950/40 hover:bg-slate-850 border border-transparent text-slate-300'
                    }`}
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-white truncate">
                          {c.candidateName || 'Candidate'}
                        </span>
                        {c.lastMessageAt && (
                          <span className="text-[10px] text-slate-500 font-mono shrink-0 ml-1">
                            {new Date(c.lastMessageAt).toLocaleDateString([], { month: 'numeric', day: 'numeric' })}
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] text-indigo-300 truncate">
                        {c.jobTitle || 'Requisition'}
                      </div>

                      <p className="text-[11px] text-slate-400 truncate leading-snug">
                        {c.lastMessageText || 'No messages yet'}
                      </p>
                    </div>

                    {hasUnread && (
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500 text-white shrink-0 mt-1">
                        {c.unreadCountRecruiter}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Pane: Active Thread Chat (8 cols) */}
        <div className="lg:col-span-8 rounded-2xl border border-slate-800 bg-slate-900/60 flex flex-col overflow-hidden">
          {activeConvo ? (
            <>
              {/* Thread Header */}
              <div className="p-3.5 border-b border-slate-800 flex items-center justify-between gap-3 bg-slate-950/40">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-full bg-indigo-900/80 border border-indigo-700 flex items-center justify-center font-bold text-indigo-200">
                    {activeConvo.candidateName?.[0] || 'C'}
                  </div>
                  <div>
                    <div className="font-bold text-white text-xs">
                      {activeConvo.candidateName}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Applicant for <strong className="text-slate-200">{activeConvo.jobTitle}</strong>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800">
                    Connected
                  </span>
                </div>
              </div>

              {/* Message History */}
              <div className="flex-1 overflow-y-auto google-photos-scrollbar p-4 space-y-3 bg-slate-950/20">
                {loadingMessages ? (
                  <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
                    <span>Loading conversation transcript...</span>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="p-12 text-center text-slate-500 text-xs">
                    Start the conversation by sending a message below.
                  </div>
                ) : (
                  messages.map((m) => {
                    const isRecruiter = m.senderRole === 'recruiter';
                    const timeStr = new Date(m.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    });

                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col ${isRecruiter ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[75%] rounded-2xl p-3 text-xs leading-relaxed ${
                            isRecruiter
                              ? 'bg-indigo-600 text-white rounded-br-none shadow-md shadow-indigo-600/10'
                              : 'bg-slate-800 text-slate-100 rounded-bl-none border border-slate-700/80'
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{m.text}</p>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-500 font-mono px-1">
                          <span>{m.senderName}</span>
                          <span>•</span>
                          <span>{timeStr}</span>
                          {isRecruiter && (
                            <span className="text-indigo-400">
                              <CheckCircle2 className="h-3 w-3 inline" />
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Composer */}
              <form
                onSubmit={handleSendMessage}
                className="p-3 border-t border-slate-800 bg-slate-950/60 flex items-end gap-2"
              >
                <div className="flex-1 relative">
                  <textarea
                    rows={2}
                    value={composerText}
                    maxLength={2000}
                    onChange={(e) => setComposerText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }}
                    placeholder="Type your message to candidate... (Press Enter to send, Shift+Enter for new line)"
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-xs resize-none"
                  />
                  <div className="absolute right-2.5 bottom-2 text-[10px] text-slate-500 font-mono">
                    {composerText.length}/2000
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!composerText.trim() || sendingMessage}
                  className="px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center shrink-0 shadow-md shadow-indigo-600/20"
                >
                  {sendingMessage ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-8 text-center space-y-2">
              <MessageSquare className="h-10 w-10 text-slate-700" />
              <div className="text-white font-medium">Select a Conversation</div>
              <p className="text-xs text-slate-500 max-w-sm">
                Choose a candidate thread from the left pane or start a new outreach thread to collaborate.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* OUTREACH MODAL */}
      {isNewOutreachOpen && (
        <Modal
          isOpen={isNewOutreachOpen}
          onClose={() => setIsNewOutreachOpen(false)}
          title="Start Candidate Outreach Thread"
          maxWidth="max-w-lg"
        >
          <form onSubmit={handleStartOutreach} className="space-y-4 text-left text-xs">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-300">
              Initiate a direct messaging thread with an applicant. The candidate will receive an immediate in-app
              notification with your message.
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Select Candidate Application</label>
              <select
                value={outreachAppId}
                onChange={(e) => setOutreachAppId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-indigo-500 text-xs"
                required
              >
                {applications.map((app) => (
                  <option key={app.id} value={app.id}>
                    {app.candidateName || 'Candidate'} — {app.jobTitle} (Stage: {app.stage})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Opening Message</label>
              <textarea
                rows={3}
                value={outreachInitialMessage}
                onChange={(e) => setOutreachInitialMessage(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsNewOutreachOpen(false)}
                className="px-4 py-2 rounded-xl text-xs text-slate-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={outreachLoading}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 transition-colors cursor-pointer disabled:opacity-50"
              >
                {outreachLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>Send Outreach</span>
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
