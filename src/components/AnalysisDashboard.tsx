import React from 'react';
import { Scale, AlertCircle, TrendingDown, DollarSign, ShieldAlert, ArrowRight, CheckCircle2, Sparkles, Layers } from 'lucide-react';
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

  const getRiskPip = (band: string) => {
    switch (band) {
      case 'Critical': return 'pip crit dot';
      case 'High': return 'pip warn dot';
      case 'Moderate': return 'pip info';
      default: return 'pip ok';
    }
  };

  return (
    <div className="p-5 max-w-7xl mx-auto space-y-5 animate-fade-in">
      {/* Hero Header Sub-Panel */}
      <div className="sub border-l-4 border-l-[var(--signal)]">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="pip live dot">Capability F5</span>
              <span className="mono text-xs text-[var(--ink-3)]">CASE CONSOLE: {activeCase.id}</span>
            </div>
            <h1 className="text-2xl font-extrabold text-[var(--ink)] tracking-tight">
              {activeCase.title}
            </h1>
            <p className="text-[var(--ink-2)] text-xs mt-1">
              Trade Class: <b className="text-[var(--ink)]">{activeCase.trade}</b> | Charter Type: <b className="text-[var(--ink)]">{activeCase.charterType}</b> | Effective Date: <b className="text-[var(--ink)] font-mono">{activeCase.effectiveDate}</b>
            </p>
          </div>

          <button
            onClick={() => onNavigateToSmeReview()}
            className="btn btn-primary shadow-lg flex items-center gap-2 whitespace-nowrap"
          >
            <span>Open SME Review Workspace (F6)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Metrics Rail (4 Columns) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Metric 1: Case Risk Score */}
        <div className="sub flex flex-col justify-between">
          <div className="sub-h">
            <b>Case Risk Score</b>
            <span className={getRiskPip(riskBand)}>{riskBand}</span>
          </div>

          <div className="my-2">
            <div className="kpi-v text-[var(--ink)]">{caseScore} <span className="text-xs text-[var(--ink-3)] font-mono font-normal">/ 100</span></div>
            <div className="kpi-s">Noisy-OR Risk Aggregation</div>
          </div>

          <div className="meter-bar mt-2">
            <i
              className="transition-all duration-500"
              style={{
                width: `${caseScore}%`,
                background: caseScore >= 75 ? 'var(--rose)' : caseScore >= 50 ? 'var(--amber)' : 'var(--signal)'
              }}
            />
          </div>
          {caseScore >= 75 && (
            <div className="text-[11px] text-[var(--rose)] mt-2 font-mono flex items-center gap-1 font-semibold">
              <ShieldAlert className="w-3.5 h-3.5" /> Enforced floor (Critical gap present)
            </div>
          )}
        </div>

        {/* Metric 2: Total Exposure */}
        <div className="sub flex flex-col justify-between">
          <div className="sub-h">
            <b>Total Quantified Exposure</b>
            <DollarSign className="w-4 h-4 text-[var(--rose)]" />
          </div>

          <div className="my-2">
            <div className="kpi-v text-[var(--rose)]">${(totalExpectedLoss / 1000).toFixed(0)}k</div>
            <div className="kpi-s">Expected Loss ($EL = p \times E$)</div>
          </div>

          <div className="text-xs text-[var(--ink-3)] border-t border-[var(--edge)] pt-2 flex justify-between font-mono">
            <span>Range: $250k – $1.4M</span>
            <span className="text-[var(--rose)] font-semibold">P90 Exposure</span>
          </div>
        </div>

        {/* Metric 3: Reducible Loss */}
        <div className="sub flex flex-col justify-between">
          <div className="sub-h">
            <b>Reducible Exposure</b>
            <TrendingDown className="w-4 h-4 text-[var(--good)]" />
          </div>

          <div className="my-2">
            <div className="kpi-v text-[var(--good)]">${(reducibleLoss / 1000).toFixed(0)}k</div>
            <div className="kpi-s">Achievable via recommendations</div>
          </div>

          <div className="text-xs text-[var(--good)] border-t border-[var(--edge)] pt-2 flex items-center gap-1 font-mono">
            <CheckCircle2 className="w-3.5 h-3.5" /> 75% Expected Risk Reduction
          </div>
        </div>

        {/* Metric 4: Findings Count */}
        <div className="sub flex flex-col justify-between">
          <div className="sub-h">
            <b>Active Findings</b>
            <AlertCircle className="w-4 h-4 text-[var(--amber)]" />
          </div>

          <div className="my-2 flex items-baseline gap-2">
            <div className="kpi-v text-[var(--ink)]">{activeCase.findings.length}</div>
            <div className="kpi-s">Clause Gaps</div>
          </div>

          <div className="text-xs border-t border-[var(--edge)] pt-2 flex items-center justify-between font-mono">
            <span className="text-[var(--rose)] font-bold">1 Critical</span>
            <span className="text-[var(--amber)] font-bold">1 High</span>
            <span className="text-[var(--cyan)] font-bold">1 Medium</span>
          </div>
        </div>
      </div>

      {/* Prioritized Findings Console Rows */}
      <div className="sub space-y-4">
        <div className="sub-h">
          <b>Prioritized Findings & Quantified Recommendations ({activeCase.findings.length})</b>
          <span>Ranked by Risk Reduction / Effort</span>
        </div>

        <div className="rows">
          {activeCase.findings.map((finding: Finding) => {
            const el = calculateFindingExpectedLoss(finding);
            const rowClass = finding.severity === 'Critical' ? 'crit' : finding.severity === 'High' ? 'warn' : 'info';
            return (
              <div
                key={finding.id}
                className={`row ${rowClass} grid grid-cols-1 md:grid-cols-12 gap-3 p-4`}
              >
                <div className="md:col-span-8 space-y-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`pip ${finding.severity === 'Critical' ? 'crit' : 'warn'}`}>
                      {finding.severity} SEVERITY
                    </span>
                    <span className="pip info">{finding.type}</span>
                    <span className="mono text-xs text-[var(--ink-3)]">ID: {finding.id}</span>
                  </div>

                  <span className="rt">{finding.rationale}</span>
                  
                  <div className="flex items-center gap-2 text-[11px] text-[var(--ink-3)] font-mono pt-1">
                    <span>Rule: <strong className="text-[var(--cyan)]">{finding.ruleIds.join(', ')}</strong></span>
                    <span>•</span>
                    <span>Pattern: <strong className="text-[var(--violet)]">{finding.patternIds.join(', ')}</strong></span>
                    <span>•</span>
                    <span>Confidence: <strong className="text-[var(--good)]">{(finding.confidence * 100).toFixed(0)}%</strong></span>
                  </div>
                </div>

                <div className="md:col-span-4 flex flex-col justify-between items-end gap-2 text-right">
                  <div>
                    <div className="text-xs text-[var(--ink-2)]">Expected Loss:</div>
                    <div className="mono text-lg font-bold text-[var(--rose)]">${(el.likely / 1000).toFixed(0)}k</div>
                  </div>

                  <button
                    onClick={() => onNavigateToSmeReview(finding.id)}
                    className="btn btn-secondary py-1 px-3 text-xs"
                  >
                    Review & Simulate (F6)
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
