import React, { useState } from 'react';
import { Header } from './components/Header';
import { IngestionView } from './components/IngestionView';
import { RulesRepository } from './components/RulesRepository';
import { ClauseIntelligence } from './components/ClauseIntelligence';
import { AnalysisDashboard } from './components/AnalysisDashboard';
import { SmeReviewWorkspace } from './components/SmeReviewWorkspace';
import { LineageAuditView } from './components/LineageAuditView';
import { LearningQueueView } from './components/LearningQueueView';
import { ReportGeneratorView } from './components/ReportGeneratorView';

import { 
  initialCases, 
  initialRules, 
  initialPatterns, 
  initialLineage, 
  initialLearningQueue, 
  initialReports 
} from './data/mockData';
import { Role, CaseData, Finding, WhatIfScenario, ComplianceRule, LearningPackage, GeneratedReport, LineageEvent } from './types/tdv';
import { calculateCaseScoreAndBand } from './services/scoringEngine';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [currentRole, setCurrentRole] = useState<Role>('SME Reviewer');
  
  const [cases, setCases] = useState<CaseData[]>(initialCases);
  const [activeCaseId, setActiveCaseId] = useState<string>(initialCases[0].id);
  const [rules, setRules] = useState<ComplianceRule[]>(initialRules);
  const [patterns, setPatterns] = useState(initialPatterns);
  const [lineageEvents, setLineageEvents] = useState<LineageEvent[]>(initialLineage);
  const [learningQueue, setLearningQueue] = useState<LearningPackage[]>(initialLearningQueue);
  const [reports, setReports] = useState<GeneratedReport[]>(initialReports);

  const activeCase = cases.find(c => c.id === activeCaseId) || cases[0];

  // Helper to add lineage event
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

  // Handlers
  const handleUpdateExtractedField = (fieldId: string, newValue: string) => {
    setCases(prevCases => prevCases.map(c => {
      if (c.id !== activeCase.id) return c;
      return {
        ...c,
        extractedFields: c.extractedFields.map(f => f.id === fieldId ? { ...f, value: newValue } : f)
      };
    }));
    recordLineage('FIELD_EXTRACTED_EDIT', fieldId, `Updated extracted field value to "${newValue}"`);
  };

  const handleLaunchAnalysis = () => {
    // Recompute scores
    const { caseScore, riskBand } = calculateCaseScoreAndBand(activeCase.findings);
    setCases(prevCases => prevCases.map(c => c.id === activeCase.id ? { ...c, riskScore: caseScore, riskBand, status: 'Analyzed' } : c));
    recordLineage('ANALYSIS_RUN_COMPLETED', activeCase.id, `Ran F4 analysis. Case risk score: ${caseScore}/100 (${riskBand})`);
    setActiveTab('dashboard');
  };

  const handleAddRule = (newRule: ComplianceRule) => {
    setRules(prev => [newRule, ...prev]);
    recordLineage('RULE_CREATED', newRule.id, `Authored new rule "${newRule.title}"`);
  };

  const handleUpdateFinding = (updatedFinding: Finding) => {
    setCases(prevCases => prevCases.map(c => {
      if (c.id !== activeCase.id) return c;
      const updatedFindings = c.findings.map(f => f.id === updatedFinding.id ? updatedFinding : f);
      const { caseScore, riskBand } = calculateCaseScoreAndBand(updatedFindings);
      return {
        ...c,
        findings: updatedFindings,
        riskScore: caseScore,
        riskBand
      };
    }));
    recordLineage('FINDING_REVIEW_ACTION', updatedFinding.id, `Finding status changed to ${updatedFinding.status}`);
  };

  const handleSaveScenario = (scenario: WhatIfScenario) => {
    setCases(prevCases => prevCases.map(c => {
      if (c.id !== activeCase.id) return c;
      return {
        ...c,
        scenarios: [...c.scenarios, scenario]
      };
    }));
    recordLineage('SCENARIO_SAVED', scenario.id, `Saved what-if scenario "${scenario.name}". Score: ${scenario.caseScore}/100`);
  };

  const handleRatifyCase = (tier: 'T1 Standard' | 'T2 Elevated' | 'T3 Critical', note: string) => {
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
          tier,
          status: 'Ratified',
          note,
          approverLevel1: `${currentRole} (Ratified)`,
          ratifiedAt: new Date().toISOString()
        }
      };
    }));
    recordLineage('CASE_RATIFIED', decisionId, `Case ratified under ${tier}. Note: "${note}"`);
    
    // Push candidate item to F8 learning queue
    const newPkg: LearningPackage = {
      id: `PKG-${Math.floor(Math.random() * 900 + 100)}`,
      sourceDecisionId: decisionId,
      clauseCategory: 'Sanctions & Trade Controls',
      anonymizedPayload: 'Clause wording tokenized: "Charterers warrant [PARTY_ANON] compliance with OFAC/EU sanctions and continuous AIS uptime."',
      privacyCheckPassed: true,
      kLevelAchieved: 8,
      curatorAction: 'Pending'
    };
    setLearningQueue(prev => [newPkg, ...prev]);
  };

  const handleCuratePackage = (pkgId: string, action: 'Approved' | 'Merged' | 'Rejected') => {
    setLearningQueue(prev => prev.map(p => p.id === pkgId ? { ...p, curatorAction: action } : p));
    recordLineage('LEARNING_CURATED', pkgId, `Curator marked package as ${action}`);
  };

  const handleGenerateReport = (type: 'Executive Summary' | 'Detailed Audit Report' | 'DOCX Redline Pack') => {
    const newRpt: GeneratedReport = {
      id: `RPT-${Math.floor(Math.random() * 900 + 100)}`,
      decisionId: activeCase.decision?.id || 'DEC-DRAFT',
      type,
      createdAt: new Date().toISOString(),
      fileUri: `/reports/${type.replace(/\s+/g, '_')}_${activeCase.id}.pdf`,
      redacted: true
    };
    setReports(prev => [newRpt, ...prev]);
    recordLineage('REPORT_GENERATED', newRpt.id, `Generated report type "${type}"`);
  };

  return (
    <div className="min-h-screen bg-[#070c14] text-slate-100 flex flex-col">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentRole={currentRole}
        setCurrentRole={setCurrentRole}
        activeCase={activeCase}
        cases={cases}
        setActiveCaseId={setActiveCaseId}
      />

      <main className="flex-1 pb-12">
        {activeTab === 'dashboard' && (
          <AnalysisDashboard
            activeCase={activeCase}
            onNavigateToSmeReview={(findingId) => {
              setActiveTab('sme-review');
            }}
          />
        )}

        {activeTab === 'ingestion' && (
          <IngestionView
            activeCase={activeCase}
            onUpdateExtractedField={handleUpdateExtractedField}
            onLaunchAnalysis={handleLaunchAnalysis}
          />
        )}

        {activeTab === 'rules' && (
          <RulesRepository
            rules={rules}
            onAddRule={handleAddRule}
          />
        )}

        {activeTab === 'intelligence' && (
          <ClauseIntelligence
            patterns={patterns}
          />
        )}

        {activeTab === 'sme-review' && (
          <SmeReviewWorkspace
            activeCase={activeCase}
            currentRole={currentRole}
            onUpdateFinding={handleUpdateFinding}
            onSaveScenario={handleSaveScenario}
            onRatifyCase={handleRatifyCase}
          />
        )}

        {activeTab === 'lineage' && (
          <LineageAuditView
            lineageEvents={lineageEvents}
          />
        )}

        {activeTab === 'learning' && (
          <LearningQueueView
            learningQueue={learningQueue}
            onCuratePackage={handleCuratePackage}
          />
        )}

        {activeTab === 'reports' && (
          <ReportGeneratorView
            activeCase={activeCase}
            reports={reports}
            onGenerateReport={handleGenerateReport}
          />
        )}
      </main>
    </div>
  );
}

export default App;
