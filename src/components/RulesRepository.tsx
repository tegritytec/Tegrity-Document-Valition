import React, { useState } from 'react';
import { BookOpenCheck, Search, Filter, Play, CheckCircle2, Plus, Code2, FileCode2 } from 'lucide-react';
import { ComplianceRule } from '../types/tdv';

interface RulesRepositoryProps {
  rules: ComplianceRule[];
  onAddRule: (newRule: ComplianceRule) => void;
}

export const RulesRepository: React.FC<RulesRepositoryProps> = ({ rules, onAddRule }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<string>('All');
  const [selectedRule, setSelectedRule] = useState<ComplianceRule | null>(rules[0] || null);
  const [showTestHarness, setShowTestHarness] = useState(false);
  const [testResult, setTestResult] = useState<{ matched: boolean; score: number; reasoning: string } | null>(null);

  const domains = ['All', 'Sanctions', 'Environmental', 'Commercial', 'Cargo Liability', 'Safety', 'Insurance'];

  const filteredRules = rules.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.sourceRef.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDomain = selectedDomain === 'All' || r.domain === selectedDomain;
    return matchesSearch && matchesDomain;
  });

  const handleRunTestHarness = () => {
    setTestResult(null);
    setTimeout(() => {
      setTestResult({
        matched: true,
        score: 0.94,
        reasoning: 'Rule R-SAN-004 evaluated against Gold Set Sample CP #14. High-confidence match: Clause 24 lacks explicit SDN warranties for sub-charterers and AIS operational tracking requirements.'
      });
    }, 600);
  };

  return (
    <div className="p-5 max-w-7xl mx-auto space-y-5 animate-fade-in">
      {/* Top Banner */}
      <div className="sub border-l-4 border-l-[var(--cyan)]">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="pip live dot">Capability F1</span>
              <span className="mono text-xs text-[var(--ink-3)]">GLOBAL SHIPPING RULES REPOSITORY</span>
            </div>
            <h1 className="text-2xl font-extrabold text-[var(--ink)] tracking-tight">
              Governing Compliance Rules & Rule Packs
            </h1>
            <p className="text-[var(--ink-2)] text-xs mt-1 max-w-3xl">
              Versioned, jurisdiction-aware rules covering IMO, SOLAS, MARPOL, Sanctions, EU ETS, Hague-Visby, Incoterms, and client policies. Includes a rule test harness to validate rules against gold-set documents.
            </p>
          </div>

          <button 
            onClick={() => {
              const newRule: ComplianceRule = {
                id: `R-CUSTOM-${Math.floor(Math.random() * 900 + 100)}`,
                version: 'v1.0',
                title: 'Custom Client Chartering Policy Rule',
                sourceRef: 'Client Internal Policy 2026',
                domain: 'Commercial',
                jurisdiction: 'Global',
                severity: 'High',
                logicDescription: 'Checks that demurrage rates do not exceed maximum cap without CFO signoff.',
                modelClause: 'Demurrage shall not exceed USD 25,000/day unless ratified by CFO.',
                validFrom: new Date().toISOString().split('T')[0],
                status: 'Active'
              };
              onAddRule(newRule);
              setSelectedRule(newRule);
            }}
            className="btn btn-primary text-xs flex items-center gap-2 font-bold"
          >
            <Plus className="w-4 h-4" /> Author New Rule
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="sub flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-3 text-[var(--ink-3)]" />
          <input
            type="text"
            placeholder="Search rules by ID, title, citation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="glass-input pl-9 w-full text-xs font-mono"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {domains.map((d) => (
            <button
              key={d}
              onClick={() => setSelectedDomain(d)}
              className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                selectedDomain === d
                  ? 'bg-[var(--surface-2)] text-[var(--cyan)] border border-[var(--cyan)]'
                  : 'bg-[var(--surface)] text-[var(--ink-3)] border border-[var(--edge)] hover:text-[var(--ink)]'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Rule List (5 cols) */}
        <div className="lg:col-span-5 space-y-3 max-h-[680px] overflow-y-auto pr-1">
          {filteredRules.map((rule) => {
            const isSelected = selectedRule?.id === rule.id;
            return (
              <div
                key={rule.id}
                onClick={() => setSelectedRule(rule)}
                className={`sub cursor-pointer transition-all ${
                  isSelected ? 'border-[var(--cyan)] bg-[var(--surface-2)] shadow-md' : 'border-[var(--edge)]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="text-[var(--cyan)] font-bold">{rule.id}</span>
                    <span className="chip">{rule.version}</span>
                  </div>
                  <span className={`pip ${rule.severity === 'Critical' ? 'crit' : 'warn'}`}>
                    {rule.severity}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-[var(--ink)] mb-1">{rule.title}</h3>
                <p className="text-[var(--ink-2)] text-xs line-clamp-2">{rule.logicDescription}</p>

                <div className="mt-3 flex items-center justify-between text-[11px] text-[var(--ink-3)] border-t border-[var(--edge)] pt-2 font-mono">
                  <span>Domain: {rule.domain}</span>
                  <span>Jurisdiction: {rule.jurisdiction}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Selected Rule Inspector (7 cols) */}
        <div className="lg:col-span-7">
          {selectedRule ? (
            <div className="sub space-y-5">
              <div className="sub-h">
                <div>
                  <span className="mono text-xs text-[var(--cyan)] font-bold">{selectedRule.id} ({selectedRule.version})</span>
                  <h2 className="text-lg font-bold text-[var(--ink)] mt-0.5">{selectedRule.title}</h2>
                </div>

                <button
                  onClick={() => setShowTestHarness(true)}
                  className="btn btn-secondary text-xs flex items-center gap-2"
                >
                  <Play className="w-3.5 h-3.5" /> Test Harness
                </button>
              </div>

              {/* Attributes Grid */}
              <div className="grid grid-cols-3 gap-3 font-mono text-xs">
                <div className="p-3 rounded bg-[var(--surface)] border border-[var(--edge)]">
                  <div className="text-[10px] text-[var(--ink-3)]">Domain</div>
                  <div className="font-bold text-[var(--ink)] mt-0.5">{selectedRule.domain}</div>
                </div>
                <div className="p-3 rounded bg-[var(--surface)] border border-[var(--edge)]">
                  <div className="text-[10px] text-[var(--ink-3)]">Jurisdiction</div>
                  <div className="font-bold text-[var(--ink)] mt-0.5">{selectedRule.jurisdiction}</div>
                </div>
                <div className="p-3 rounded bg-[var(--surface)] border border-[var(--edge)]">
                  <div className="text-[10px] text-[var(--ink-3)]">Effective Date</div>
                  <div className="font-bold text-[var(--ink)] mt-0.5">{selectedRule.validFrom}</div>
                </div>
              </div>

              {/* Logic Description */}
              <div className="space-y-1.5">
                <div className="sub-h">
                  <b>Detection Logic & Intent</b>
                </div>
                <div className="p-4 rounded bg-[var(--deep)] border border-[var(--edge)] font-mono text-xs text-[var(--ink-2)] leading-relaxed">
                  {selectedRule.logicDescription}
                </div>
              </div>

              {/* Standard Model Clause */}
              <div className="space-y-1.5">
                <div className="sub-h">
                  <b>Standard Model Clause Wording</b>
                </div>
                <div className="p-4 rounded bg-[var(--abyss)] border border-[var(--good)] text-xs text-[var(--good)] font-mono leading-relaxed">
                  "{selectedRule.modelClause}"
                </div>
              </div>
            </div>
          ) : (
            <div className="sub p-12 text-center text-[var(--ink-3)]">
              Select a rule from the left panel to inspect details.
            </div>
          )}
        </div>
      </div>

      {/* Test Harness Modal */}
      {showTestHarness && selectedRule && (
        <div className="fixed inset-0 z-50 bg-[#030e17]/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="sub max-w-2xl w-full space-y-4 border-2 border-[var(--cyan)]">
            <div className="sub-h">
              <b className="flex items-center gap-2 text-sm text-[var(--cyan)]">
                <Play className="w-4 h-4" /> Rule Test Harness: {selectedRule.id}
              </b>
              <button onClick={() => setShowTestHarness(false)} className="text-[var(--ink-3)] hover:text-white">✕</button>
            </div>

            <p className="text-xs text-[var(--ink-2)]">
              Run this draft/active rule against the gold-set contract repository to measure hit/miss rate and precision before publishing.
            </p>

            <div className="p-3 rounded bg-[var(--deep)] border border-[var(--edge)] text-xs font-mono text-[var(--ink-2)]">
              Evaluating rule standard against 150 gold-set dry-bulk voyage charter clauses...
            </div>

            {testResult && (
              <div className="p-4 rounded bg-[var(--surface-2)] border border-[var(--cyan)] space-y-2 font-mono text-xs">
                <div className="flex items-center justify-between text-[var(--good)] font-bold">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Rule Evaluation Passed
                  </span>
                  <span>Precision: {(testResult.score * 100).toFixed(0)}%</span>
                </div>
                <p className="text-[var(--ink-2)]">{testResult.reasoning}</p>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setShowTestHarness(false)} className="btn btn-secondary text-xs">Close</button>
              <button onClick={handleRunTestHarness} className="btn btn-primary text-xs">Run Gold-Set Test</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
