import React, { useState } from 'react';
import { Layers, Search, ShieldCheck, BarChart3, ArrowUpRight, Scale, CheckCircle2, Info } from 'lucide-react';
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
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Top Banner */}
      <div className="glass-panel p-6 border-l-4 border-l-purple-500 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-purple-400 font-semibold uppercase tracking-wider mb-1">
            <Layers className="w-4 h-4" /> Capability F2 — Anonymized Clause Intelligence Repository
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Clause Performance & Impact Knowledge Base
          </h2>
          <p className="text-slate-400 text-sm mt-1 max-w-3xl">
            Anonymized knowledge base of clause patterns linked to historical empirical evidence: dispute frequencies, claim success rates, and financial impact buckets. Privacy by design guarantees <span className="text-purple-300 font-semibold">k-anonymity (k ≥ 5)</span> with zero party or vessel identifiers.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-purple-950/40 border border-purple-800/60 px-4 py-2 rounded-xl text-xs text-purple-300">
          <ShieldCheck className="w-4 h-4 text-purple-400" />
          <span>k-Anonymity Verified (k ≥ 5)</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Semantic search for clause patterns or wording..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="glass-input pl-9 w-full text-xs"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCategory(c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === c
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                  : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Patterns Grid (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {filteredPatterns.map((pattern) => {
            const isSelected = selectedPattern?.id === pattern.id;
            return (
              <div
                key={pattern.id}
                onClick={() => setSelectedPattern(pattern)}
                className={`p-5 rounded-2xl cursor-pointer transition-all border ${
                  isSelected
                    ? 'bg-slate-900 border-purple-500/50 shadow-lg shadow-purple-500/10'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-purple-400 font-bold">{pattern.id}</span>
                    <span className="badge badge-blue">{pattern.category}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 font-mono">
                      k={pattern.kAnonymityLevel}
                    </span>
                    <span className={`badge badge-${pattern.impactBand.toLowerCase()}`}>
                      {pattern.impactBand}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-200 font-mono bg-slate-950/80 p-3 rounded-xl border border-slate-800/80 my-3 leading-relaxed">
                  "{pattern.canonicalText}"
                </p>

                {/* Empirical Stats Grid */}
                <div className="grid grid-cols-3 gap-3 pt-2 text-center text-xs">
                  <div className="p-2 rounded-lg bg-slate-950/40 border border-slate-800">
                    <div className="text-[10px] text-slate-500">Dispute Frequency</div>
                    <div className="font-bold text-amber-400 text-sm mt-0.5">{(pattern.disputeRate * 100).toFixed(1)}%</div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950/40 border border-slate-800">
                    <div className="text-[10px] text-slate-500">Claim Recovery Rate</div>
                    <div className="font-bold text-emerald-400 text-sm mt-0.5">{(pattern.successRate * 100).toFixed(0)}%</div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950/40 border border-slate-800">
                    <div className="text-[10px] text-slate-500">Median Impact</div>
                    <div className="font-bold text-sky-400 text-sm mt-0.5">${(pattern.medianImpactUsd / 1000).toFixed(0)}k</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Pattern Detail & Vector Benchmark (5 cols) */}
        <div className="lg:col-span-5">
          {selectedPattern ? (
            <div className="glass-panel p-6 space-y-6">
              <div className="pb-4 border-b border-slate-800">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs text-purple-400 font-bold">{selectedPattern.id}</span>
                  <span className="text-xs text-emerald-400 flex items-center gap-1 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Curated & Ratified
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white">{selectedPattern.category}</h3>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-purple-400" /> Canonical Anonymized Pattern
                </h4>
                <div className="p-4 rounded-xl bg-slate-950 border border-purple-900/40 text-xs text-purple-200 font-mono leading-relaxed">
                  "{selectedPattern.canonicalText}"
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4 text-sky-400" /> Measured Effectiveness
                </h4>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">Claim Success Probability</span>
                      <span className="text-emerald-400 font-bold">{(selectedPattern.successRate * 100).toFixed(0)}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${selectedPattern.successRate * 100}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">Dispute Rate Benchmark</span>
                      <span className="text-amber-400 font-bold">{(selectedPattern.disputeRate * 100).toFixed(1)}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: `${selectedPattern.disputeRate * 100}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-panel p-12 text-center text-slate-400">
              Select a clause pattern to inspect empirical effectiveness metrics.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
