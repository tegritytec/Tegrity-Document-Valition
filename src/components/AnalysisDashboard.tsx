import React from 'react';
import { Scale, AlertCircle, TrendingDown, DollarSign, ShieldAlert, ArrowRight, CheckCircle2, Sparkles, Briefcase, FileSpreadsheet } from 'lucide-react';
import { CaseData, Finding } from '../types/tdv';
import { calculateCaseScoreAndBand, calculateFindingExpectedLoss } from '../services/scoringEngine';

interface AnalysisDashboardProps {
  activeCase: CaseData;
  viewMode: 'executive' | 'tactical';
  onNavigateToSmeReview: (findingId?: string) => void;
  onNavigateToReports: () => void;
}

export const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({
  activeCase,
  viewMode,
  onNavigateToSmeReview,
  onNavigateToReports
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
      {/* Top Banner */}
      <div className="glass-panel p-6 border-l-4 border-l-sky-500 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-sky-400 font-semibold uppercase tracking-wider mb-1">
            <Briefcase className="w-4 h-4" /> {viewMode === 'executive' ? 'Executive Command Dashboard' : 'Operational Risk View'}
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            {activeCase.title}
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Trade: <span className="text-slate-200 font-semibold">{activeCase.trade}</span> | Type: <span className="text-slate-200 font-semibold">{activeCase.charterType}</span> | Effective Date: <span className="text-slate-200 font-mono">{activeCase.effectiveDate}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateToReports}
            className="btn btn-secondary text-xs flex items-center gap-2 font-bold"
          >
            <FileSpreadsheet className="w-4 h-4 text-sky-400" />
            <span>Export Executive Brief (F9)</span>
          </button>
          <button
            onClick={() => onNavigateToSmeReview()}
            className="btn btn-primary px-5 py-2.5 text-xs font-bold shadow-lg flex items-center gap-2"
          >
            <span>Review & Simulate (F6)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Cards Row (4 Columns) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        {/* Card 1: Risk Score Dial */}
        <div className="exec-card flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">Case Risk Score</span>
            <span className={`badge ${getRiskBandBadge(riskBand)}`}>{riskBand}</span>
          </div>

          <div className="my-3 flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-white tracking-tight">{caseScore}</span>
            <span className="text-xs text-slate-500 font-mono">/ 100</span>
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

        {/* Card 2: Total Exposure */}
        <div className="exec-card flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">Quantified Financial Exposure</span>
            <DollarSign className="w-4 h-4 text-rose-400" />
          </div>

          <div className="my-3">
            <div className="text-3xl font-extrabold text-white tracking-tight">
              ${(totalExpectedLoss / 1000).toFixed(0)}k
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Expected Loss ($EL = p \times E$)</div>
          </div>

          <div className="text-xs text-slate-500 border-t border-slate-800 pt-2 flex justify-between font-mono">
            <span>Range: $250k – $1.4M</span>
            <span className="text-rose-400 font-semibold">P90 Exposure</span>
          </div>
        </div>

        {/* Card 3: Reducible Loss */}
        <div className="exec-card flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">Reducible Financial Risk</span>
            <TrendingDown className="w-4 h-4 text-emerald-400" />
          </div>

          <div className="my-3">
            <div className="text-3xl font-extrabold text-emerald-400 tracking-tight">
              ${(reducibleLoss / 1000).toFixed(0)}k
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Achievable via recommendations</div>
          </div>

          <div className="text-xs text-emerald-400 border-t border-slate-800 pt-2 flex items-center gap-1 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" /> 75% Achievable Risk Reduction
          </div>
        </div>

        {/* Card 4: Gaps Summary */}
        <div className="exec-card flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">Contract Compliance Gaps</span>
            <AlertCircle className="w-4 h-4 text-amber-400" />
          </div>

          <div className="my-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{activeCase.findings.length}</span>
            <span className="text-xs text-slate-400">Total Findings</span>
          </div>

          <div className="text-xs text-slate-400 border-t border-slate-800 pt-2 flex items-center justify-between font-semibold">
            <span className="text-rose-400">1 Critical</span>
            <span className="text-amber-400">1 High</span>
            <span className="text-sky-400">1 Medium</span>
          </div>
        </div>
      </div>

      {/* Prioritized Findings Cards */}
      <div className="glass-panel p-6 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            Prioritized Findings & Recommendations ({activeCase.findings.length})
          </h3>
          <span className="text-xs text-slate-400 font-medium">Ranked by Risk Reduction per Unit Effort</span>
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
                    <span className="text-xs font-mono text-slate-400">ID: {finding.id}</span>
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
                  <div className="md:col-span-7 space-y-2">
                    <div className="text-xs text-slate-300 font-medium">{finding.rationale}</div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                      <span>Cited Rule: <strong className="text-sky-400">{finding.ruleIds.join(', ')}</strong></span>
                      <span>•</span>
                      <span>Matched Pattern: <strong className="text-purple-400">{finding.patternIds.join(', ')}</strong></span>
                      <span>•</span>
                      <span>Confidence: <strong className="text-emerald-400">{(finding.confidence * 100).toFixed(0)}%</strong></span>
                    </div>
                  </div>

                  <div className="md:col-span-5 p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-sky-400 uppercase tracking-wider">
                        Action: {finding.recommendationAction.toUpperCase()}
                      </span>
                      <span className="text-slate-500">Effort Rating: {finding.estimatedEffort}/5</span>
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
