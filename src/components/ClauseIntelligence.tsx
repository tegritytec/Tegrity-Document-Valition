import React, { useState } from 'react';
import { Layers, Search, ShieldCheck, BarChart3, CheckCircle2 } from 'lucide-react';
import { ClausePattern } from '../types/tdv';

interface ClauseIntelligenceProps {
  patterns: ClausePattern[];
}

export const ClauseIntelligence: React.FC<ClauseIntelligenceProps> = ({ patterns }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedPattern, setSelectedPattern] = useState<ClausePattern | null>(patterns[0] || null);

  const categories = ['All', 'Sanctions & Trade Controls', 'Emissions & EU ETS', 'Demurrage & Laytime', 'Cargo Liability'];

  const filteredPatterns = patterns.filter(p => {
    const matchesSearch = p.canonicalText.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-5 max-w-7xl mx-auto space-y-5 animate-fade-in">
      {/* Top Banner Sub-Panel */}
      <div className="sub border-l-4 border-l-[var(--violet)]">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="pip live dot">Capability F2</span>
              <span className="mono text-xs text-[var(--ink-3)]">ANONYMIZED CLAUSE KNOWLEDGE BASE</span>
            </div>
            <h1 className="text-2xl font-extrabold text-[var(--ink)] tracking-tight">
              Clause Performance & Empirical Impact
            </h1>
            <p className="text-[var(--ink-2)] text-xs mt-1 max-w-3xl">
              Anonymized knowledge base of clause patterns linked to historical empirical evidence: dispute frequencies, claim success rates, and financial impact buckets. Guaranteed <span className="text-[var(--violet)] font-semibold font-mono">k-anonymity (k ≥ 5)</span> privacy protection.
            </p>
          </div>

          <span className="pip live dot">k-Anonymity Verified (k ≥ 5)</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="sub flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-3 text-[var(--ink-3)]" />
          <input
            type="text"
            placeholder="Semantic search for clause patterns or wording..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="glass-input pl-9 w-full text-xs font-mono"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCategory(c)}
              className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                selectedCategory === c
                  ? 'bg-[var(--surface-2)] text-[var(--violet)] border border-[var(--violet)]'
                  : 'bg-[var(--surface)] text-[var(--ink-3)] border border-[var(--edge)] hover:text-[var(--ink)]'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Patterns List (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          {filteredPatterns.map((pattern) => {
            const isSelected = selectedPattern?.id === pattern.id;
            return (
              <div
                key={pattern.id}
                onClick={() => setSelectedPattern(pattern)}
                className={`sub cursor-pointer transition-all ${
                  isSelected ? 'border-[var(--violet)] bg-[var(--surface-2)] shadow-md' : 'border-[var(--edge)]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="text-[var(--violet)] font-bold">{pattern.id}</span>
                    <span className="chip">{pattern.category}</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="chip">k={pattern.kAnonymityLevel}</span>
                    <span className={`pip ${pattern.impactBand === 'Critical' ? 'crit' : 'warn'}`}>
                      {pattern.impactBand}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-[var(--ink)] font-mono bg-[var(--abyss)] p-3 rounded border border-[var(--edge)] my-3 leading-relaxed">
                  "{pattern.canonicalText}"
                </p>

                {/* Empirical Stats Grid */}
                <div className="grid grid-cols-3 gap-3 pt-1 text-center font-mono text-xs">
                  <div className="p-2 rounded bg-[var(--surface)] border border-[var(--edge)]">
                    <div className="text-[10px] text-[var(--ink-3)]">Dispute Rate</div>
                    <div className="font-bold text-[var(--amber)] text-sm mt-0.5">{(pattern.disputeRate * 100).toFixed(1)}%</div>
                  </div>
                  <div className="p-2 rounded bg-[var(--surface)] border border-[var(--edge)]">
                    <div className="text-[10px] text-[var(--ink-3)]">Claim Recovery</div>
                    <div className="font-bold text-[var(--good)] text-sm mt-0.5">{(pattern.successRate * 100).toFixed(0)}%</div>
                  </div>
                  <div className="p-2 rounded bg-[var(--surface)] border border-[var(--edge)]">
                    <div className="text-[10px] text-[var(--ink-3)]">Median Impact</div>
                    <div className="font-bold text-[var(--cyan)] text-sm mt-0.5">${(pattern.medianImpactUsd / 1000).toFixed(0)}k</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Pattern Detail (5 cols) */}
        <div className="lg:col-span-5">
          {selectedPattern ? (
            <div className="sub space-y-5">
              <div className="sub-h">
                <div>
                  <span className="mono text-xs text-[var(--violet)] font-bold">{selectedPattern.id}</span>
                  <h3 className="text-lg font-bold text-[var(--ink)] mt-0.5">{selectedPattern.category}</h3>
                </div>
                <span className="pip ok">Curated Pattern</span>
              </div>

              <div className="space-y-1.5">
                <div className="sub-h">
                  <b>Canonical Anonymized Wording</b>
                </div>
                <div className="p-4 rounded bg-[var(--abyss)] border border-[var(--edge)] text-xs text-[var(--ink)] font-mono leading-relaxed">
                  "{selectedPattern.canonicalText}"
                </div>
              </div>

              <div className="space-y-3 pt-1">
                <div className="sub-h">
                  <b>Measured Empirical Effectiveness</b>
                </div>

                <div className="meter">
                  <div className="meter-row">
                    <span className="ml">Claim Success Probability</span>
                    <span className="mv text-[var(--good)]">{(selectedPattern.successRate * 100).toFixed(0)}%</span>
                  </div>
                  <div className="meter-bar">
                    <i style={{ width: `${selectedPattern.successRate * 100}%`, background: 'var(--good)' }} />
                  </div>
                </div>

                <div className="meter">
                  <div className="meter-row">
                    <span className="ml">Dispute Frequency Rate</span>
                    <span className="mv text-[var(--amber)]">{(selectedPattern.disputeRate * 100).toFixed(1)}%</span>
                  </div>
                  <div className="meter-bar">
                    <i style={{ width: `${selectedPattern.disputeRate * 100}%`, background: 'var(--amber)' }} />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="sub p-12 text-center text-[var(--ink-3)]">
              Select a clause pattern to inspect empirical effectiveness metrics.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
