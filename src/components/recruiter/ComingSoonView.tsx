import React from 'react';
import { Sparkles, ArrowRight, Lock, Clock } from 'lucide-react';

interface ComingSoonViewProps {
  moduleName: string;
  modulePhase: string;
  description: string;
  plannedFeatures: string[];
  onNavigateHome: () => void;
}

export const ComingSoonView: React.FC<ComingSoonViewProps> = ({
  moduleName,
  modulePhase,
  description,
  plannedFeatures,
  onNavigateHome,
}) => {
  return (
    <div className="p-8 sm:p-12 rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/20 text-slate-100 text-left max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-2xl bg-cyan-950/80 border border-cyan-800/60 flex items-center justify-center text-cyan-400 shadow-md shadow-cyan-600/20">
          <Clock className="h-6 w-6" />
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
            {modulePhase} Roadmap Capability
          </div>
          <h2 className="text-2xl font-bold text-white mt-0.5">{moduleName}</h2>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs sm:text-sm text-slate-300 leading-relaxed">
        {description}
      </div>

      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Planned Deliverables in the Next Release Phase:
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {plannedFeatures.map((feat, idx) => (
            <div key={idx} className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300">
              <Sparkles className="h-4 w-4 text-cyan-400 shrink-0" />
              <span>{feat}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
        <span className="text-[11px] text-slate-500 font-mono">
          Honest Status: Under Active Engineering (Phase 1 Foundation Live)
        </span>
        <button
          onClick={onNavigateHome}
          className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <span>Return to Dashboard</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};
