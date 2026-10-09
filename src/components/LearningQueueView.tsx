import React, { useState } from 'react';
import { BrainCircuit, ShieldCheck, CheckCircle2, XCircle, ArrowRight, Layers, Lock, Sparkles } from 'lucide-react';
import { LearningPackage } from '../types/tdv';

interface LearningQueueViewProps {
  learningQueue: LearningPackage[];
  onCuratePackage: (pkgId: string, action: 'Approved' | 'Merged' | 'Rejected') => void;
}

export const LearningQueueView: React.FC<LearningQueueViewProps> = ({
  learningQueue,
  onCuratePackage
}) => {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Top Banner */}
      <div className="glass-panel p-6 border-l-4 border-l-indigo-500 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-indigo-400 font-semibold uppercase tracking-wider mb-1">
            <BrainCircuit className="w-4 h-4" /> Capability F8 — Self-Learning Loop & Curator Queue
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Clause Intelligence Enrichment Pipeline
          </h2>
          <p className="text-slate-400 text-sm mt-1 max-w-3xl">
            Ratified SME reviews flow back into F2 clause intelligence. All items pass through a mandatory NER anonymization gate and <span className="text-indigo-300 font-semibold">k-anonymity check (k ≥ 5)</span> before Curator sign-off.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-indigo-950/40 border border-indigo-800/60 px-4 py-2 rounded-xl text-xs text-indigo-300">
          <ShieldCheck className="w-4 h-4 text-indigo-400" />
          <span>Curator Privacy Gate Active</span>
        </div>
      </div>

      {/* Queue Items */}
      <div className="space-y-4">
        {learningQueue.map((pkg) => (
          <div
            key={pkg.id}
            className="glass-panel p-6 space-y-4 border border-slate-800 hover:border-indigo-500/40 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-indigo-400 font-bold">{pkg.id}</span>
                <span className="badge badge-blue">{pkg.clauseCategory}</span>
                <span className="text-xs text-slate-400 font-mono">Source Decision: {pkg.sourceDecisionId}</span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> k-Anonymity Verified (k={pkg.kLevelAchieved})
                </span>
                <span className={`badge ${
                  pkg.curatorAction === 'Approved' ? 'badge-low' : pkg.curatorAction === 'Rejected' ? 'badge-critical' : 'badge-moderate'
                }`}>
                  Status: {pkg.curatorAction}
                </span>
              </div>
            </div>

            {/* Anonymized Payload */}
            <div className="space-y-1">
              <div className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                <Lock className="w-3 h-3 text-indigo-400" /> Redacted & Tokenized Clause Wording (PII Strip):
              </div>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 leading-relaxed">
                "{pkg.anonymizedPayload}"
              </div>
            </div>

            {/* Actions for Curator */}
            {pkg.curatorAction === 'Pending' && (
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => onCuratePackage(pkg.id, 'Rejected')}
                  className="btn btn-secondary text-xs text-rose-400 border-rose-500/30"
                >
                  <XCircle className="w-3.5 h-3.5" /> Reject Package
                </button>
                <button
                  onClick={() => onCuratePackage(pkg.id, 'Approved')}
                  className="btn btn-primary text-xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Approve & Publish to F2
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
