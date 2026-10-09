export type Role = 
  | 'Submitter'
  | 'Rules Steward'
  | 'Clause Curator'
  | 'SME Reviewer'
  | 'Approver'
  | 'Platform Auditor';

export type CaseStatus = 
  | 'Draft'
  | 'Ingested'
  | 'Analyzing'
  | 'Analyzed'
  | 'In review'
  | 'Pending approval'
  | 'Ratified'
  | 'Reported'
  | 'Learning captured';

export type RiskBand = 'Low' | 'Moderate' | 'High' | 'Critical';

export type Severity = 'Low' | 'Medium' | 'High' | 'Critical';

export interface DocumentFile {
  id: string;
  name: string;
  type: 'Charter Party' | 'Bill of Lading' | 'Fixture Recap' | 'Rider Clause' | 'Engagement Letter' | 'Addendum';
  fileUri: string;
  sha256: string;
  ocrQuality: number; // 0-100
  pages: number;
  precedenceOrder: number;
  uploadedAt: string;
}

export interface ExtractedField {
  id: string;
  name: string;
  value: string;
  confidence: number; // 0-1
  editedBy?: string;
}

export interface ClauseSpan {
  start: number;
  end: number;
  page: number;
}

export interface DocumentClause {
  id: string;
  docId: string;
  number: string;
  heading: string;
  text: string;
  span: ClauseSpan;
  category: string;
  amendsClauseId?: string;
}

export interface ComplianceRule {
  id: string;
  version: string;
  title: string;
  sourceRef: string;
  domain: 'Sanctions' | 'Environmental' | 'Safety' | 'Cargo Liability' | 'Commercial' | 'Insurance';
  jurisdiction: string;
  severity: Severity;
  logicDescription: string;
  modelClause: string;
  validFrom: string;
  validTo?: string;
  status: 'Draft' | 'Active' | 'Superseded' | 'Retired';
}

export interface ClausePattern {
  id: string;
  version: string;
  category: string;
  canonicalText: string;
  disputeRate: number; // 0-1
  successRate: number; // 0-1
  impactBand: RiskBand;
  medianImpactUsd: number;
  confidence: number;
  kAnonymityLevel: number; // e.g. 5, 8
  status: 'Candidate' | 'Active' | 'Deprecated';
}

export interface Finding {
  id: string;
  runId: string;
  clauseId: string;
  docId: string;
  type: 'Compliance gap' | 'Conflict' | 'Weak safeguard' | 'Safeguard opportunity' | 'Best practice';
  status: 'Open' | 'Accepted' | 'Rejected' | 'Modified' | 'Needs review';
  ruleIds: string[];
  patternIds: string[];
  severity: Severity;
  probability: number; // 0-1
  exposureUsd: { low: number; likely: number; high: number };
  findingScore: number; // 0-100
  confidence: number;
  recommendationAction: 'add' | 'amend' | 'delete' | 'negotiate' | 'accept_with_mitigation';
  proposedText: string;
  rationale: string;
  estimatedEffort: number; // 1-5
  smeComment?: string;
}

export interface WhatIfScenario {
  id: string;
  name: string;
  changes: Record<string, { newText?: string; modifiedExposureUsd?: number; acceptedWithMitigation?: boolean }>;
  caseScore: number;
  expectedLossUsd: number;
  createdBy: string;
  createdAt: string;
}

export interface RatificationDecision {
  id: string;
  caseId: string;
  scenarioId: string;
  version: string;
  tier: 'T1 Standard' | 'T2 Elevated' | 'T3 Critical';
  status: 'Pending' | 'Ratified' | 'Returned' | 'Rejected';
  note: string;
  approverLevel1?: string;
  approverLevel2?: string;
  ratifiedAt?: string;
  snapshotHash?: string;
}

export interface LineageEvent {
  id: string;
  prevHash: string;
  hash: string;
  actor: string;
  role: Role;
  action: string;
  objectRef: string;
  diff: string;
  timestamp: string;
}

export interface LearningPackage {
  id: string;
  sourceDecisionId: string;
  clauseCategory: string;
  anonymizedPayload: string;
  privacyCheckPassed: boolean;
  kLevelAchieved: number;
  proposedPatternId?: string;
  curatorAction: 'Pending' | 'Approved' | 'Merged' | 'Rejected';
}

export interface GeneratedReport {
  id: string;
  decisionId: string;
  type: 'Executive Summary' | 'Detailed Audit Report' | 'DOCX Redline Pack';
  createdAt: string;
  fileUri: string;
  redacted: boolean;
  shareUrl?: string;
}

export interface CaseData {
  id: string;
  title: string;
  trade: string;
  charterType: 'Voyage Charter' | 'Time Charter' | 'Bareboat Charter' | 'COA';
  effectiveDate: string;
  status: CaseStatus;
  riskScore: number;
  riskBand: RiskBand;
  owner: string;
  documents: DocumentFile[];
  extractedFields: ExtractedField[];
  clauses: DocumentClause[];
  findings: Finding[];
  scenarios: WhatIfScenario[];
  decision?: RatificationDecision;
}
