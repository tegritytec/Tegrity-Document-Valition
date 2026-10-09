import React from 'react';
import { Scale, AlertCircle, TrendingDown, DollarSign, ShieldAlert, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import { CaseData, Finding } from '../types/tdv';
import { calculateCaseScoreAndBand, calculateFindingExpectedLoss } from '../services/scoringEngine';

interface AnalysisDashboardProps {
  activeCase: CaseData;
  onNavigateToSmeReview: (findingId?: string) => void;
}

export const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({
  activeCase,
  onNavigateToSmeReview
}) => {
  const { caseScore, riskBand, totalExpectedLoss, reducibleLoss } = calculateCaseScoreAndBand(activeCase.findings);

  const getRiskBandBadge = (band: string) => {
    switch (band) {
      case 'Critical': return 'badge-critical';
      case 'High': return 'badge-high';
      case 'Moderate': return 'badge-moderate';
      default: return 'badge-low';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Top Summary Header Banner */}
      <div className="glass-panel p-6 border-l-4 border-l-rose-500 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-rose-400 font-semibold uppercase tracking-wider mb-1">
            <Scale className="w-4 h-4" /> Capability F5 — Quantified Risk & Findings Dashboard
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            {activeCase.title}
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Trade: <span className="text-slate-200 font-medium">{activeCase.trade}</span> | Charter Type: <span className="text-slate-200 font-medium">{activeCase.charterType}</span> | Effective: <span className="text-slate-200 font-medium">{activeCase.effectiveDate}</span>
          </p>
        </div>

        <button
          onClick={() => onNavigateToSmeReview()}
          className="btn btn-primary px-6 py-3 text-sm font-bold shadow-lg shadow-sky-500/25 flex items-center gap-2 whitespace-nowrap"
        >
          <span>Open SME Review Workspace (F6)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        {/* Card 1: Case Risk Score */}
        <div className="glass-panel p-5 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Case Risk Score (0-100)</span>
            <span className={`badge ${getRiskBandBadge(riskBand)}`}>{riskBand} Risk</span>
          </div>

          <div className="my-3 flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-white tracking-tight">{caseScore}</span>
            <span className="text-xs text-slate-500">/ 100 (Noisy-OR)</span>
          </div>

          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                caseScore >= 75 ? 'bg-rose-500' : caseScore >= 50 ? 'bg-orange-500' : caseScore >= 25 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${caseScore}%` }}
            />
          </div>
          {caseScore >= 75 && (
            <p className="text-[11px] text-rose-400 mt-2 font-medium flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" /> Enforced floor (Critical gap present)
            </p>
          )}
        </div>

        {/* Card 2: Total Quantified Exposure */}
        <div className="glass-panel p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Total Quantified Exposure</span>
            <DollarSign className="w-4 h-4 text-rose-400" />
          </div>

          <div className="my-3">
            <div className="text-3xl font-extrabold text-white tracking-tight">
              ${(totalExpectedLoss / 1000).toFixed(0)}k
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Expected Loss ($EL = p \times E$)</div>
          </div>

          <div className="text-xs text-slate-500 border-t border-slate-800 pt-2 flex justify-between">
            <span>Range: $250k – $1.4M</span>
            <span className="text-rose-400">P90 Exposure</span>
          </div>
        </div>

        {/* Card 3: Reducible Risk */}
        <div className="glass-panel p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Reducible Exposure</span>
            <TrendingDown className="w-4 h-4 text-emerald-400" />
          </div>

          <div className="my-3">
            <div className="text-3xl font-extrabold text-emerald-400 tracking-tight">
              ${(reducibleLoss / 1000).toFixed(0)}k
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Achievable via recommendations</div>
          </div>

          <div className="text-xs text-emerald-400 border-t border-slate-800 pt-2 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> 75% Expected Risk Reduction
          </div>
        </div>

        {/* Card 4: Findings Count */}
        <div className="glass-panel p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Active Findings</span>
            <AlertCircle className="w-4 h-4 text-amber-400" />
          </div>

          <div className="my-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{activeCase.findings.length}</span>
            <span className="text-xs text-slate-400">Total Clause Gaps</span>
          </div>

          <div className="text-xs text-slate-400 border-t border-slate-800 pt-2 flex items-center justify-between">
            <span className="text-rose-400 font-semibold">1 Critical</span>
            <span className="text-orange-400 font-semibold">1 High</span>
            <span className="text-amber-400 font-semibold">1 Medium</span>
          </div>
        </div>
      </div>

      {/* Findings List */}
      <div className="glass-panel p-6 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            Prioritized Findings & Recommendations ({activeCase.findings.length})
          </h3>
          <span className="text-xs text-slate-400">Ranked by Risk Reduction per Effort</span>
        </div>

        <div className="space-y-4">
          {activeCase.findings.map((finding: Finding) => {
            const el = calculateFindingExpectedLoss(finding);
            return (
              <div
                key={finding.id}
                className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className={`badge badge-${finding.severity.toLowerCase()}`}>
                      {finding.severity} Severity
                    </span>
                    <span className="badge badge-blue">{finding.type}</span>
                    <span className="text-xs font-mono text-slate-400">Finding ID: {finding.id}</span>
                  </div>

                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-slate-400">
                      Expected Loss: <span className="text-rose-400 font-bold">${(el.likely / 1000).toFixed(0)}k</span>
                    </span>
                    <span className="text-slate-400">
                      Score: <span className="text-white font-bold">{finding.findingScore}/100</span>
                    </span>
                    <button
                      onClick={() => onNavigateToSmeReview(finding.id)}
                      className="btn btn-secondary py-1 px-3 text-xs text-sky-400 border-sky-500/30 hover:bg-sky-950/40"
                    >
                      Review & Simulate (F6)
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  {/* Left: Cited Rules & Rationale */}
                  <div className="md:col-span-7 space-y-2">
                    <div className="text-xs text-slate-300 font-medium">{finding.rationale}</div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <span>Cited Rule: <strong className="text-sky-400">{finding.ruleIds.join(', ')}</strong></span>
                      <span>•</span>
                      <span>Matched Pattern: <strong className="text-purple-400">{finding.patternIds.join(', ')}</strong></span>
                      <span>•</span>
                      <span>Confidence: <strong className="text-emerald-400">{(finding.confidence * 100).toFixed(0)}%</strong></span>
                    </div>
                  </div>

                  {/* Right: Recommended Action & Proposed Text */}
                  <div className="md:col-span-5 p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-sky-400 uppercase tracking-wider">
                        Action: {finding.recommendationAction.toUpperCase()}
                      </span>
                      <span className="text-slate-500">Negotiation Effort: {finding.estimatedEffort}/5</span>
                    </div>
                    <p className="text-xs text-slate-300 font-mono leading-relaxed line-clamp-3">
                      "{finding.proposedText}"
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
