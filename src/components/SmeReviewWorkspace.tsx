import React, { useState } from 'react';
import { 
  Sliders, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Edit3, 
  MessageSquare, 
  Sparkles, 
  RotateCcw, 
  Save, 
  Layers, 
  ShieldCheck, 
  AlertTriangle, 
  Send,
  HelpCircle,
  Copy
} from 'lucide-react';
import { CaseData, Finding, WhatIfScenario, Role } from '../types/tdv';
import { calculateCaseScoreAndBand, calculateFindingExpectedLoss, calculateFindingScore } from '../services/scoringEngine';
import confetti from 'canvas-confetti';

interface SmeReviewWorkspaceProps {
  activeCase: CaseData;
  currentRole: Role;
  onUpdateFinding: (updatedFinding: Finding) => void;
  onSaveScenario: (scenario: WhatIfScenario) => void;
  onRatifyCase: (tier: 'T1 Standard' | 'T2 Elevated' | 'T3 Critical', note: string) => void;
}

export const SmeReviewWorkspace: React.FC<SmeReviewWorkspaceProps> = ({
  activeCase,
  currentRole,
  onUpdateFinding,
  onSaveScenario,
  onRatifyCase
}) => {
  const [selectedFindingId, setSelectedFindingId] = useState<string>(activeCase.findings[0]?.id || '');
  const [activeDocTab, setActiveDocTab] = useState<string>(activeCase.documents[0]?.id || '');
  
  // What-If Simulator state
  const [whatIfText, setWhatIfText] = useState<string>('');
  const [whatIfExposure, setWhatIfExposure] = useState<number>(500000);
  const [whatIfProbability, setWhatIfProbability] = useState<number>(0.5);
  const [scenarioName, setScenarioName] = useState<string>('Custom What-If Scenario');
  const [showScenarioMatrix, setShowScenarioMatrix] = useState<boolean>(false);
  const [ratificationNote, setRatificationNote] = useState<string>('');
  const [showRatifyModal, setShowRatifyModal] = useState<boolean>(false);

  const selectedFinding = activeCase.findings.find(f => f.id === selectedFindingId) || activeCase.findings[0];
  const selectedDoc = activeCase.documents.find(d => d.id === activeDocTab) || activeCase.documents[0];

  // Set default What-If state when finding changes
  React.useEffect(() => {
    if (selectedFinding) {
      setWhatIfText(selectedFinding.proposedText);
      setWhatIfExposure(selectedFinding.exposureUsd.likely);
      setWhatIfProbability(selectedFinding.probability);
    }
  }, [selectedFindingId]);

  // Compute live What-If simulated finding & case score
  const simulatedFinding: Finding | null = selectedFinding ? {
    ...selectedFinding,
    proposedText: whatIfText,
    probability: whatIfProbability,
    exposureUsd: {
      low: Math.round(whatIfExposure * 0.6),
      likely: whatIfExposure,
      high: Math.round(whatIfExposure * 1.8)
    }
  } : null;

  const simulatedFindingScore = simulatedFinding ? calculateFindingScore(simulatedFinding) : 0;

  // Calculate live simulated case score
  const simulatedFindingsList = activeCase.findings.map(f => 
    f.id === selectedFindingId && simulatedFinding ? simulatedFinding : f
  );
  const simulatedCaseResult = calculateCaseScoreAndBand(simulatedFindingsList);

  // Determine Ratification Tier (T1, T2, T3)
  const determineTier = (): 'T1 Standard' | 'T2 Elevated' | 'T3 Critical' => {
    const el = simulatedCaseResult.totalExpectedLoss;
    const band = simulatedCaseResult.riskBand;
    if (band === 'Critical' || el >= 1000000) return 'T3 Critical';
    if (band === 'High' || el >= 250000) return 'T2 Elevated';
    return 'T1 Standard';
  };

  const calculatedTier = determineTier();

  // Segregation of Duties (SoD) check
  const isSubmitterSelfApproving = currentRole === 'Submitter';

  const handleSaveCurrentScenario = () => {
    const newScenario: WhatIfScenario = {
      id: `SCN-${Math.floor(Math.random() * 900 + 100)}`,
      name: scenarioName,
      changes: {
        [selectedFindingId]: {
          newText: whatIfText,
          modifiedExposureUsd: whatIfExposure
        }
      },
      caseScore: simulatedCaseResult.caseScore,
      expectedLossUsd: simulatedCaseResult.totalExpectedLoss,
      createdBy: `${currentRole} (User)`,
      createdAt: new Date().toISOString()
    };
    onSaveScenario(newScenario);
    alert(`Scenario "${scenarioName}" saved!`);
  };

  const handleRatify = () => {
    if (isSubmitterSelfApproving) {
      alert('Segregation of Duties Violation: Submitters cannot ratify their own submissions. Please switch role persona to Approver or SME Reviewer.');
      return;
    }
    onRatifyCase(calculatedTier, ratificationNote);
    setShowRatifyModal(false);
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Top Banner */}
      <div className="glass-panel p-6 border-l-4 border-l-sky-500 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-sky-400 font-semibold uppercase tracking-wider mb-1">
            <Sliders className="w-4 h-4" /> Capability F6 — SME Review, What-If & Ratification Workspace
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Interactive Split-Screen Review Workspace
          </h2>
          <p className="text-slate-400 text-sm mt-1 max-w-3xl">
            Review findings, simulate alternative clause wordings, recompute risk scores instantly (&lt;10s), compare up to 5 what-if scenarios, and ratify under governed approval tiers with Segregation of Duties (SoD) enforcement.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowScenarioMatrix(!showScenarioMatrix)}
            className="btn btn-secondary text-xs flex items-center gap-2"
          >
            <Layers className="w-4 h-4 text-purple-400" />
            <span>Scenario Comparison Matrix ({activeCase.scenarios.length})</span>
          </button>

          <button
            onClick={() => setShowRatifyModal(true)}
            className="btn btn-success px-5 py-2.5 text-xs font-bold shadow-lg shadow-emerald-500/20 flex items-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Ratify Decision ({calculatedTier})</span>
          </button>
        </div>
      </div>

      {/* Scenario Comparison Matrix Drawer (Collapsible) */}
      {showScenarioMatrix && (
        <div className="glass-panel p-5 space-y-4 border border-purple-500/30 animate-fade-in">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              Side-by-Side Scenario Comparison (Up to 5 Scenarios)
            </h3>
            <button onClick={() => setShowScenarioMatrix(false)} className="text-slate-400 text-xs hover:text-white">✕ Close</button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="p-2">Scenario Name</th>
                  <th className="p-2">Created By</th>
                  <th className="p-2">Case Score</th>
                  <th className="p-2">Expected Loss ($)</th>
                  <th className="p-2">Risk Band</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {activeCase.scenarios.map((scn) => (
                  <tr key={scn.id} className="hover:bg-slate-900/60">
                    <td className="p-2 font-semibold text-white">{scn.name}</td>
                    <td className="p-2 text-slate-400">{scn.createdBy}</td>
                    <td className="p-2 font-extrabold text-sky-400">{scn.caseScore}/100</td>
                    <td className="p-2 font-bold text-rose-400">${(scn.expectedLossUsd / 1000).toFixed(0)}k</td>
                    <td className="p-2"><span className="badge badge-blue">Saved</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Split Screen Workspace Grid (50 / 50) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT PANEL: Document Viewer & Clause Spans (6 cols) */}
        <div className="lg:col-span-6 glass-panel p-5 space-y-4 flex flex-col h-[740px]">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2 overflow-x-auto">
              <FileText className="w-4 h-4 text-sky-400" />
              {activeCase.documents.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => setActiveDocTab(doc.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    activeDocTab === doc.id
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                      : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-slate-200'
                  }`}
                >
                  #{doc.precedenceOrder} {doc.name.substring(0, 20)}...
                </button>
              ))}
            </div>
          </div>

          {/* Document Content Viewer */}
          <div className="flex-1 bg-slate-950 p-5 rounded-xl border border-slate-800/80 overflow-y-auto font-mono text-xs text-slate-300 leading-relaxed space-y-6">
            <div className="text-slate-500 text-[11px] pb-2 border-b border-slate-800 flex justify-between">
              <span>DOCUMENT: {selectedDoc.name}</span>
              <span>PRECEDENCE #{selectedDoc.precedenceOrder}</span>
            </div>

            {/* Document Text Blocks */}
            {activeCase.clauses
              .filter(c => c.docId === selectedDoc.id)
              .map((clause) => {
                const isTargetClause = selectedFinding?.clauseId === clause.id;
                return (
                  <div
                    key={clause.id}
                    className={`p-4 rounded-xl transition-all border ${
                      isTargetClause
                        ? 'bg-amber-950/30 border-amber-500/50 shadow-inner'
                        : 'bg-slate-900/40 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between text-slate-400 mb-2">
                      <span className="font-bold text-amber-400">{clause.number}: {clause.heading}</span>
                      <span className="text-[10px] text-slate-500">Page {clause.span.page}</span>
                    </div>

                    <p className={`leading-relaxed ${isTargetClause ? 'text-amber-100 font-semibold' : 'text-slate-300'}`}>
                      "{clause.text}"
                    </p>

                    {clause.amendsClauseId && (
                      <div className="mt-2 text-[10px] text-sky-400 font-mono flex items-center gap-1">
                        <Layers className="w-3 h-3" /> Amends Base Clause ID: {clause.amendsClauseId}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>

        {/* RIGHT PANEL: Finding Actions & Live What-If Simulator (6 cols) */}
        <div className="lg:col-span-6 glass-panel p-5 space-y-5 flex flex-col h-[740px] overflow-y-auto">
          {/* Finding Switcher Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800">
            {activeCase.findings.map((f) => (
              <button
                key={f.id}
                onClick={() => setSelectedFindingId(f.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  selectedFindingId === f.id
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
                }`}
              >
                {f.id} ({f.severity})
              </button>
            ))}
          </div>

          {/* Finding Inspector Header */}
          {selectedFinding && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className={`badge badge-${selectedFinding.severity.toLowerCase()}`}>
                    {selectedFinding.severity} Severity
                  </span>
                  <h3 className="text-base font-bold text-white mt-1">{selectedFinding.type}</h3>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400">Baseline Score</div>
                  <div className="text-lg font-extrabold text-white">{selectedFinding.findingScore}/100</div>
                </div>
              </div>

              {/* Review Actions Bar */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onUpdateFinding({ ...selectedFinding, status: 'Accepted' })}
                  className={`btn py-1.5 px-3 text-xs flex-1 ${selectedFinding.status === 'Accepted' ? 'btn-success' : 'btn-secondary'}`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Accept Gap
                </button>
                <button
                  onClick={() => onUpdateFinding({ ...selectedFinding, status: 'Rejected' })}
                  className={`btn py-1.5 px-3 text-xs flex-1 ${selectedFinding.status === 'Rejected' ? 'btn-danger' : 'btn-secondary'}`}
                >
                  <XCircle className="w-3.5 h-3.5" /> Reject Finding
                </button>
                <button
                  onClick={() => onUpdateFinding({ ...selectedFinding, status: 'Modified' })}
                  className={`btn py-1.5 px-3 text-xs flex-1 ${selectedFinding.status === 'Modified' ? 'btn-primary' : 'btn-secondary'}`}
                >
                  <Edit3 className="w-3.5 h-3.5" /> Modify
                </button>
              </div>

              {/* Live What-If Clause Simulator Section */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-sky-500/30 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h4 className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" /> Live What-If Clause Simulator
                  </h4>
                  <span className="text-[11px] text-emerald-400 font-mono">Real-Time Re-Score (&lt;10s)</span>
                </div>

                {/* Editable Clause Text */}
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400">Proposed Clause Wording (Swap or Edit):</label>
                  <textarea
                    rows={4}
                    value={whatIfText}
                    onChange={(e) => setWhatIfText(e.target.value)}
                    className="glass-input w-full font-mono text-xs leading-relaxed"
                  />
                </div>

                {/* What-If Parameters Controls */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-400">Simulated Exposure ($):</label>
                    <input
                      type="number"
                      value={whatIfExposure}
                      onChange={(e) => setWhatIfExposure(Number(e.target.value))}
                      className="glass-input w-full text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400">Probability p (0-1):</label>
                    <input
                      type="number"
                      step="0.05"
                      max="1"
                      min="0"
                      value={whatIfProbability}
                      onChange={(e) => setWhatIfProbability(Number(e.target.value))}
                      className="glass-input w-full text-xs"
                    />
                  </div>
                </div>

                {/* Instant Re-score Output Card */}
                <div className="p-3 rounded-lg bg-slate-950 border border-sky-900/40 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400">Simulated Finding Score: </span>
                    <strong className="text-sky-300 font-bold">{simulatedFindingScore}/100</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Simulated Case Score: </span>
                    <strong className="text-emerald-400 font-extrabold">{simulatedCaseResult.caseScore}/100 ({simulatedCaseResult.riskBand})</strong>
                  </div>
                </div>

                {/* Save Scenario Controls */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={scenarioName}
                    onChange={(e) => setScenarioName(e.target.value)}
                    className="glass-input text-xs flex-1 py-1"
                    placeholder="Scenario Name..."
                  />
                  <button
                    onClick={handleSaveCurrentScenario}
                    className="btn btn-secondary text-xs py-1.5 px-3 flex items-center gap-1 text-purple-300 border-purple-500/30"
                  >
                    <Save className="w-3.5 h-3.5" /> Save Scenario
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Ratification Modal */}
      {showRatifyModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel p-6 max-w-lg w-full space-y-5 border border-emerald-500/40 animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                Ratify Course of Action
              </h3>
              <button onClick={() => setShowRatifyModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Required Approval Tier:</span>
                <span className="badge badge-critical">{calculatedTier}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Current Role Persona:</span>
                <span className="text-sky-400 font-bold">{currentRole}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Segregation of Duties Check:</span>
                {isSubmitterSelfApproving ? (
                  <span className="text-rose-400 font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Blocked (Self-Approval)
                  </span>
                ) : (
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> SoD Passed
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-medium">Ratification Decision Note / Rationale:</label>
              <textarea
                rows={3}
                value={ratificationNote}
                onChange={(e) => setRatificationNote(e.target.value)}
                placeholder="State legal & commercial justification for ratifying this course of action..."
                className="glass-input w-full text-xs"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setShowRatifyModal(false)} className="btn btn-secondary text-xs">
                Cancel
              </button>
              <button
                onClick={handleRatify}
                disabled={isSubmitterSelfApproving}
                className="btn btn-success text-xs font-bold px-5"
              >
                Ratify & Freeze Snapshot
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
