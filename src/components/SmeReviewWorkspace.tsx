import React, { useState } from 'react';
import { 
  Sliders, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Edit3, 
  Sparkles, 
  Save, 
  Layers, 
  ShieldCheck, 
  AlertTriangle 
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

  const simulatedFindingsList = activeCase.findings.map(f => 
    f.id === selectedFindingId && simulatedFinding ? simulatedFinding : f
  );
  const simulatedCaseResult = calculateCaseScoreAndBand(simulatedFindingsList);

  const determineTier = (): 'T1 Standard' | 'T2 Elevated' | 'T3 Critical' => {
    const el = simulatedCaseResult.totalExpectedLoss;
    const band = simulatedCaseResult.riskBand;
    if (band === 'Critical' || el >= 1000000) return 'T3 Critical';
    if (band === 'High' || el >= 250000) return 'T2 Elevated';
    return 'T1 Standard';
  };

  const calculatedTier = determineTier();
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
    <div className="p-5 max-w-7xl mx-auto space-y-5 animate-fade-in">
      {/* Top Banner Sub-Panel */}
      <div className="sub border-l-4 border-l-[var(--signal)]">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="pip live dot">Capability F6</span>
              <span className="mono text-xs text-[var(--ink-3)]">SPLIT-SCREEN REVIEW & WHAT-IF WORKSPACE</span>
            </div>
            <h1 className="text-2xl font-extrabold text-[var(--ink)] tracking-tight">
              SME Review & What-If Simulator Console
            </h1>
            <p className="text-[var(--ink-2)] text-xs mt-1 max-w-3xl">
              Review findings, simulate alternative clause wordings, recompute risk scores instantly (&lt;10s), compare up to 5 what-if scenarios, and ratify under governed approval tiers with Segregation of Duties (SoD) enforcement.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowScenarioMatrix(!showScenarioMatrix)}
              className="btn btn-secondary text-xs flex items-center gap-2"
            >
              <Layers className="w-4 h-4 text-[var(--violet)]" />
              <span>Scenarios ({activeCase.scenarios.length})</span>
            </button>

            <button
              onClick={() => setShowRatifyModal(true)}
              className="btn btn-primary text-xs font-bold shadow-lg flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Ratify ({calculatedTier})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Scenario Comparison Matrix Drawer */}
      {showScenarioMatrix && (
        <div className="sub space-y-3 border-2 border-[var(--violet)] animate-fade-in">
          <div className="sub-h">
            <b className="flex items-center gap-2 text-sm text-[var(--violet)]">
              <Layers className="w-4 h-4" /> Side-by-Side Scenario Comparison
            </b>
            <button onClick={() => setShowScenarioMatrix(false)} className="text-[var(--ink-3)] text-xs hover:text-white">✕ Close</button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono border-collapse">
              <thead>
                <tr className="border-b border-[var(--edge)] text-[var(--ink-3)]">
                  <th className="p-2">Scenario Name</th>
                  <th className="p-2">Created By</th>
                  <th className="p-2">Case Score</th>
                  <th className="p-2">Expected Loss ($)</th>
                  <th className="p-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--edge)]">
                {activeCase.scenarios.map((scn) => (
                  <tr key={scn.id} className="hover:bg-[var(--surface-2)]">
                    <td className="p-2 font-semibold text-[var(--ink)]">{scn.name}</td>
                    <td className="p-2 text-[var(--ink-2)]">{scn.createdBy}</td>
                    <td className="p-2 font-bold text-[var(--cyan)]">{scn.caseScore}/100</td>
                    <td className="p-2 font-bold text-[var(--rose)]">${(scn.expectedLossUsd / 1000).toFixed(0)}k</td>
                    <td className="p-2"><span className="pip info">Saved</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Split Screen Workspace Grid (50 / 50) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* LEFT PANEL: Document Viewer & Clause Spans (6 cols) */}
        <div className="lg:col-span-6 sub flex flex-col h-[740px]">
          <div className="sub-h">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              <FileText className="w-4 h-4 text-[var(--cyan)]" />
              {activeCase.documents.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => setActiveDocTab(doc.id)}
                  className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                    activeDocTab === doc.id
                      ? 'bg-[var(--surface-2)] text-[var(--cyan)] border border-[var(--cyan)]'
                      : 'bg-[var(--surface)] text-[var(--ink-3)] border border-[var(--edge)]'
                  }`}
                >
                  #{doc.precedenceOrder} {doc.name.substring(0, 18)}...
                </button>
              ))}
            </div>
          </div>

          {/* Document Content Viewer */}
          <div className="flex-1 bg-[var(--abyss)] p-4 rounded border border-[var(--edge)] overflow-y-auto font-mono text-xs text-[var(--ink-2)] leading-relaxed space-y-4">
            <div className="text-[var(--ink-3)] text-[11px] pb-2 border-b border-[var(--edge)] flex justify-between">
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
                    className={`p-3 rounded transition-all border ${
                      isTargetClause
                        ? 'bg-[var(--surface-2)] border-[var(--amber)] shadow-inner'
                        : 'bg-[var(--surface)] border-[var(--edge)]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[var(--ink-3)] mb-1">
                      <span className="font-bold text-[var(--amber)]">{clause.number}: {clause.heading}</span>
                      <span className="text-[10px]">Page {clause.span.page}</span>
                    </div>

                    <p className={`leading-relaxed ${isTargetClause ? 'text-[var(--ink)] font-semibold' : 'text-[var(--ink-2)]'}`}>
                      "{clause.text}"
                    </p>
                  </div>
                );
              })}
          </div>
        </div>

        {/* RIGHT PANEL: Finding Actions & Live What-If Simulator (6 cols) */}
        <div className="lg:col-span-6 sub space-y-4 flex flex-col h-[740px] overflow-y-auto">
          {/* Finding Switcher */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-[var(--edge)]">
            {activeCase.findings.map((f) => (
              <button
                key={f.id}
                onClick={() => setSelectedFindingId(f.id)}
                className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wider whitespace-nowrap ${
                  selectedFindingId === f.id
                    ? 'bg-[var(--surface-2)] text-[var(--rose)] border border-[var(--rose)]'
                    : 'bg-[var(--surface)] text-[var(--ink-3)] border border-[var(--edge)]'
                }`}
              >
                {f.id} [{f.severity}]
              </button>
            ))}
          </div>

          {/* Finding Inspector */}
          {selectedFinding && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className={`pip ${selectedFinding.severity === 'Critical' ? 'crit' : 'warn'}`}>
                    {selectedFinding.severity} SEVERITY
                  </span>
                  <h3 className="text-base font-bold text-[var(--ink)] mt-1">{selectedFinding.type}</h3>
                </div>
                <div className="text-right font-mono">
                  <div className="text-xs text-[var(--ink-3)]">Baseline Score</div>
                  <div className="text-lg font-bold text-[var(--ink)]">{selectedFinding.findingScore}/100</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onUpdateFinding({ ...selectedFinding, status: 'Accepted' })}
                  className={`btn py-1 px-2 text-xs flex-1 ${selectedFinding.status === 'Accepted' ? 'btn-primary' : 'btn-secondary'}`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Accept Gap
                </button>
                <button
                  onClick={() => onUpdateFinding({ ...selectedFinding, status: 'Rejected' })}
                  className={`btn py-1 px-2 text-xs flex-1 ${selectedFinding.status === 'Rejected' ? 'btn-secondary text-[var(--rose)]' : 'btn-secondary'}`}
                >
                  <XCircle className="w-3.5 h-3.5" /> Reject Finding
                </button>
                <button
                  onClick={() => onUpdateFinding({ ...selectedFinding, status: 'Modified' })}
                  className={`btn py-1 px-2 text-xs flex-1 ${selectedFinding.status === 'Modified' ? 'btn-secondary text-[var(--cyan)]' : 'btn-secondary'}`}
                >
                  <Edit3 className="w-3.5 h-3.5" /> Modify
                </button>
              </div>

              {/* Live What-If Clause Simulator Section */}
              <div className="p-4 rounded bg-[var(--surface-2)] border border-[var(--signal)] space-y-3">
                <div className="sub-h">
                  <b className="flex items-center gap-1.5 text-[var(--signal)] text-xs">
                    <Sparkles className="w-4 h-4" /> Live What-If Clause Simulator
                  </b>
                  <span className="text-[var(--good)]">Real-Time Re-Score (&lt;10s)</span>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-[var(--ink-3)] font-mono">Proposed Clause Wording (Swap or Edit):</label>
                  <textarea
                    rows={4}
                    value={whatIfText}
                    onChange={(e) => setWhatIfText(e.target.value)}
                    className="glass-input w-full font-mono text-xs leading-relaxed"
                  />
                </div>

                {/* Parameters */}
                <div className="grid grid-cols-2 gap-3 font-mono">
                  <div>
                    <label className="text-[11px] text-[var(--ink-3)]">Simulated Exposure ($):</label>
                    <input
                      type="number"
                      value={whatIfExposure}
                      onChange={(e) => setWhatIfExposure(Number(e.target.value))}
                      className="glass-input w-full text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-[var(--ink-3)]">Probability p (0-1):</label>
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

                {/* Output Card */}
                <div className="p-3 rounded bg-[var(--abyss)] border border-[var(--edge)] flex items-center justify-between font-mono text-xs">
                  <div>
                    <span className="text-[var(--ink-3)]">Simulated Finding Score: </span>
                    <strong className="text-[var(--cyan)]">{simulatedFindingScore}/100</strong>
                  </div>
                  <div>
                    <span className="text-[var(--ink-3)]">Simulated Case Score: </span>
                    <strong className="text-[var(--good)]">{simulatedCaseResult.caseScore}/100 [{simulatedCaseResult.riskBand}]</strong>
                  </div>
                </div>

                {/* Save Scenario Controls */}
                <div className="flex items-center gap-2 pt-1 font-mono">
                  <input
                    type="text"
                    value={scenarioName}
                    onChange={(e) => setScenarioName(e.target.value)}
                    className="glass-input text-xs flex-1 py-1"
                    placeholder="Scenario Name..."
                  />
                  <button
                    onClick={handleSaveCurrentScenario}
                    className="btn btn-secondary text-xs py-1.5 px-3 flex items-center gap-1 text-[var(--violet)] border-[var(--violet)]"
                  >
                    <Save className="w-3.5 h-3.5" /> Save
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Ratification Modal */}
      {showRatifyModal && (
        <div className="fixed inset-0 z-50 bg-[#030e17]/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="sub max-w-lg w-full space-y-4 border-2 border-[var(--good)]">
            <div className="sub-h">
              <b className="flex items-center gap-2 text-sm text-[var(--good)]">
                <ShieldCheck className="w-5 h-5" /> Ratify Course of Action
              </b>
              <button onClick={() => setShowRatifyModal(false)} className="text-[var(--ink-3)] hover:text-white">✕</button>
            </div>

            <div className="p-3 rounded bg-[var(--deep)] border border-[var(--edge)] space-y-2 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-[var(--ink-3)]">Required Approval Tier:</span>
                <span className="pip crit">{calculatedTier}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--ink-3)]">Current Role Persona:</span>
                <span className="text-[var(--cyan)] font-bold">{currentRole}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--ink-3)]">Segregation of Duties Check:</span>
                {isSubmitterSelfApproving ? (
                  <span className="text-[var(--rose)] font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Blocked (Self-Approval)
                  </span>
                ) : (
                  <span className="text-[var(--good)] font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> SoD Passed
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-[var(--ink-2)] font-mono">Ratification Decision Note / Rationale:</label>
              <textarea
                rows={3}
                value={ratificationNote}
                onChange={(e) => setRatificationNote(e.target.value)}
                placeholder="State legal & commercial justification for ratifying this course of action..."
                className="glass-input w-full text-xs font-mono"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setShowRatifyModal(false)} className="btn btn-secondary text-xs">Cancel</button>
              <button
                onClick={handleRatify}
                disabled={isSubmitterSelfApproving}
                className="btn btn-primary text-xs font-bold"
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
