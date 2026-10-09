import React from 'react';
import { BrainCircuit, CheckCircle2, XCircle, Lock } from 'lucide-react';
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
    <div className="p-5 max-w-7xl mx-auto space-y-5 animate-fade-in">
      {/* Top Banner Sub-Panel */}
      <div className="sub border-l-4 border-l-[var(--violet)]">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="pip live dot">Capability F8</span>
              <span className="mono text-xs text-[var(--ink-3)]">SELF-LEARNING FEEDBACK LOOP</span>
            </div>
            <h1 className="text-2xl font-extrabold text-[var(--ink)] tracking-tight">
              Clause Intelligence Enrichment Pipeline
            </h1>
            <p className="text-[var(--ink-2)] text-xs mt-1 max-w-3xl">
              Ratified SME reviews flow back into F2 clause intelligence. All items pass through a mandatory NER anonymization gate and <span className="text-[var(--violet)] font-semibold font-mono">k-anonymity check (k ≥ 5)</span> before Curator sign-off.
            </p>
          </div>

          <span className="pip live dot">Curator Privacy Gate Active</span>
        </div>
      </div>

      {/* Queue Items */}
      <div className="space-y-4">
        {learningQueue.map((pkg) => (
          <div key={pkg.id} className="sub space-y-4">
            <div className="sub-h">
              <div className="flex items-center gap-3 font-mono">
                <span className="text-[var(--violet)] font-bold">{pkg.id}</span>
                <span className="chip">{pkg.clauseCategory}</span>
                <span className="text-[var(--ink-3)] text-xs">Source Decision: {pkg.sourceDecisionId}</span>
              </div>

              <div className="flex items-center gap-3">
                <span className="pip ok font-mono">k-Anonymity Verified (k={pkg.kLevelAchieved})</span>
                <span className={`pip ${pkg.curatorAction === 'Approved' ? 'ok' : pkg.curatorAction === 'Rejected' ? 'crit' : 'warn'}`}>
                  Status: {pkg.curatorAction}
                </span>
              </div>
            </div>

            {/* Anonymized Payload */}
            <div className="space-y-1">
              <div className="text-[11px] text-[var(--ink-3)] flex items-center gap-1 font-mono">
                <Lock className="w-3 h-3 text-[var(--violet)]" /> Redacted & Tokenized Clause Wording (PII Strip):
              </div>
              <div className="p-4 rounded bg-[var(--abyss)] border border-[var(--edge)] font-mono text-xs text-[var(--ink-2)] leading-relaxed">
                "{pkg.anonymizedPayload}"
              </div>
            </div>

            {/* Actions */}
            {pkg.curatorAction === 'Pending' && (
              <div className="flex items-center justify-end gap-3 pt-1">
                <button
                  onClick={() => onCuratePackage(pkg.id, 'Rejected')}
                  className="btn btn-secondary text-xs text-[var(--rose)] border-[var(--rose)]"
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
