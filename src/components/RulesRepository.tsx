import React, { useState } from 'react';
import { BookOpenCheck, Search, Filter, ShieldAlert, Code2, Play, CheckCircle2, XCircle, Plus, FileCode2 } from 'lucide-react';
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
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Top Banner */}
      <div className="glass-panel p-6 border-l-4 border-l-cyan-500 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-cyan-400 font-semibold uppercase tracking-wider mb-1">
            <BookOpenCheck className="w-4 h-4" /> Capability F1 — Governing Compliance Rules Repository
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Global Shipping Rules & Rule Packs
          </h2>
          <p className="text-slate-400 text-sm mt-1 max-w-3xl">
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
          className="btn btn-primary px-5 py-2.5 text-xs flex items-center gap-2 font-bold"
        >
          <Plus className="w-4 h-4" /> Author New Rule
        </button>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Search rules by ID, title, citation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="glass-input pl-9 w-full text-xs"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-500" />
          {domains.map((d) => (
            <button
              key={d}
              onClick={() => setSelectedDomain(d)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedDomain === d
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Rule List (5 cols) */}
        <div className="lg:col-span-5 space-y-3 max-h-[680px] overflow-y-auto pr-1">
          {filteredRules.map((rule) => {
            const isSelected = selectedRule?.id === rule.id;
            return (
              <div
                key={rule.id}
                onClick={() => setSelectedRule(rule)}
                className={`p-4 rounded-xl cursor-pointer transition-all border ${
                  isSelected
                    ? 'bg-slate-900 border-cyan-500/50 shadow-lg shadow-cyan-500/10'
                    : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-cyan-400 font-bold">{rule.id}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {rule.version}
                    </span>
                  </div>
                  <span className={`badge badge-${rule.severity.toLowerCase()}`}>
                    {rule.severity}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white mb-1">{rule.title}</h3>
                <p className="text-slate-400 text-xs line-clamp-2">{rule.logicDescription}</p>

                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-800/60 pt-2">
                  <span>Domain: {rule.domain}</span>
                  <span>Jurisdiction: {rule.jurisdiction}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Selected Rule Inspector & Test Harness (7 cols) */}
        <div className="lg:col-span-7">
          {selectedRule ? (
            <div className="glass-panel p-6 space-y-6">
              <div className="flex items-start justify-between pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-sm text-cyan-400 font-bold">{selectedRule.id}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      Version {selectedRule.version}
                    </span>
                    <span className="text-xs text-slate-400 font-mono ml-2">Source: {selectedRule.sourceRef}</span>
                  </div>
                  <h2 className="text-xl font-bold text-white">{selectedRule.title}</h2>
                </div>

                <button
                  onClick={() => setShowTestHarness(true)}
                  className="btn btn-secondary text-xs flex items-center gap-2 border-cyan-500/30 text-cyan-300 hover:bg-cyan-950/40"
                >
                  <Play className="w-3.5 h-3.5" /> Test Harness
                </button>
              </div>

              {/* Attributes Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                  <div className="text-[11px] text-slate-400">Domain</div>
                  <div className="text-sm font-semibold text-white mt-0.5">{selectedRule.domain}</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                  <div className="text-[11px] text-slate-400">Jurisdiction</div>
                  <div className="text-sm font-semibold text-white mt-0.5">{selectedRule.jurisdiction}</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                  <div className="text-[11px] text-slate-400">Effective Date</div>
                  <div className="text-sm font-semibold text-white mt-0.5">{selectedRule.validFrom}</div>
                </div>
              </div>

              {/* Plain-Language Description & Logic */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Code2 className="w-4 h-4 text-cyan-400" /> Detection Logic & Intent
                </h4>
                <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 font-mono text-xs text-slate-300">
                  {selectedRule.logicDescription}
                </div>
              </div>

              {/* Standard Model Clause Wording */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <FileCode2 className="w-4 h-4 text-emerald-400" /> Standard Model Clause Wording
                </h4>
                <div className="p-4 rounded-xl bg-slate-950 border border-emerald-900/40 text-xs text-emerald-300 leading-relaxed font-mono">
                  "{selectedRule.modelClause}"
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-panel p-12 text-center text-slate-400">
              Select a rule from the left panel to inspect details.
            </div>
          )}
        </div>
      </div>

      {/* Test Harness Modal */}
      {showTestHarness && selectedRule && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel p-6 max-w-2xl w-full space-y-5 border border-cyan-500/40 animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Play className="w-5 h-5 text-cyan-400" />
                Rule Test Harness: {selectedRule.id}
              </h3>
              <button onClick={() => setShowTestHarness(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <p className="text-xs text-slate-400">
              Run this draft/active rule against the gold-set contract repository to measure hit/miss rate and precision before publishing.
            </p>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
              Evaluating rule standard against 150 gold-set dry-bulk voyage charter clauses...
            </div>

            {testResult && (
              <div className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-700/50 space-y-2 animate-fade-in">
                <div className="flex items-center justify-between text-xs font-bold text-cyan-300">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Rule Evaluation Passed
                  </span>
                  <span>Precision: {(testResult.score * 100).toFixed(0)}%</span>
                </div>
                <p className="text-xs text-slate-300">{testResult.reasoning}</p>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setShowTestHarness(false)} className="btn btn-secondary text-xs">
                Close
              </button>
              <button onClick={handleRunTestHarness} className="btn btn-primary text-xs">
                Run Gold-Set Test
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
