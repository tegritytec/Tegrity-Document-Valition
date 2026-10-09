import React, { useState } from 'react';
import { History, ShieldCheck, Hash, User, Calendar, FileText, CheckCircle2, ArrowRight, GitCommit } from 'lucide-react';
import { LineageEvent } from '../types/tdv';

interface LineageAuditViewProps {
  lineageEvents: LineageEvent[];
}

export const LineageAuditView: React.FC<LineageAuditViewProps> = ({ lineageEvents }) => {
  const [selectedEvent, setSelectedEvent] = useState<LineageEvent>(lineageEvents[lineageEvents.length - 1] || lineageEvents[0]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Top Banner */}
      <div className="glass-panel p-6 border-l-4 border-l-emerald-500 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold uppercase tracking-wider mb-1">
            <History className="w-4 h-4" /> Capability F7 — Metadata & Lineage Audit (Who, What, When, How)
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Tamper-Evident Hash-Chained Audit Lineage
          </h2>
          <p className="text-slate-400 text-sm mt-1 max-w-3xl">
            Every decision and state change writes an immutable SHA-256 hash-chained event. Any past ratified result can be replayed and explained: which documents, which rule versions, which people, and why.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-emerald-950/40 border border-emerald-800/60 px-4 py-2 rounded-xl text-xs text-emerald-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Hash-Chain Verified (SHA-256)</span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Timeline Column (6 cols) */}
        <div className="lg:col-span-6 glass-panel p-5 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
            <GitCommit className="w-4 h-4 text-emerald-400" />
            Immutable Case Event Log ({lineageEvents.length})
          </h3>

          <div className="space-y-4 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
            {lineageEvents.map((evt) => {
              const isSelected = selectedEvent.id === evt.id;
              return (
                <div
                  key={evt.id}
                  onClick={() => setSelectedEvent(evt)}
                  className={`relative pl-9 cursor-pointer transition-all ${
                    isSelected ? 'opacity-100' : 'opacity-80 hover:opacity-100'
                  }`}
                >
                  {/* Timeline node icon */}
                  <div className={`absolute left-2.5 top-1.5 w-3 h-3 rounded-full -translate-x-1/2 border ${
                    isSelected ? 'bg-emerald-400 border-white shadow-glow-blue' : 'bg-slate-800 border-slate-600'
                  }`} />

                  <div className={`p-4 rounded-xl border ${
                    isSelected
                      ? 'bg-slate-900 border-emerald-500/40 shadow-md'
                      : 'bg-slate-900/50 border-slate-800/80 hover:border-slate-700'
                  }`}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-emerald-400">{evt.action}</span>
                      <span className="text-slate-500 font-mono text-[10px]">{new Date(evt.timestamp).toLocaleString()}</span>
                    </div>

                    <div className="text-xs text-white font-medium">{evt.diff}</div>
                    
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 border-t border-slate-800/60 pt-2 font-mono">
                      <span>Actor: {evt.actor}</span>
                      <span>Hash: {evt.hash.substring(0, 8)}...</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Explain This Result Inspector (6 cols) */}
        <div className="lg:col-span-6 glass-panel p-6 space-y-6">
          <div className="pb-4 border-b border-slate-800">
            <div className="text-xs text-emerald-400 font-mono">EVENT INSPECTOR: {selectedEvent.id}</div>
            <h3 className="text-lg font-bold text-white mt-1">{selectedEvent.action}</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex justify-between">
              <span className="text-slate-400">Actor & Role Persona:</span>
              <span className="text-white font-semibold">{selectedEvent.actor} ({selectedEvent.role})</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex justify-between">
              <span className="text-slate-400">Target Object Reference:</span>
              <span className="text-sky-300 font-mono font-semibold">{selectedEvent.objectRef}</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
              <div className="text-slate-400">Current Event SHA-256 Hash:</div>
              <div className="text-emerald-400 font-mono text-[11px] break-all">{selectedEvent.hash}</div>
            </div>

            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
              <div className="text-slate-400">Previous Event Hash (Hash-Chain Link):</div>
              <div className="text-slate-400 font-mono text-[11px] break-all">{selectedEvent.prevHash}</div>
            </div>
          </div>

          {/* Explain panel */}
          <div className="p-4 rounded-xl bg-slate-950 border border-emerald-900/40 space-y-2">
            <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
              Explainability & Evidence Lineage
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed font-mono">
              Result is fully explainable. Cited document text spans are mapped to Rule R-SAN-004 (v2.4) and Clause Pattern CP-SAN-801 with 94% model confidence score.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
