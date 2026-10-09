import React, { useState } from 'react';
import { 
  ShieldCheck, FileCheck2, BookOpenCheck, Scale, Sliders, History, 
  BrainCircuit, FileSpreadsheet, Layers, UserCheck, Play, CheckCircle2, 
  XCircle, Edit3, Sparkles, Save, ShieldAlert, DollarSign, TrendingDown, 
  AlertCircle, ArrowRight, Lock, Share2, Download, ChevronRight, Info, Search, Filter, Plus, GitCommit
} from 'lucide-react';
import { CaseData, Finding, WhatIfScenario, Role, ComplianceRule, ClausePattern, LearningPackage, GeneratedReport, LineageEvent, DocumentFile } from './types/tdv';
import { initialCases, initialRules, initialPatterns, initialLineage, initialLearningQueue, initialReports } from './data/mockData';
import { calculateCaseScoreAndBand, calculateFindingExpectedLoss, calculateFindingScore } from './services/scoringEngine';
import confetti from 'canvas-confetti';

export function App() {
  // Navigation & Role Persona State
  const [activeTab, setActiveTab] = useState<string>('ingestion');
  const [currentRole, setCurrentRole] = useState<Role>('SME Reviewer');

  // Cases & Workspace State
  const [cases, setCases] = useState<CaseData[]>(initialCases);
  const [activeCaseId, setActiveCaseId] = useState<string>(initialCases[0].id);
  const [rules, setRules] = useState<ComplianceRule[]>(initialRules);
  const [patterns, setPatterns] = useState<ClausePattern[]>(initialPatterns);
  const [lineageEvents, setLineageEvents] = useState<LineageEvent[]>(initialLineage);
  const [learningQueue, setLearningQueue] = useState<LearningPackage[]>(initialLearningQueue);
  const [reports, setReports] = useState<GeneratedReport[]>(initialReports);

  // Active Blade Expanders (TegrityInspection pattern)
  const [activeBlade_doc, setActiveBlade_doc] = useState<DocumentFile | null>(null);
  const [activeBlade_rule, setActiveBlade_rule] = useState<ComplianceRule | null>(null);
  const [activeBlade_pattern, setActiveBlade_pattern] = useState<ClausePattern | null>(null);
  const [activeBlade_lineage, setActiveBlade_lineage] = useState<LineageEvent | null>(null);

  // Active Case Reference
  const activeCase = cases.find(c => c.id === activeCaseId) || cases[0];
  const { caseScore, riskBand, totalExpectedLoss, reducibleLoss } = calculateCaseScoreAndBand(activeCase.findings);

  // Ingestion Workspace State
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [isLaunching, setIsLaunching] = useState<boolean>(false);
  const [analysisStep, setAnalysisStep] = useState<number>(0);

  // Rules State
  const [searchRuleQuery, setSearchRuleQuery] = useState<string>('');
  const [selectedRuleDomain, setSelectedRuleDomain] = useState<string>('All');
  const [showTestHarness, setShowTestHarness] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ matched: boolean; score: number; reasoning: string } | null>(null);

  // Clause Intelligence State
  const [searchPatternQuery, setSearchPatternQuery] = useState<string>('');
  const [selectedPatternCategory, setSelectedPatternCategory] = useState<string>('All');

  // SME Review & What-If Workspace State
  const [selectedFindingId, setSelectedFindingId] = useState<string>(activeCase.findings[0]?.id || '');
  const [activeDocTab, setActiveDocTab] = useState<string>(activeCase.documents[0]?.id || '');
  const [whatIfText, setWhatIfText] = useState<string>('');
  const [whatIfExposure, setWhatIfExposure] = useState<number>(500000);
  const [whatIfProbability, setWhatIfProbability] = useState<number>(0.5);
  const [scenarioName, setScenarioName] = useState<string>('Negotiated BIMCO 2024 Swap');
  const [showScenarioMatrix, setShowScenarioMatrix] = useState<boolean>(false);
  const [ratificationNote, setRatificationNote] = useState<string>('');
  const [showRatifyModal, setShowRatifyModal] = useState<boolean>(false);

  // Report State
  const [selectedReportType, setSelectedReportType] = useState<'Executive Summary' | 'Detailed Audit Report' | 'DOCX Redline Pack'>('Executive Summary');
  const [isRedacted, setIsRedacted] = useState<boolean>(true);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [shareEmail, setShareEmail] = useState<string>('chartering@counterparty.com');

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

  // Helper to append lineage
  const recordLineage = (action: string, objectRef: string, diff: string) => {
    const prevHash = lineageEvents[lineageEvents.length - 1]?.hash || '0000000000000000000000000000000000000000';
    const newHash = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const newEvt: LineageEvent = {
      id: `EVT-${Math.floor(Math.random() * 9000 + 1000)}`,
      prevHash,
      hash: newHash,
      actor: `${currentRole} (User)`,
      role: currentRole,
      action,
      objectRef,
      diff,
      timestamp: new Date().toISOString()
    };
    setLineageEvents(prev => [...prev, newEvt]);
  };

  const handleLaunchAnalysis = () => {
    setIsLaunching(true);
    setAnalysisStep(1);
    setTimeout(() => setAnalysisStep(2), 700);
    setTimeout(() => setAnalysisStep(3), 1400);
    setTimeout(() => setAnalysisStep(4), 2100);
    setTimeout(() => {
      setIsLaunching(false);
      const { caseScore: newScore, riskBand: newBand } = calculateCaseScoreAndBand(activeCase.findings);
      setCases(prevCases => prevCases.map(c => c.id === activeCase.id ? { ...c, riskScore: newScore, riskBand: newBand, status: 'Analyzed' } : c));
      recordLineage('ANALYSIS_RUN_COMPLETED', activeCase.id, `Ran F4 analysis pipeline. Case score: ${newScore}/100 (${newBand})`);
      setActiveTab('review');
    }, 2800);
  };

  const handleRatify = () => {
    if (isSubmitterSelfApproving) {
      alert('Segregation of Duties Violation: Submitters cannot ratify their own submissions. Switch role persona to Approver or SME Reviewer.');
      return;
    }
    const decisionId = `DEC-${Math.floor(Math.random() * 9000 + 1000)}`;
    setCases(prevCases => prevCases.map(c => {
      if (c.id !== activeCase.id) return c;
      return {
        ...c,
        status: 'Ratified',
        decision: {
          id: decisionId,
          caseId: c.id,
          scenarioId: c.scenarios[c.scenarios.length - 1]?.id || 'SCN-01',
          version: 'v1.0-Ratified',
          tier: calculatedTier,
          status: 'Ratified',
          note: ratificationNote,
          approverLevel1: `${currentRole} (Ratified)`,
          ratifiedAt: new Date().toISOString()
        }
      };
    }));
    recordLineage('CASE_RATIFIED', decisionId, `Case ratified under ${calculatedTier}. Rationale: "${ratificationNote}"`);
    setShowRatifyModal(false);
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
  };

  return (
    <div className="shell">
      {/* ── TEGRITY INSPECTION RIBBON HEADER ──────────────────────── */}
      <header className="ribbon">
        <div className="orb">
          <ShieldCheck className="w-5 h-5 text-[#062012]" />
        </div>

        <div className="wordmark">
          <b>TEGRITY</b>
          <span>DOCUMENT VALIDATION ENGINE (TDV)</span>
        </div>

        <div className="h-6 w-px bg-[var(--surface-3)] mx-2" />

        {/* Active Case Selector */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-[var(--ink-3)] uppercase text-[10px]">Active Case:</span>
          <select
            value={activeCase.id}
            onChange={(e) => setActiveCaseId(e.target.value)}
            className="glass-input font-mono text-xs font-semibold text-[var(--signal)] py-1"
          >
            {cases.map((c) => (
              <option key={c.id} value={c.id} className="bg-[var(--deep)] text-[var(--ink)]">
                {c.id} — {c.title} [{c.riskBand}]
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3 ml-auto font-mono text-xs">
          <div className="flex items-center gap-1.5 bg-[var(--surface)] px-3 py-1 rounded border border-[var(--edge)]">
            <UserCheck className="w-3.5 h-3.5 text-[var(--signal)]" />
            <span className="text-[var(--ink-3)] text-[10px]">Persona:</span>
            <select
              value={currentRole}
              onChange={(e) => setCurrentRole(e.target.value as Role)}
              className="bg-transparent text-[var(--signal)] font-bold text-xs cursor-pointer focus:outline-none"
            >
              {['Submitter', 'Rules Steward', 'Clause Curator', 'SME Reviewer', 'Approver', 'Platform Auditor'].map((r) => (
                <option key={r} value={r} className="bg-[var(--deep)] text-[var(--ink)]">{r}</option>
              ))}
            </select>
          </div>

          <span className="pip live dot">TDV PILOT v0.1</span>
        </div>
      </header>

      {/* ── TAB NAVIGATION BAR ────────────────────────────────────── */}
      <nav className="flex items-center gap-1 overflow-x-auto px-5 py-2 border-b border-[var(--edge)] bg-[var(--deep)]">
        {[
          { id: 'ingestion', label: '1. Ingestion Vault (F3)', icon: FileCheck2 },
          { id: 'applicability', label: '2. Rules Applicability (F1)', icon: BookOpenCheck },
          { id: 'intelligence', label: '3. Clause Intel (F2)', icon: Layers },
          { id: 'review', label: '4. SME & What-If Review (F4-F6)', icon: Sliders },
          { id: 'lineage', label: '5. Lineage & Audit Vault (F7)', icon: History },
          { id: 'learning', label: '6. Self-Learning Queue (F8)', icon: BrainCircuit },
          { id: 'reports', label: '7. Reports & Proof Vault (F9)', icon: FileSpreadsheet }
        ].map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded font-mono text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-[var(--surface-2)] text-[var(--signal)] border border-[var(--signal)]'
                  : 'text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--surface)] border border-transparent'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[var(--signal)]' : 'text-[var(--ink-3)]'}`} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </nav>

      {/* ── MAIN CONTENT AREA ───────────────────────────────────────── */}
      <main className="p-5 space-y-5 flex-1">

        {/* ── TAB 1: INGESTION VAULT (F3) ───────────────────────────── */}
        {activeTab === 'ingestion' && (
          <div className="space-y-5 animate-fade-in">
            {/* Header Callout */}
            <div className="callout signal flex items-center justify-between">
              <div>
                <h4>F3 Multi-File Ingestion & Structuring Vault</h4>
                <p>Upload charter parties, riders, and recaps. TDV auto-classifies precedence order, verifies OCR quality, and extracts key commercial terms.</p>
              </div>
              <button onClick={handleLaunchAnalysis} disabled={isLaunching} className="btn-primary">
                <Play className="w-4 h-4 fill-[#062012]" /> Launch Validation Pipeline (F4)
              </button>
            </div>

            {/* Document Sample Tiles */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {activeCase.documents.map((doc) => {
                const isBladeOpen = activeBlade_doc?.id === doc.id;
                return (
                  <div key={doc.id} className={`tile ${isBladeOpen ? 'active-tile' : ''}`}>
                    <div className="flex justify-between items-start mb-2">
                      <span className="pip info">#{doc.precedenceOrder} PRECEDENCE</span>
                      <span className="pip ok">OCR {doc.ocrQuality}%</span>
                    </div>

                    <div className="t-name font-bold text-sm">{doc.name}</div>
                    <div className="t-sub font-mono">{doc.type} • {doc.pages} Pages</div>

                    <div className="t-strip">
                      <i className="on" /><i className="on" /><i className="on" /><i />
                    </div>

                    <button
                      onClick={() => setActiveBlade_doc(isBladeOpen ? null : doc)}
                      className="btn-secondary w-full justify-between text-xs mt-3 font-mono"
                    >
                      <span>Inspect Document Blade</span>
                      <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isBladeOpen ? 'rotate-90' : ''}`} />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Document Detail Blade */}
            {activeBlade_doc && (
              <div className="blade">
                <div className="blade-h justify-between">
                  <div className="blade-id">DOCUMENT INSPECTION BLADE: {activeBlade_doc.name}</div>
                  <button onClick={() => setActiveBlade_doc(null)} className="text-[var(--ink-3)] hover:text-white">✕</button>
                </div>
                <div className="blade-body">
                  <div className="callout info">
                    <h4>Extracted Key Commercial Terms (F3 AI Structuring)</h4>
                    <table className="dtable mt-2">
                      <thead>
                        <tr>
                          <th>Field Name</th>
                          <th>Extracted Value</th>
                          <th>Confidence</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activeCase.extractedFields.map((f) => (
                          <tr key={f.id}>
                            <td className="font-bold text-[var(--ink)]">{f.name}</td>
                            <td className="font-mono text-[var(--signal)]">{f.value}</td>
                            <td className="font-mono">{(f.confidence * 100).toFixed(0)}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── TAB 2: RULES APPLICABILITY ENGINE (F1) ─────────────────── */}
        {activeTab === 'applicability' && (
          <div className="space-y-5 animate-fade-in">
            <div className="callout info flex items-center justify-between">
              <div>
                <h4>F1 Governing Compliance Rules & Rule Packs</h4>
                <p>Versioned, jurisdiction-aware rule repository (IMO, SOLAS, MARPOL, Sanctions, EU ETS, Hague-Visby, Incoterms, BIMCO).</p>
              </div>
              <button onClick={() => setShowTestHarness(true)} className="btn-secondary font-mono text-xs">
                <Play className="w-3.5 h-3.5" /> Gold-Set Test Harness
              </button>
            </div>

            {/* Rules Matrix Table */}
            <div className="tile">
              <table className="dtable">
                <thead>
                  <tr>
                    <th>Rule Code</th>
                    <th>Rule Title</th>
                    <th>Domain</th>
                    <th>Jurisdiction</th>
                    <th>Severity</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {rules.map((rule) => (
                    <tr key={rule.id}>
                      <td className="font-mono text-[var(--cyan)] font-bold">{rule.id}</td>
                      <td className="font-bold text-[var(--ink)]">{rule.title}</td>
                      <td><span className="chip pms">{rule.domain}</span></td>
                      <td className="font-mono">{rule.jurisdiction}</td>
                      <td><span className={`pip ${rule.severity === 'Critical' ? 'crit' : 'warn'}`}>{rule.severity}</span></td>
                      <td><span className="pip ok">{rule.status}</span></td>
                      <td>
                        <button
                          onClick={() => setActiveBlade_rule(activeBlade_rule?.id === rule.id ? null : rule)}
                          className="text-[var(--signal)] hover:underline font-mono text-xs"
                        >
                          Inspect Blade
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Rule Detail Blade */}
            {activeBlade_rule && (
              <div className="blade">
                <div className="blade-h justify-between">
                  <div className="blade-id">RULE BLADE: {activeBlade_rule.id} ({activeBlade_rule.version})</div>
                  <button onClick={() => setActiveBlade_rule(null)} className="text-[var(--ink-3)] hover:text-white">✕</button>
                </div>
                <div className="blade-body">
                  <div className="callout signal">
                    <h4>Detection Logic DSL</h4>
                    <p className="font-mono text-xs">{activeBlade_rule.logicDescription}</p>
                  </div>
                  <div className="callout info">
                    <h4>Standard Model Clause Wording</h4>
                    <p className="font-mono text-xs text-[var(--good)]">"{activeBlade_rule.modelClause}"</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── TAB 3: CLAUSE INTELLIGENCE (F2) ────────────────────────── */}
        {activeTab === 'intelligence' && (
          <div className="space-y-5 animate-fade-in">
            <div className="callout signal flex items-center justify-between">
              <div>
                <h4>F2 Anonymized Clause Intelligence & Effectiveness Repository</h4>
                <p>Knowledge base of clause patterns linked to historical dispute rates and claim success probabilities with k-anonymity (k ≥ 5) protection.</p>
              </div>
              <span className="pip live dot">k-Anonymity Verified (k ≥ 5)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {patterns.map((pattern) => {
                const isBladeOpen = activeBlade_pattern?.id === pattern.id;
                return (
                  <div key={pattern.id} className={`tile ${isBladeOpen ? 'active-tile' : ''}`}>
                    <div className="flex justify-between items-start mb-2 font-mono">
                      <span className="text-[var(--violet)] font-bold">{pattern.id}</span>
                      <span className="chip sms">k={pattern.kAnonymityLevel}</span>
                    </div>

                    <div className="t-name font-bold">{pattern.category}</div>
                    <p className="t-sub font-mono line-clamp-2 mt-1">"{pattern.canonicalText}"</p>

                    <div className="space-y-2 mt-3 font-mono text-xs">
                      <div>
                        <div className="flex justify-between text-[11px] mb-0.5">
                          <span className="text-[var(--ink-3)]">Claim Recovery Rate</span>
                          <span className="text-[var(--good)] font-bold">{(pattern.successRate * 100).toFixed(0)}%</span>
                        </div>
                        <div className="meter">
                          <div className="meter-bar" style={{ width: `${pattern.successRate * 100}%` }} />
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setActiveBlade_pattern(isBladeOpen ? null : pattern)}
                      className="btn-secondary w-full justify-between text-xs mt-4 font-mono"
                    >
                      <span>Inspect Pattern Blade</span>
                      <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isBladeOpen ? 'rotate-90' : ''}`} />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Clause Pattern Detail Blade */}
            {activeBlade_pattern && (
              <div className="blade">
                <div className="blade-h justify-between">
                  <div className="blade-id">PATTERN BLADE: {activeBlade_pattern.id}</div>
                  <button onClick={() => setActiveBlade_pattern(null)} className="text-[var(--ink-3)] hover:text-white">✕</button>
                </div>
                <div className="blade-body">
                  <div className="callout signal">
                    <h4>Canonical Anonymized Pattern</h4>
                    <p className="font-mono text-xs text-[var(--ink)]">"{activeBlade_pattern.canonicalText}"</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── TAB 4: SME REVIEW & WHAT-IF WORKBENCH (F4, F5, F6) ──────── */}
        {activeTab === 'review' && (
          <div className="space-y-5 animate-fade-in">
            {/* Top Risk Scorecard Banner */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="tile">
                <div className="t-lab">Case Risk Score (Noisy-OR)</div>
                <div className="t-big mt-1">{caseScore} <span className="text-xs text-[var(--ink-3)]">/ 100</span></div>
                <div className="t-strip mt-2">
                  <i className={caseScore >= 75 ? 'crit' : caseScore >= 50 ? 'warn' : 'on'} />
                </div>
              </div>

              <div className="tile">
                <div className="t-lab">Quantified Exposure ($)</div>
                <div className="t-big sm text-[var(--rose)] mt-1">${(totalExpectedLoss / 1000).toFixed(0)}k</div>
                <div className="t-sub font-mono">Expected Loss ($EL = p \times E$)</div>
              </div>

              <div className="tile">
                <div className="t-lab">Reducible Financial Risk</div>
                <div className="t-big sm text-[var(--good)] mt-1">${(reducibleLoss / 1000).toFixed(0)}k</div>
                <div className="t-sub font-mono">75% Achievable Reduction</div>
              </div>

              <div className="tile flex flex-col justify-between">
                <div className="t-lab">Governance Approval Tier</div>
                <span className="pip crit">{calculatedTier}</span>
                <button onClick={() => setShowRatifyModal(true)} className="btn-primary w-full text-xs mt-2">
                  <ShieldCheck className="w-4 h-4" /> Ratify Decision
                </button>
              </div>
            </div>

            {/* Split Screen Workspace Grid (50 / 50) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* LEFT: Document Reader (6 cols) */}
              <div className="lg:col-span-6 tile space-y-3 flex flex-col h-[650px]">
                <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[var(--edge)]">
                  {activeCase.documents.map((doc) => (
                    <button
                      key={doc.id}
                      onClick={() => setActiveDocTab(doc.id)}
                      className={`px-2.5 py-1 rounded font-mono text-xs font-bold uppercase ${
                        activeDocTab === doc.id ? 'bg-[var(--surface-3)] text-[var(--signal)] border border-[var(--signal)]' : 'text-[var(--ink-3)]'
                      }`}
                    >
                      #{doc.precedenceOrder} {doc.name.substring(0, 16)}...
                    </button>
                  ))}
                </div>

                <div className="flex-1 bg-[var(--abyss)] p-4 rounded border border-[var(--edge)] overflow-y-auto font-mono text-xs text-[var(--ink-2)] space-y-4">
                  <div className="text-[var(--ink-3)] text-[10px] pb-2 border-b border-[var(--edge)] flex justify-between">
                    <span>DOCUMENT: {selectedDoc.name}</span>
                    <span>PRECEDENCE #{selectedDoc.precedenceOrder}</span>
                  </div>

                  {activeCase.clauses
                    .filter(c => c.docId === selectedDoc.id)
                    .map((clause) => {
                      const isTarget = selectedFinding?.clauseId === clause.id;
                      return (
                        <div key={clause.id} className={`p-3 rounded border ${isTarget ? 'bg-[var(--surface-2)] border-[var(--amber)]' : 'bg-[var(--surface)] border-[var(--edge)]'}`}>
                          <div className="flex justify-between font-bold text-[var(--amber)] mb-1">
                            <span>{clause.number}: {clause.heading}</span>
                            <span>Page {clause.span.page}</span>
                          </div>
                          <p className="leading-relaxed">"{clause.text}"</p>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* RIGHT: Live What-If Simulator (6 cols) */}
              <div className="lg:col-span-6 tile space-y-4 flex flex-col h-[650px] overflow-y-auto">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-[var(--edge)] font-mono">
                  {activeCase.findings.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setSelectedFindingId(f.id)}
                      className={`px-2.5 py-1 rounded text-xs font-bold ${
                        selectedFindingId === f.id ? 'bg-[var(--surface-3)] text-[var(--rose)] border border-[var(--rose)]' : 'text-[var(--ink-3)]'
                      }`}
                    >
                      {f.id} [{f.severity}]
                    </button>
                  ))}
                </div>

                {selectedFinding && (
                  <div className="space-y-4">
                    <div className="callout warn">
                      <h4>{selectedFinding.type} (ID: {selectedFinding.id})</h4>
                      <p>{selectedFinding.rationale}</p>
                    </div>

                    {/* What-If Live Simulator Box */}
                    <div className="p-4 rounded bg-[var(--surface-2)] border border-[var(--signal)] space-y-3">
                      <div className="flex justify-between items-center text-xs font-mono">
                        <b className="text-[var(--signal)]">Live What-If Clause Simulator</b>
                        <span className="text-[var(--good)]">Real-Time Re-Score (&lt;10s)</span>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] text-[var(--ink-3)] font-mono">Proposed Clause Wording (Swap or Edit):</label>
                        <textarea
                          rows={3}
                          value={whatIfText}
                          onChange={(e) => setWhatIfText(e.target.value)}
                          className="glass-input w-full font-mono text-xs"
                        />
                      </div>

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

                      <div className="p-3 rounded bg-[var(--abyss)] border border-[var(--edge)] flex justify-between font-mono text-xs">
                        <span>Finding Score: <strong className="text-[var(--cyan)]">{simulatedFindingScore}/100</strong></span>
                        <span>Case Score: <strong className="text-[var(--good)]">{simulatedCaseResult.caseScore}/100 [{simulatedCaseResult.riskBand}]</strong></span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 5: LINEAGE & AUDIT VAULT (F7) ──────────────────────── */}
        {activeTab === 'lineage' && (
          <div className="space-y-5 animate-fade-in">
            <div className="callout good flex items-center justify-between">
              <div>
                <h4>F7 Metadata & Lineage Audit Vault</h4>
                <p>Tamper-evident SHA-256 hash-chained case log. Replay any past ratified decision and explain evidence sources.</p>
              </div>
              <span className="pip ok">SHA-256 Hash Chained</span>
            </div>

            <div className="tile">
              <table className="dtable">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Action</th>
                    <th>Actor & Role</th>
                    <th>Target Ref</th>
                    <th>SHA-256 Hash</th>
                  </tr>
                </thead>
                <tbody>
                  {lineageEvents.map((evt) => (
                    <tr key={evt.id}>
                      <td className="font-mono text-[var(--ink-3)]">{new Date(evt.timestamp).toLocaleTimeString()}</td>
                      <td className="font-bold text-[var(--good)]">{evt.action}</td>
                      <td className="font-mono">{evt.actor} ({evt.role})</td>
                      <td className="font-mono text-[var(--cyan)]">{evt.objectRef}</td>
                      <td className="font-mono text-[10px] text-[var(--ink-3)]">{evt.hash.substring(0, 16)}...</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TAB 6: SELF-LEARNING QUEUE (F8) ────────────────────────── */}
        {activeTab === 'learning' && (
          <div className="space-y-5 animate-fade-in">
            <div className="callout signal flex items-center justify-between">
              <div>
                <h4>F8 Self-Learning & Curator Enrichment Pipeline</h4>
                <p>Ratified SME reviews flow back into F2 clause intelligence after passing through NER PII tokenization and k-anonymity gate check.</p>
              </div>
              <span className="pip live dot font-mono">Curator Gate Active</span>
            </div>

            <div className="space-y-3">
              {learningQueue.map((pkg) => (
                <div key={pkg.id} className="tile space-y-3">
                  <div className="flex justify-between items-center font-mono">
                    <span className="text-[var(--violet)] font-bold">{pkg.id}</span>
                    <span className="pip ok">k-Anonymity Verified (k={pkg.kLevelAchieved})</span>
                  </div>
                  <div className="p-3 rounded bg-[var(--abyss)] font-mono text-xs text-[var(--ink-2)]">
                    "{pkg.anonymizedPayload}"
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB 7: REPORTS & PROOF VAULT EXPORTER (F9) ─────────────── */}
        {activeTab === 'reports' && (
          <div className="space-y-5 animate-fade-in">
            <div className="callout good flex items-center justify-between">
              <div>
                <h4>F9 Executive Briefs, Audit Reports & Redline Exporter</h4>
                <p>Generate branded executive summaries, full legal audit reports, and tracked-change redlines with OTP external sharing controls.</p>
              </div>
              <button className="btn-primary text-xs">
                <Download className="w-4 h-4" /> Download PDF / DOCX Pack
              </button>
            </div>

            <div className="tile p-6 max-w-3xl mx-auto space-y-4 bg-[var(--deep)] border border-[var(--edge)]">
              <div className="flex justify-between items-center border-b border-[var(--edge)] pb-3 font-mono">
                <div>
                  <b className="text-[var(--good)]">TEGRITY DOCUMENT VALIDATION ENGINE</b>
                  <div className="text-sm font-bold text-[var(--ink)] mt-1">Executive Summary Brief</div>
                </div>
                <span className="pip ok">Ratified & Sealed</span>
              </div>

              <div className="space-y-2 font-mono text-xs">
                <div>Case Reference: <strong className="text-[var(--ink)]">{activeCase.id} — {activeCase.title}</strong></div>
                <div>Risk Score: <strong className="text-[var(--rose)]">{activeCase.riskScore}/100 ({activeCase.riskBand})</strong></div>
                <div>Quantified Exposure: <strong className="text-[var(--ink)]">${(totalExpectedLoss / 1000).toFixed(0)}k</strong></div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ── RATIFICATION MODAL ────────────────────────────────────────── */}
      {showRatifyModal && (
        <div className="fixed inset-0 z-50 bg-[#030e17]/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="tile max-w-lg w-full space-y-4 border-2 border-[var(--good)]">
            <div className="flex justify-between items-center border-b border-[var(--edge)] pb-2 font-mono">
              <b className="text-[var(--good)] flex items-center gap-2">
                <ShieldCheck className="w-5 h-5" /> Ratify Course of Action
              </b>
              <button onClick={() => setShowRatifyModal(false)} className="text-[var(--ink-3)] hover:text-white">✕</button>
            </div>

            <div className="p-3 rounded bg-[var(--surface-2)] space-y-2 font-mono text-xs">
              <div className="flex justify-between">
                <span>Required Tier:</span>
                <span className="pip crit">{calculatedTier}</span>
              </div>
              <div className="flex justify-between">
                <span>Role Persona:</span>
                <span className="text-[var(--cyan)] font-bold">{currentRole}</span>
              </div>
            </div>

            <textarea
              rows={3}
              value={ratificationNote}
              onChange={(e) => setRatificationNote(e.target.value)}
              placeholder="State legal rationale for ratifying this decision..."
              className="glass-input w-full font-mono text-xs"
            />

            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setShowRatifyModal(false)} className="btn-secondary text-xs">Cancel</button>
              <button onClick={handleRatify} className="btn-primary text-xs font-bold">Ratify & Freeze Snapshot</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
