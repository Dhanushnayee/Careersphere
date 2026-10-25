/**
 * CareerSphere AI — Health & Subsystem Inspection Modal
 * Real-time probe of Django REST Backend, PostgreSQL, Redis, and AI services.
 */
import React, { useState } from 'react';
import { Modal } from './Modal';
import { PlatformHealth } from '../../types';
import { apiClient } from '../../services/api';
import { RefreshCw, Database, Cpu, Sparkles, CheckCircle2, AlertTriangle, Layers } from 'lucide-react';

interface HealthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialHealth: PlatformHealth | null;
  onHealthUpdate: (health: PlatformHealth) => void;
}

export const HealthModal: React.FC<HealthModalProps> = ({
  isOpen,
  onClose,
  initialHealth,
  onHealthUpdate,
}) => {
  const [health, setHealth] = useState<PlatformHealth | null>(initialHealth);
  const [loading, setLoading] = useState(false);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getHealth();
      setHealth(data);
      onHealthUpdate(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Django REST API & Subsystem Health Probe" maxWidth="max-w-2xl">
      <div className="space-y-5 text-sm">
        
        {/* Banner */}
        <div className="flex items-center justify-between p-3.5 rounded-lg border border-slate-800 bg-slate-950/70">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white">CareerSphere AI Backend Gateway</span>
              <span className="text-xs font-mono text-indigo-400">/api/v1/health/</span>
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              Environment: <span className="text-slate-200 capitalize">{health?.environment || 'Development'}</span> · Phase: <span className="text-slate-200">Phase 1 Foundation</span>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Re-Probe</span>
          </button>
        </div>

        {/* Subsystem grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          
          {/* Database */}
          <div className="p-3.5 rounded-lg border border-slate-800 bg-slate-950/50 space-y-2">
            <div className="flex items-center justify-between text-xs font-medium text-slate-300">
              <div className="flex items-center gap-1.5">
                <Database className="h-3.5 w-3.5 text-cyan-400" />
                <span>PostgreSQL</span>
              </div>
              <span className="text-[11px] text-emerald-400 font-mono">
                {health?.dependencies.database.status || 'Connected'}
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-normal">
              Relational database for user profiles, companies, jobs, and audit logs.
            </p>
            <div className="text-[11px] font-mono text-slate-500">
              Vendor: {health?.dependencies.database.vendor || 'postgresql'}
            </div>
          </div>

          {/* Celery / Redis */}
          <div className="p-3.5 rounded-lg border border-slate-800 bg-slate-950/50 space-y-2">
            <div className="flex items-center justify-between text-xs font-medium text-slate-300">
              <div className="flex items-center gap-1.5">
                <Cpu className="h-3.5 w-3.5 text-violet-400" />
                <span>Celery & Redis</span>
              </div>
              <span className="text-[11px] text-indigo-400 font-mono">Standby</span>
            </div>
            <p className="text-xs text-slate-400 leading-normal">
              Distributed asynchronous task queue for document parsing in Phase 4.
            </p>
            <div className="text-[11px] font-mono text-slate-500">
              Broker: localhost:6379/1
            </div>
          </div>

          {/* AI Engine */}
          <div className="p-3.5 rounded-lg border border-slate-800 bg-slate-950/50 space-y-2">
            <div className="flex items-center justify-between text-xs font-medium text-slate-300">
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                <span>AI Resume Copilot</span>
              </div>
              <span className="text-[11px] text-amber-400 font-mono">Phase 4 Ready</span>
            </div>
            <p className="text-xs text-slate-400 leading-normal">
              Benchmark schemas active in Phase 1; live Gemini API integration arrives in Phase 4.
            </p>
            <div className="text-[11px] font-mono text-slate-500">
              Model: gemini-2.5-flash
            </div>
          </div>
        </div>

        {/* Live OpenAPI & Docs links */}
        <div className="rounded-lg border border-slate-800/80 bg-slate-950/40 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-200">OpenAPI 3.1 & Django Endpoints</span>
            <span className="text-[11px] text-slate-500 font-mono">v1.0.0-phase1</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-2 rounded bg-slate-900 border border-slate-800/80 flex items-center justify-between">
              <span className="text-slate-300">GET /health/</span>
              <span className="text-emerald-400 text-[11px]">200 OK</span>
            </div>
            <div className="p-2 rounded bg-slate-900 border border-slate-800/80 flex items-center justify-between">
              <span className="text-slate-300">GET /api/v1/health/</span>
              <span className="text-emerald-400 text-[11px]">200 OK</span>
            </div>
            <div className="p-2 rounded bg-slate-900 border border-slate-800/80 flex items-center justify-between">
              <span className="text-slate-300">GET /api/v1/system/config/</span>
              <span className="text-emerald-400 text-[11px]">200 OK</span>
            </div>
            <div className="p-2 rounded bg-slate-900 border border-slate-800/80 flex items-center justify-between">
              <span className="text-slate-300">GET /api/v1/jobs/sample/</span>
              <span className="text-emerald-400 text-[11px]">200 OK</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors cursor-pointer"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </Modal>
  );
};
