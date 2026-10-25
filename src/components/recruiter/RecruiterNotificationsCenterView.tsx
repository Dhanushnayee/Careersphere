/**
 * CareerSphere AI — Recruiter Notifications Center
 * Full-stack notifications console with real-time updates, category filters,
 * unread badges, bulk operations, deep links to pipeline entities, and simulation test tools.
 */
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  RecruiterNotification,
  RecruiterNotificationCategory,
  RecruiterNotificationPriority,
  RecruiterNotificationsResponse,
} from '../../types';
import { apiClient } from '../../services/api';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Filter,
  Search,
  RotateCw,
  Trash2,
  CheckCheck,
  Briefcase,
  Users,
  Calendar,
  Gift,
  Building,
  Settings,
  ShieldCheck,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Flame,
  Sparkles,
  Info,
  Check,
  Eye,
  EyeOff,
  SlidersHorizontal,
  X,
  Send,
  Loader2,
} from 'lucide-react';

interface RecruiterNotificationsCenterViewProps {
  onNavigateSubView: (module: string, subPart?: string, targetId?: string) => void;
  onUnreadCountChange?: (count: number) => void;
}

export const RecruiterNotificationsCenterView: React.FC<RecruiterNotificationsCenterViewProps> = ({
  onNavigateSubView,
  onUnreadCountChange,
}) => {
  const [notifications, setNotifications] = useState<RecruiterNotification[]>([]);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({
    all: 0,
    unread: 0,
    applications: 0,
    interviews: 0,
    jobs: 0,
    company: 0,
    system: 0,
  });
  const [totalCount, setTotalCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [activeCategory, setActiveCategory] = useState<RecruiterNotificationCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'priority'>('newest');

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  // Test simulation modal
  const [simModalOpen, setSimModalOpen] = useState(false);
  const [simEventType, setSimEventType] = useState('new_application');
  const [simLoading, setSimLoading] = useState(false);

  // Toast feedback
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage(text, type);
  };

  const setToastMessage = (text: string, type: 'success' | 'error' | 'info') => {
    setToast({ type, text });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Fetch notifications from API
  const fetchNotifications = useCallback(
    async (isBackground = false) => {
      if (!isBackground) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      setError(null);

      try {
        const response: RecruiterNotificationsResponse = await apiClient.getRecruiterNotifications({
          category: activeCategory,
          search: searchQuery.trim() || undefined,
          sortBy,
          page,
          limit,
        });

        setNotifications(response.notifications || []);
        setCategoryCounts(
          response.categoryCounts || {
            all: 0,
            unread: 0,
            applications: 0,
            interviews: 0,
            jobs: 0,
            company: 0,
            system: 0,
          }
        );
        setTotalCount(response.totalCount || 0);
        setUnreadCount(response.unreadCount || 0);
        setTotalPages(response.totalPages || 1);

        if (onUnreadCountChange) {
          onUnreadCountChange(response.unreadCount || 0);
        }
      } catch (err: any) {
        console.error('Failed to load recruiter notifications:', err);
        setError(err.message || 'Failed to load notifications. Please try again.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [activeCategory, searchQuery, sortBy, page, limit, onUnreadCountChange]
  );

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Periodic polling for real-time delivery (every 25 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      fetchNotifications(true);
    }, 25000);

    // Listen for custom broadcast events within same tab
    const handleRecruiterEvent = () => {
      fetchNotifications(true);
    };
    window.addEventListener('careersphere:recruiter_event', handleRecruiterEvent);

    return () => {
      clearInterval(timer);
      window.removeEventListener('careersphere:recruiter_event', handleRecruiterEvent);
    };
  }, [fetchNotifications]);

  // Mark single notification read
  const handleMarkAsRead = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      // Optimistic update
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
      setCategoryCounts((counts) => ({
        ...counts,
        unread: Math.max(0, (counts.unread || 1) - 1),
      }));

      await apiClient.markRecruiterNotificationRead(id);
      if (onUnreadCountChange) {
        onUnreadCountChange(Math.max(0, unreadCount - 1));
      }
    } catch (err: any) {
      showToast('Failed to update notification status.', 'error');
      fetchNotifications(true);
    }
  };

  // Mark single notification unread
  const handleMarkAsUnread = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: false, readAt: undefined } : n))
      );
      setUnreadCount((c) => c + 1);
      setCategoryCounts((counts) => ({
        ...counts,
        unread: (counts.unread || 0) + 1,
      }));

      await apiClient.markRecruiterNotificationUnread(id);
      if (onUnreadCountChange) {
        onUnreadCountChange(unreadCount + 1);
      }
    } catch (err: any) {
      showToast('Failed to mark as unread.', 'error');
      fetchNotifications(true);
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true, readAt: new Date().toISOString() }))
      );
      setUnreadCount(0);
      setCategoryCounts((counts) => ({ ...counts, unread: 0 }));
      if (onUnreadCountChange) onUnreadCountChange(0);

      const res = await apiClient.markAllRecruiterNotificationsRead(
        activeCategory !== 'all' && activeCategory !== 'unread' ? activeCategory : undefined
      );
      showToast(`Marked ${res.count || 'all'} notification(s) as read.`, 'success');
    } catch (err: any) {
      showToast('Failed to mark all as read.', 'error');
      fetchNotifications(true);
    }
  };

  // Delete/dismiss notification
  const handleDeleteNotification = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const deletedItem = notifications.find((n) => n.id === id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      setSelectedIds((prev) => prev.filter((i) => i !== id));

      if (deletedItem && !deletedItem.isRead) {
        setUnreadCount((c) => Math.max(0, c - 1));
        setCategoryCounts((c) => ({ ...c, unread: Math.max(0, (c.unread || 1) - 1) }));
      }

      await apiClient.deleteRecruiterNotification(id);
      showToast('Notification dismissed.', 'info');
      if (onUnreadCountChange && deletedItem && !deletedItem.isRead) {
        onUnreadCountChange(Math.max(0, unreadCount - 1));
      }
    } catch (err: any) {
      showToast('Failed to dismiss notification.', 'error');
      fetchNotifications(true);
    }
  };

  // Clear all read notifications
  const handleClearRead = async () => {
    try {
      setNotifications((prev) => prev.filter((n) => !n.isRead));
      const res = await apiClient.clearReadRecruiterNotifications();
      showToast(`Cleared ${res.deletedCount || 0} read notifications.`, 'success');
      fetchNotifications(true);
    } catch (err: any) {
      showToast('Failed to clear read notifications.', 'error');
    }
  };

  // Bulk action
  const handleBulkAction = async (action: 'mark_read' | 'mark_unread' | 'delete') => {
    if (selectedIds.length === 0) return;
    setBulkActionLoading(true);
    try {
      await apiClient.bulkRecruiterNotifications(selectedIds, action);
      showToast(`Applied "${action.replace('_', ' ')}" to ${selectedIds.length} notifications.`, 'success');
      setSelectedIds([]);
      fetchNotifications(true);
    } catch (err: any) {
      showToast('Bulk operation failed.', 'error');
    } finally {
      setBulkActionLoading(false);
    }
  };

  // Toggle selection
  const toggleSelectOne = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === notifications.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(notifications.map((n) => n.id));
    }
  };

  // Click on notification to navigate and mark as read
  const handleNotificationClick = async (notif: RecruiterNotification) => {
    if (!notif.isRead) {
      handleMarkAsRead(notif.id);
    }

    if (notif.targetModule) {
      onNavigateSubView(notif.targetModule, notif.targetSubPart, notif.targetId);
    }
  };

  // Test simulation trigger
  const handleTriggerTestEvent = async () => {
    setSimLoading(true);
    try {
      const res = await apiClient.triggerTestRecruiterNotification(simEventType);
      showToast(`Test event "${simEventType}" dispatched successfully!`, 'success');
      setSimModalOpen(false);
      fetchNotifications();
    } catch (err: any) {
      showToast(err.message || 'Failed to dispatch test notification.', 'error');
    } finally {
      setSimLoading(false);
    }
  };

  // Category visual metadata
  const getCategoryMeta = (cat: string) => {
    switch (cat) {
      case 'applications':
        return {
          label: 'Applications',
          color: 'text-indigo-400 bg-indigo-950/60 border-indigo-800/60',
          icon: <Users className="h-3.5 w-3.5 text-indigo-400" />,
        };
      case 'interviews':
        return {
          label: 'Interviews',
          color: 'text-sky-400 bg-sky-950/60 border-sky-800/60',
          icon: <Calendar className="h-3.5 w-3.5 text-sky-400" />,
        };
      case 'jobs':
        return {
          label: 'Requisitions',
          color: 'text-violet-400 bg-violet-950/60 border-violet-800/60',
          icon: <Briefcase className="h-3.5 w-3.5 text-violet-400" />,
        };
      case 'company':
        return {
          label: 'Company & Team',
          color: 'text-emerald-400 bg-emerald-950/60 border-emerald-800/60',
          icon: <Building className="h-3.5 w-3.5 text-emerald-400" />,
        };
      case 'system':
      default:
        return {
          label: 'System & Policy',
          color: 'text-amber-400 bg-amber-950/60 border-amber-800/60',
          icon: <Info className="h-3.5 w-3.5 text-amber-400" />,
        };
    }
  };

  // Format relative timestamp
  const formatTimeAgo = (isoDate: string) => {
    try {
      const diffMs = Date.now() - new Date(isoDate).getTime();
      const diffSec = Math.floor(diffMs / 1000);
      if (diffSec < 45) return 'Just now';
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) return `${diffMin}m ago`;
      const diffHr = Math.floor(diffMin / 60);
      if (diffHr < 24) return `${diffHr}h ago`;
      const diffDays = Math.floor(diffHr / 24);
      if (diffDays < 7) return `${diffDays}d ago`;
      return new Date(isoDate).toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return 'Recently';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Toast Alert Banner */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-2xl text-xs font-medium border backdrop-blur-md animate-in slide-in-from-bottom-2 ${
            toast.type === 'success'
              ? 'bg-emerald-950/90 text-emerald-200 border-emerald-700/60'
              : toast.type === 'error'
              ? 'bg-rose-950/90 text-rose-200 border-rose-700/60'
              : 'bg-cyan-950/90 text-cyan-200 border-cyan-700/60'
          }`}
        >
          {toast.type === 'success' && <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />}
          {toast.type === 'error' && <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />}
          {toast.type === 'info' && <Info className="h-4 w-4 text-cyan-400 shrink-0" />}
          <span>{toast.text}</span>
          <button onClick={() => setToast(null)} className="ml-2 text-slate-400 hover:text-white cursor-pointer">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/30 p-6 sm:p-8">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <div className="h-10 w-10 rounded-xl bg-cyan-950/80 border border-cyan-800/60 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-900/20">
                <Bell className="h-5 w-5" />
              </div>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <span>Recruiter Governance & Hiring Alerts</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Recruiter Notifications Center
                </h1>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Real-time inbound telemetry for applicant submissions, interview reschedule alerts, offer confirmations,
              job requisition moderation, and employer verification lifecycle updates.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => fetchNotifications(true)}
              disabled={refreshing}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700/60 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="Refresh notifications"
            >
              <RotateCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin text-cyan-400' : 'text-slate-400'}`} />
              <span>{refreshing ? 'Syncing...' : 'Refresh'}</span>
            </button>

            <button
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white transition-all shadow-md shadow-cyan-600/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <CheckCheck className="h-4 w-4" />
              <span>Mark All Read</span>
            </button>

            <button
              onClick={() => setSimModalOpen(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white transition-all shadow-md shadow-violet-600/20 flex items-center gap-1.5 cursor-pointer"
              title="Simulate incoming real-world event"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Simulate Event</span>
            </button>
          </div>
        </div>

        {/* Live Counters Strip */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/60">
            <div className="text-[11px] font-medium text-slate-400">Total Notifications</div>
            <div className="text-xl font-bold font-mono text-white mt-0.5">{totalCount}</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/50 border border-cyan-900/30">
            <div className="text-[11px] font-medium text-cyan-400 flex items-center gap-1">
              <span>Unread Alerts</span>
              {unreadCount > 0 && <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />}
            </div>
            <div className="text-xl font-bold font-mono text-cyan-300 mt-0.5">{unreadCount}</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/60">
            <div className="text-[11px] font-medium text-indigo-400">Applications Activity</div>
            <div className="text-xl font-bold font-mono text-slate-200 mt-0.5">
              {categoryCounts.applications || 0}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/60">
            <div className="text-[11px] font-medium text-sky-400">Interview Sessions</div>
            <div className="text-xl font-bold font-mono text-slate-200 mt-0.5">
              {categoryCounts.interviews || 0}
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Toolbar */}
      <div className="space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 google-photos-scrollbar">
            <button
              onClick={() => {
                setActiveCategory('all');
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                activeCategory === 'all'
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20'
                  : 'bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <span>All</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-black/30">
                {categoryCounts.all || totalCount}
              </span>
            </button>

            <button
              onClick={() => {
                setActiveCategory('unread');
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                activeCategory === 'unread'
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20'
                  : 'bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <span className="flex items-center gap-1">
                {unreadCount > 0 && <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />}
                Unread
              </span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                  unreadCount > 0 ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/40' : 'bg-black/30'
                }`}
              >
                {categoryCounts.unread || unreadCount}
              </span>
            </button>

            <button
              onClick={() => {
                setActiveCategory('applications');
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                activeCategory === 'applications'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <Users className="h-3.5 w-3.5 text-indigo-400" />
              <span>Applications</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-black/30">
                {categoryCounts.applications || 0}
              </span>
            </button>

            <button
              onClick={() => {
                setActiveCategory('interviews');
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                activeCategory === 'interviews'
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                  : 'bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <Calendar className="h-3.5 w-3.5 text-sky-400" />
              <span>Interviews</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-black/30">
                {categoryCounts.interviews || 0}
              </span>
            </button>

            <button
              onClick={() => {
                setActiveCategory('jobs');
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                activeCategory === 'jobs'
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-600/20'
                  : 'bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <Briefcase className="h-3.5 w-3.5 text-violet-400" />
              <span>Requisitions</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-black/30">
                {categoryCounts.jobs || 0}
              </span>
            </button>

            <button
              onClick={() => {
                setActiveCategory('company');
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                activeCategory === 'company'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <Building className="h-3.5 w-3.5 text-emerald-400" />
              <span>Company & Offers</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-black/30">
                {categoryCounts.company || 0}
              </span>
            </button>

            <button
              onClick={() => {
                setActiveCategory('system');
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                activeCategory === 'system'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                  : 'bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <Info className="h-3.5 w-3.5 text-amber-400" />
              <span>System & Policy</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-black/30">
                {categoryCounts.system || 0}
              </span>
            </button>
          </div>

          {/* Search & Sort Controls */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-60">
              <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search alerts..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="priority">Priority First</option>
            </select>
          </div>
        </div>

        {/* Batch Selection Banner */}
        <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={notifications.length > 0 && selectedIds.length === notifications.length}
                onChange={toggleSelectAll}
                className="rounded border-slate-700 text-cyan-600 focus:ring-0 cursor-pointer"
              />
              <span>
                {selectedIds.length > 0
                  ? `${selectedIds.length} of ${notifications.length} selected`
                  : 'Select all on this page'}
              </span>
            </label>
          </div>

          <div className="flex items-center gap-2">
            {selectedIds.length > 0 ? (
              <>
                <button
                  onClick={() => handleBulkAction('mark_read')}
                  disabled={bulkActionLoading}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <Eye className="h-3 w-3 text-cyan-400" />
                  <span>Mark Read</span>
                </button>

                <button
                  onClick={() => handleBulkAction('mark_unread')}
                  disabled={bulkActionLoading}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <EyeOff className="h-3 w-3 text-slate-400" />
                  <span>Mark Unread</span>
                </button>

                <button
                  onClick={() => handleBulkAction('delete')}
                  disabled={bulkActionLoading}
                  className="px-2.5 py-1 rounded-lg bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40 text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <Trash2 className="h-3 w-3 text-rose-400" />
                  <span>Delete Selected</span>
                </button>
              </>
            ) : (
              <button
                onClick={handleClearRead}
                className="px-2.5 py-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                title="Remove all already-read notifications"
              >
                <Trash2 className="h-3 w-3" />
                <span>Clear Read</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Notifications List Body */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="p-4 rounded-xl border border-slate-800/80 bg-slate-900/40 animate-pulse flex items-start gap-3.5"
            >
              <div className="h-4 w-4 bg-slate-800 rounded mt-1 shrink-0" />
              <div className="h-10 w-10 bg-slate-800 rounded-xl shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-800 rounded w-1/3" />
                <div className="h-3 bg-slate-800 rounded w-4/5" />
                <div className="h-3 bg-slate-800 rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="p-8 rounded-2xl border border-rose-900/40 bg-rose-950/20 text-center space-y-3">
          <AlertTriangle className="h-8 w-8 text-rose-400 mx-auto" />
          <h3 className="text-sm font-semibold text-rose-200">Unable to Load Notifications</h3>
          <p className="text-xs text-rose-300/80 max-w-md mx-auto">{error}</p>
          <button
            onClick={() => fetchNotifications()}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-900/60 hover:bg-rose-800/60 text-white transition-all cursor-pointer inline-flex items-center gap-1.5"
          >
            <RotateCw className="h-3.5 w-3.5" />
            <span>Retry Connection</span>
          </button>
        </div>
      ) : notifications.length === 0 ? (
        <div className="p-12 rounded-2xl border border-slate-800 bg-slate-900/30 text-center space-y-3">
          <div className="h-12 w-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mx-auto">
            <Bell className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-semibold text-white">No Notifications Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {activeCategory === 'unread'
              ? "You are completely caught up! No unread notifications pending."
              : searchQuery
              ? `No alerts match your search query "${searchQuery}".`
              : `No activity recorded in the ${activeCategory} category yet.`}
          </p>
          {activeCategory !== 'all' || searchQuery ? (
            <button
              onClick={() => {
                setActiveCategory('all');
                setSearchQuery('');
              }}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer inline-block mt-2"
            >
              Reset Filters
            </button>
          ) : (
            <button
              onClick={() => setSimModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white transition-colors cursor-pointer inline-flex items-center gap-1.5 mt-2"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Simulate Real Event</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2.5">
          {notifications.map((notif) => {
            const catMeta = getCategoryMeta(notif.category);
            const isSelected = selectedIds.includes(notif.id);

            return (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={`group relative p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                  notif.isRead
                    ? 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-900/80 hover:border-slate-700/80'
                    : 'bg-gradient-to-r from-slate-900/95 via-slate-900/90 to-cyan-950/20 border-cyan-800/60 shadow-sm shadow-cyan-950/20 hover:border-cyan-600/80'
                } ${isSelected ? 'ring-1 ring-cyan-500/50' : ''}`}
              >
                {/* Select Checkbox */}
                <div
                  onClick={(e) => toggleSelectOne(notif.id, e)}
                  className="mt-1 shrink-0 cursor-pointer pt-0.5"
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}}
                    className="rounded border-slate-700 text-cyan-600 focus:ring-0 cursor-pointer"
                  />
                </div>

                {/* Category Icon Badge */}
                <div
                  className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 border mt-0.5 ${catMeta.color}`}
                >
                  {catMeta.icon}
                </div>

                {/* Main Content Area */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {/* Unread indicator dot */}
                      {!notif.isRead && (
                        <span className="h-2 w-2 rounded-full bg-cyan-400 shrink-0 shadow-sm shadow-cyan-400/50" />
                      )}

                      <h4
                        className={`text-xs sm:text-sm font-semibold truncate ${
                          notif.isRead ? 'text-slate-300' : 'text-white'
                        }`}
                      >
                        {notif.title}
                      </h4>

                      {/* Priority Tag */}
                      {notif.priority === 'urgent' && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-950 text-rose-300 border border-rose-800/60 flex items-center gap-1 shrink-0">
                          <Flame className="h-3 w-3 text-rose-400 animate-pulse" />
                          Urgent
                        </span>
                      )}
                      {notif.priority === 'high' && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-800/60 shrink-0">
                          High
                        </span>
                      )}
                    </div>

                    {/* Relative timestamp */}
                    <div className="text-[11px] font-mono text-slate-400 shrink-0 flex items-center gap-1">
                      <Clock className="h-3 w-3 text-slate-500" />
                      <span title={new Date(notif.createdAt).toLocaleString()}>
                        {formatTimeAgo(notif.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Message Body */}
                  <p className="text-xs text-slate-300/90 leading-relaxed break-words">{notif.message}</p>

                  {/* Footer & Action Meta */}
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-[10px] font-mono">
                      <span className={`px-2 py-0.5 rounded border ${catMeta.color}`}>
                        {catMeta.label}
                      </span>
                      {notif.metadata?.candidateName && (
                        <span className="px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                          Candidate: {notif.metadata.candidateName}
                        </span>
                      )}
                      {notif.metadata?.jobId && (
                        <span className="px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                          Requisition: {notif.metadata.jobId}
                        </span>
                      )}
                    </div>

                    {/* Row Action Buttons */}
                    <div className="flex items-center gap-2">
                      {/* Deep Link Action */}
                      {notif.targetModule && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNotificationClick(notif);
                          }}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-cyan-950/80 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-800/60 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <span>{notif.actionLabel || 'View Record'}</span>
                          <ExternalLink className="h-3 w-3" />
                        </button>
                      )}

                      {/* Read / Unread toggle */}
                      {notif.isRead ? (
                        <button
                          onClick={(e) => handleMarkAsUnread(notif.id, e)}
                          title="Mark as unread"
                          className="p-1 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          <EyeOff className="h-3.5 w-3.5" />
                        </button>
                      ) : (
                        <button
                          onClick={(e) => handleMarkAsRead(notif.id, e)}
                          title="Mark as read"
                          className="p-1 rounded-lg text-cyan-400 hover:text-cyan-300 hover:bg-cyan-950/60 transition-colors cursor-pointer"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                      )}

                      {/* Delete / Dismiss */}
                      <button
                        onClick={(e) => handleDeleteNotification(notif.id, e)}
                        title="Dismiss notification"
                        className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-3 py-3 border-t border-slate-800 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span>
              Page <strong className="text-white">{page}</strong> of{' '}
              <strong className="text-white">{totalPages}</strong>
            </span>
            <span className="text-slate-600">|</span>
            <span className="hidden sm:inline">
              Showing {(page - 1) * limit + 1} - {Math.min(page * limit, totalCount)} of {totalCount}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center gap-1"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Previous</span>
            </button>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>Next</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Event Simulation Test Modal */}
      {simModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 text-slate-100 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-violet-400" />
                <h3 className="text-sm font-bold text-white">Simulate Real Business Event</h3>
              </div>
              <button
                onClick={() => setSimModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Trigger a realistic backend business event to verify instant in-app delivery, unread counter badge
              incrementing, and recipient ownership verification.
            </p>

            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-400">Select Event Scenario:</label>
              <div className="space-y-2">
                {[
                  {
                    id: 'new_application',
                    title: 'New Candidate Application',
                    desc: 'Maya Lin applied for Senior Distributed Systems Engineer (ATS 95%).',
                  },
                  {
                    id: 'interview_reschedule_requested',
                    title: 'Candidate Reschedule Request',
                    desc: 'Alex Chen requested to reschedule System Design interview round.',
                  },
                  {
                    id: 'offer_accepted',
                    title: 'Employment Offer Accepted',
                    desc: 'Candidate accepted $210,000 USD employment offer package.',
                  },
                  {
                    id: 'job_approved',
                    title: 'Admin Moderation Approval',
                    desc: 'Admin approved job requisition and transitioned state to Active.',
                  },
                  {
                    id: 'company_verification_approved',
                    title: 'Employer Verification Approved',
                    desc: 'Compliance audit passed and verified employer status was granted.',
                  },
                ].map((item) => (
                  <label
                    key={item.id}
                    onClick={() => setSimEventType(item.id)}
                    className={`block p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      simEventType === item.id
                        ? 'bg-violet-950/60 border-violet-600 text-white'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="font-semibold flex items-center justify-between">
                      <span>{item.title}</span>
                      {simEventType === item.id && <Check className="h-3.5 w-3.5 text-violet-400" />}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">{item.desc}</div>
                  </label>
                ))}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setSimModalOpen(false)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={simLoading}
                onClick={handleTriggerTestEvent}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white transition-all shadow-md shadow-violet-600/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {simLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                <span>Dispatch Event</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
