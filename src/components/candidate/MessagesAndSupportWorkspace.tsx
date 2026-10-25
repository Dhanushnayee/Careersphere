import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  LifeBuoy,
  ShieldAlert,
  Send,
  HelpCircle,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  User,
  Paperclip,
  Check,
  RotateCw,
  Plus,
  Briefcase,
  ChevronDown,
  ChevronUp,
  X,
  Shield,
  ExternalLink,
} from 'lucide-react';
import { CandidateProfile, CandidateMessageItem, SupportTicketItem, Application } from '../../types';
import { apiClient } from '../../services/api';

interface MessagesAndSupportWorkspaceProps {
  profile: CandidateProfile | null;
  applications: Application[];
  jobs?: any[];
  initialTab?: 'inbox' | 'faqs' | 'tickets' | 'report';
  onTabChange?: (tab: 'inbox' | 'faqs' | 'tickets' | 'report') => void;
}

export const MessagesAndSupportWorkspace: React.FC<MessagesAndSupportWorkspaceProps> = ({
  profile,
  applications,
  jobs = [],
  initialTab = 'inbox',
  onTabChange,
}) => {
  const [activeTab, setActiveTab] = useState<'inbox' | 'faqs' | 'tickets' | 'report'>(initialTab);

  useEffect(() => {
    if (initialTab && initialTab !== activeTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const handleSelectTab = (tab: 'inbox' | 'faqs' | 'tickets' | 'report') => {
    setActiveTab(tab);
    onTabChange?.(tab);
  };

  // Messages state
  const [messages, setMessages] = useState<CandidateMessageItem[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [newMessageText, setNewMessageText] = useState('');
  const [selectedJobId, setSelectedJobId] = useState(applications[0]?.jobId || 'job_01');
  const [sendingMsg, setSendingMsg] = useState(false);
  const [activeThreadPartner, setActiveThreadPartner] = useState<string>('Elena Rostova (Synthetix Recruiter)');

  // FAQs state
  const [faqs, setFaqs] = useState<any[]>([]);
  const [faqCategory, setFaqCategory] = useState<string>('All');
  const [faqSearch, setFaqSearch] = useState<string>('');
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>(null);

  // Tickets state
  const [tickets, setTickets] = useState<SupportTicketItem[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [newTicketCategory, setNewTicketCategory] = useState('Technical Problem');
  const [newTicketSubject, setNewTicketSubject] = useState('');
  const [newTicketDesc, setNewTicketDesc] = useState('');
  const [ticketReplyText, setTicketReplyText] = useState<Record<string, string>>({});
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);

  // Trust & Safety Report state
  const [reportEntityType, setReportEntityType] = useState<'job' | 'recruiter' | 'message'>('job');
  const [reportTitle, setReportTitle] = useState('');
  const [reportReason, setReportReason] = useState('Demanded Payment / Fee');
  const [reportDetails, setReportDetails] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);
  const [reportSuccessNotice, setReportSuccessNotice] = useState<string | null>(null);

  useEffect(() => {
    loadMessages();
    loadFaqs();
    loadTickets();
  }, []);

  const loadMessages = async () => {
    setLoadingMessages(true);
    try {
      const data = await apiClient.getCandidateMessages();
      setMessages(data);
    } catch (err) {
      console.warn('Failed to load messages:', err);
    } finally {
      setLoadingMessages(false);
    }
  };

  const loadFaqs = async () => {
    try {
      const data = await apiClient.getSupportFaqs();
      setFaqs(data);
    } catch (err) {
      console.warn('Failed to load FAQs:', err);
    }
  };

  const loadTickets = async () => {
    setLoadingTickets(true);
    try {
      const data = await apiClient.getSupportTickets();
      setTickets(data);
    } catch (err) {
      console.warn('Failed to load support tickets:', err);
    } finally {
      setLoadingTickets(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = newMessageText.trim();
    if (!text || sendingMsg) return;

    setSendingMsg(true);
    try {
      const sent = await apiClient.sendCandidateMessage({
        content: text,
        recipientName: activeThreadPartner,
        jobId: selectedJobId,
      });
      setMessages((prev) => [...prev, sent]);
      setNewMessageText('');
    } catch (err) {
      console.warn('Failed to send message:', err);
    } finally {
      setSendingMsg(false);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicketSubject.trim() || !newTicketDesc.trim()) return;

    try {
      const t = await apiClient.submitSupportTicket({
        category: newTicketCategory,
        subject: newTicketSubject.trim(),
        description: newTicketDesc.trim(),
        jobId: selectedJobId,
      });
      setTickets((prev) => [t, ...prev]);
      setShowNewTicketModal(false);
      setNewTicketSubject('');
      setNewTicketDesc('');
    } catch (err) {
      console.warn('Failed to create ticket:', err);
    }
  };

  const handleReplyTicket = async (ticketId: string) => {
    const text = (ticketReplyText[ticketId] || '').trim();
    if (!text) return;

    try {
      const updated = await apiClient.replySupportTicket(ticketId, text);
      setTickets((prev) => prev.map((t) => (t.id === ticketId ? updated : t)));
      setTicketReplyText((prev) => ({ ...prev, [ticketId]: '' }));
    } catch (err) {
      console.warn('Failed to reply to ticket:', err);
    }
  };

  const handleCloseTicket = async (ticketId: string) => {
    try {
      const updated = await apiClient.updateTicketStatus(ticketId, 'Resolved');
      setTickets((prev) => prev.map((t) => (t.id === ticketId ? updated : t)));
    } catch (err) {
      console.warn('Failed to close ticket:', err);
    }
  };

  const handleSubmitFraudReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportReason || !reportDetails.trim()) return;

    setSubmittingReport(true);
    try {
      const res = await apiClient.reportSuspiciousContent({
        entityType: reportEntityType,
        entityId: 'rep_target_01',
        entityTitle: reportTitle || 'Reported Job/Entity',
        reason: reportReason,
        details: reportDetails.trim(),
      });
      setReportSuccessNotice(res.message || 'Report submitted securely.');
      setReportTitle('');
      setReportDetails('');
    } catch (err) {
      console.warn('Failed to submit report:', err);
    } finally {
      setSubmittingReport(false);
    }
  };

  // Group messages by partner
  const threadPartners = Array.from(new Set(messages.map((m) => (m.senderType === 'recruiter' ? m.senderName : m.recipientName))));
  if (threadPartners.length === 0) threadPartners.push('Elena Rostova (Synthetix Recruiter)');

  const currentThreadMessages = messages.filter(
    (m) => m.senderName === activeThreadPartner || m.recipientName === activeThreadPartner
  );

  const filteredFaqs = faqs.filter((f) => {
    const matchCat = faqCategory === 'All' || f.category.toLowerCase().includes(faqCategory.toLowerCase());
    const matchSearch =
      !faqSearch || f.question.toLowerCase().includes(faqSearch.toLowerCase()) || f.answer.toLowerCase().includes(faqSearch.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-6 text-left">
      {/* Top Banner Header */}
      <div className="p-5 sm:p-6 rounded-2xl border border-indigo-900/60 bg-gradient-to-r from-slate-950 via-indigo-950/40 to-slate-950 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600/30 text-indigo-400 border border-indigo-500/40">
              <MessageSquare className="h-4.5 w-4.5" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Messages & Support Center
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Communicate securely with verified employers and recruiters, browse official FAQs, manage support tickets, and report suspicious activities.
          </p>
        </div>

        {/* View Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 self-start md:self-auto shrink-0">
          <button
            onClick={() => handleSelectTab('inbox')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'inbox' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>Direct Inbox</span>
          </button>
          <button
            onClick={() => handleSelectTab('faqs')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'faqs' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <HelpCircle className="h-3.5 w-3.5" />
            <span>Help FAQs</span>
          </button>
          <button
            onClick={() => handleSelectTab('tickets')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'tickets' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <LifeBuoy className="h-3.5 w-3.5" />
            <span>Support Tickets</span>
          </button>
          <button
            onClick={() => handleSelectTab('report')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'report' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldAlert className="h-3.5 w-3.5 text-rose-400" />
            <span>Trust & Safety</span>
          </button>
        </div>
      </div>

      {/* =====================================================================
          TAB 1: CANDIDATE DIRECT INBOX
         ===================================================================== */}
      {activeTab === 'inbox' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-[640px]">
          {/* Conversation Partners Sidebar */}
          <div className="lg:col-span-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-3 h-full overflow-hidden flex flex-col justify-between">
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Verified Recruiter Threads ({threadPartners.length})
              </span>
              <div className="space-y-1.5">
                {threadPartners.map((partner, idx) => (
                  <div
                    key={idx}
                    onClick={() => setActiveThreadPartner(partner)}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      activeThreadPartner === partner
                        ? 'border-indigo-500/80 bg-indigo-950/40 text-white'
                        : 'border-slate-800 bg-slate-950/60 hover:bg-slate-800/40 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs truncate">{partner}</span>
                      <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5 truncate">
                      Regarding active application
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recruiter Trust Notice */}
            <div className="p-3 rounded-xl border border-slate-800 bg-slate-950/80 text-[11px] text-slate-400 space-y-1 shrink-0">
              <div className="font-semibold text-white flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                <span>Verified Communication Channel</span>
              </div>
              <p>
                Recruiter credentials and corporate domains are strictly audited by CareerSphere Trust & Safety.
              </p>
            </div>
          </div>

          {/* Chat Stream & Composer */}
          <div className="lg:col-span-8 rounded-2xl border border-slate-800 bg-slate-900/60 flex flex-col justify-between h-full overflow-hidden">
            {/* Thread Header */}
            <div className="p-3.5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-cyan-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                  {activeThreadPartner.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="font-bold text-xs text-white">{activeThreadPartner}</div>
                  <div className="text-[10px] text-emerald-400 font-mono">Verified Recruiter · Active</div>
                </div>
              </div>

              {/* Linked Job selector */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400 hidden sm:inline">Linked Role:</span>
                <select
                  value={selectedJobId}
                  onChange={(e) => setSelectedJobId(e.target.value)}
                  className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-300 focus:outline-none cursor-pointer max-w-[200px] truncate"
                >
                  {applications.map((app) => (
                    <option key={app.id} value={app.jobId}>
                      {app.jobTitle} ({app.companyName})
                    </option>
                  ))}
                  {applications.length === 0 && <option value="job_01">Senior Python Architect</option>}
                </select>
              </div>
            </div>

            {/* Message History */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 google-photos-scrollbar">
              {currentThreadMessages.map((m) => {
                const isCandidate = m.senderType === 'candidate';
                return (
                  <div key={m.id} className={`flex items-start gap-2.5 ${isCandidate ? 'flex-row-reverse' : ''}`}>
                    <div
                      className={`h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                        isCandidate ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-white'
                      }`}
                    >
                      {isCandidate ? 'You' : m.senderName.slice(0, 2).toUpperCase()}
                    </div>
                    <div
                      className={`max-w-[80%] rounded-2xl p-3 text-xs space-y-1.5 ${
                        isCandidate ? 'bg-indigo-600 text-white' : 'bg-slate-950 border border-slate-800 text-slate-200'
                      }`}
                    >
                      <div className="leading-relaxed whitespace-pre-line">{m.content}</div>
                      <div className="text-[10px] opacity-60 text-right">
                        {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                );
              })}

              {currentThreadMessages.length === 0 && (
                <div className="p-8 text-center text-xs text-slate-500">
                  No previous messages with this recruiter. Send an inquiry below.
                </div>
              )}
            </div>

            {/* Composer */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-800 bg-slate-950 flex items-center gap-2 shrink-0">
              <input
                type="text"
                placeholder="Write a message to recruiter regarding application, interview schedule, or questions..."
                value={newMessageText}
                onChange={(e) => setNewMessageText(e.target.value)}
                disabled={sendingMsg}
                className="flex-1 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={sendingMsg || !newMessageText.trim()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 transition-colors shadow-sm cursor-pointer shrink-0"
              >
                {sendingMsg ? <RotateCw className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                <span>Send</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 2: SEARCHABLE FAQS & KNOWLEDGE BASE
         ===================================================================== */}
      {activeTab === 'faqs' && (
        <div className="space-y-5">
          {/* Search & Category Filter */}
          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1">
                <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search questions across Account, Resumes, Applications, Interviews, AI..."
                  value={faqSearch}
                  onChange={(e) => setFaqSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <select
                value={faqCategory}
                onChange={(e) => setFaqCategory(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none cursor-pointer"
              >
                <option value="All">All Categories</option>
                <option value="Account">Account & Security</option>
                <option value="Resumes">Resumes & ATS</option>
                <option value="Job Search">Job Search & n8n</option>
                <option value="Interviews">Interviews & Prep</option>
                <option value="AI Assistant">AI Assistant</option>
                <option value="Trust">Trust & Safety</option>
              </select>
            </div>
          </div>

          {/* Accordion FAQ Items */}
          <div className="space-y-3">
            {filteredFaqs.map((faq) => {
              const isExpanded = expandedFaqId === faq.id;
              return (
                <div
                  key={faq.id}
                  className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden transition-all text-left"
                >
                  <button
                    onClick={() => setExpandedFaqId(isExpanded ? null : faq.id)}
                    className="w-full p-4 flex items-center justify-between gap-3 text-left hover:bg-slate-800/40 cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <HelpCircle className="h-4 w-4 text-indigo-400 shrink-0" />
                      <span className="font-semibold text-xs text-white">{faq.question}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-950 text-slate-400 border border-slate-800">
                        {faq.category}
                      </span>
                      {isExpanded ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 pt-1 text-xs text-slate-300 leading-relaxed border-t border-slate-800/80 bg-slate-950/40">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 3: SUPPORT TICKETS SYSTEM
         ===================================================================== */}
      {activeTab === 'tickets' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <LifeBuoy className="h-4 w-4 text-indigo-400" />
                <span>Candidate Support Tickets</span>
              </h3>
              <p className="text-xs text-slate-400">
                Submit technical questions, reporting issues, or feature requests directly to our platform staff.
              </p>
            </div>
            <button
              onClick={() => setShowNewTicketModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create Ticket</span>
            </button>
          </div>

          {/* Tickets List */}
          <div className="space-y-3">
            {tickets.map((t) => (
              <div key={t.id} className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-3 text-left">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-indigo-950 text-indigo-300 border border-indigo-800">
                      {t.category}
                    </span>
                    <span className="text-xs font-semibold text-white">{t.subject}</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      t.status === 'Resolved'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : 'bg-amber-950 text-amber-400 border border-amber-800'
                    }`}
                  >
                    {t.status}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{t.description}</p>

                {/* Ticket Replies Thread */}
                {t.replies && t.replies.length > 0 && (
                  <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Staff Updates & Conversation
                    </span>
                    {t.replies.map((rep: any) => (
                      <div key={rep.id} className="text-xs space-y-0.5 border-b border-slate-800/60 pb-1.5 last:border-b-0">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className={`font-semibold ${rep.isStaff ? 'text-indigo-400' : 'text-slate-300'}`}>
                            {rep.author}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {new Date(rep.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-slate-300 text-xs">{rep.message}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Ticket Reply Form */}
                {t.status !== 'Resolved' && (
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                    <input
                      type="text"
                      placeholder="Reply to this ticket..."
                      value={ticketReplyText[t.id] || ''}
                      onChange={(e) => setTicketReplyText({ ...ticketReplyText, [t.id]: e.target.value })}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none"
                    />
                    <button
                      onClick={() => handleReplyTicket(t.id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors cursor-pointer"
                    >
                      Reply
                    </button>
                    <button
                      onClick={() => handleCloseTicket(t.id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 transition-colors cursor-pointer"
                    >
                      Resolve
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Create Ticket Modal */}
          {showNewTicketModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
              <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4 shadow-2xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white">Create Support Ticket</h3>
                  <button onClick={() => setShowNewTicketModal(false)} className="text-slate-400 hover:text-white">
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <form onSubmit={handleCreateTicket} className="space-y-3 text-left">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Category</label>
                    <select
                      value={newTicketCategory}
                      onChange={(e) => setNewTicketCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none cursor-pointer"
                    >
                      <option value="Technical Problem">Technical Problem</option>
                      <option value="Profile & Resume">Profile & Resume</option>
                      <option value="Job Listings & Applications">Job Listings & Applications</option>
                      <option value="Interviews & Scheduling">Interviews & Scheduling</option>
                      <option value="Data Privacy & 2FA">Data Privacy & 2FA</option>
                      <option value="Feature Suggestion">Feature Suggestion</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Subject</label>
                    <input
                      type="text"
                      placeholder="Brief summary of your inquiry..."
                      value={newTicketSubject}
                      onChange={(e) => setNewTicketSubject(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Detailed Description</label>
                    <textarea
                      rows={4}
                      placeholder="Describe what happened, any error messages, and steps to reproduce..."
                      value={newTicketDesc}
                      onChange={(e) => setNewTicketDesc(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowNewTicketModal(false)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!newTicketSubject.trim() || !newTicketDesc.trim()}
                      className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 shadow-md cursor-pointer"
                    >
                      Submit Ticket
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =====================================================================
          TAB 4: TRUST & SAFETY FRAUD REPORTING
         ===================================================================== */}
      {activeTab === 'report' && (
        <div className="max-w-2xl mx-auto space-y-5 text-left">
          <div className="p-6 rounded-2xl border border-rose-900/60 bg-gradient-to-r from-rose-950/40 via-slate-900 to-slate-950 space-y-2">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-rose-400" />
              <h3 className="text-base font-bold text-white">Report Suspicious Job or Recruiter</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              CareerSphere AI maintains a zero-tolerance policy against scams, phishing, and recruiters demanding placement fees or equipment deposits. Every report is audited by our Governance & Trust Team.
            </p>
          </div>

          {reportSuccessNotice && (
            <div className="p-4 rounded-xl border border-emerald-800 bg-emerald-950/80 text-emerald-300 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>{reportSuccessNotice}</span>
              </div>
              <button onClick={() => setReportSuccessNotice(null)} className="text-emerald-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          <form onSubmit={handleSubmitFraudReport} className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Entity Being Reported</label>
              <select
                value={reportEntityType}
                onChange={(e) => setReportEntityType(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none cursor-pointer"
              >
                <option value="job">Specific Job Listing</option>
                <option value="recruiter">Suspicious Recruiter Account</option>
                <option value="message">Abusive or Phishing Message</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Job Title or Recruiter Name</label>
              <input
                type="text"
                placeholder="e.g. Senior Cloud Architect at FakeCorp"
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Violation Reason</label>
              <select
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none cursor-pointer"
              >
                <option value="Demanded Payment / Fee">Demanded Payment or Registration Fee</option>
                <option value="Equipment / Check Scam">Equipment Purchase / Fake Check Scam</option>
                <option value="Identity Theft / Phishing">Phishing for SSN / Banking Information</option>
                <option value="Fake / Ghost Job Listing">Fake / Ghost Job Listing</option>
                <option value="Unsolicited Spam or Harassment">Unsolicited Spam or Harassment</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Evidence & Description</label>
              <textarea
                rows={4}
                placeholder="Please describe what was requested or provide screenshots/message quotes..."
                value={reportDetails}
                onChange={(e) => setReportDetails(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={submittingReport || !reportDetails.trim()}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-50 transition-colors shadow-md cursor-pointer"
            >
              {submittingReport ? <RotateCw className="h-4 w-4 animate-spin" /> : <ShieldAlert className="h-4 w-4" />}
              <span>{submittingReport ? 'Submitting to Governance Team...' : 'Submit Fraud Report'}</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
