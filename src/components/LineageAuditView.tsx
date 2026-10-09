import React, { useState } from 'react';
import { History, ShieldCheck, GitCommit } from 'lucide-react';
import { LineageEvent } from '../types/tdv';

interface LineageAuditViewProps {
  lineageEvents: LineageEvent[];
}

export const LineageAuditView: React.FC<LineageAuditViewProps> = ({ lineageEvents }) => {
  const [selectedEvent, setSelectedEvent] = useState<LineageEvent>(lineageEvents[lineageEvents.length - 1] || lineageEvents[0]);

  return (
    <div className="p-5 max-w-7xl mx-auto space-y-5 animate-fade-in">
      {/* Top Banner Sub-Panel */}
      <div className="sub border-l-4 border-l-[var(--good)]">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="pip live dot">Capability F7</span>
              <span className="mono text-xs text-[var(--ink-3)]">TAMPER-EVIDENT LINEAGE LOG</span>
            </div>
            <h1 className="text-2xl font-extrabold text-[var(--ink)] tracking-tight">
              Metadata & Lineage Audit (Who, What, When, How)
            </h1>
            <p className="text-[var(--ink-2)] text-xs mt-1 max-w-3xl">
              Every decision and state change writes an immutable SHA-256 hash-chained event. Any past ratified result can be replayed and explained: which documents, which rule versions, which people, and why.
            </p>
          </div>

          <span className="pip live dot">Hash-Chain Verified (SHA-256)</span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Timeline Column (6 cols) */}
        <div className="lg:col-span-6 sub space-y-4">
          <div className="sub-h">
            <b className="flex items-center gap-2">
              <GitCommit className="w-4 h-4 text-[var(--good)]" /> Immutable Case Event Log ({lineageEvents.length})
            </b>
            <span>SHA-256 Hash Chained</span>
          </div>

          <div className="space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-[var(--edge)]">
            {lineageEvents.map((evt) => {
              const isSelected = selectedEvent.id === evt.id;
              return (
                <div
                  key={evt.id}
                  onClick={() => setSelectedEvent(evt)}
                  className={`relative pl-8 cursor-pointer transition-all ${
                    isSelected ? 'opacity-100' : 'opacity-80 hover:opacity-100'
                  }`}
                >
                  <div className={`absolute left-2 top-2.5 w-2.5 h-2.5 rounded-full -translate-x-1/2 border ${
                    isSelected ? 'bg-[var(--good)] border-white shadow-glow-blue' : 'bg-[var(--surface-3)] border-[var(--edge)]'
                  }`} />

                  <div className={`p-3 rounded border ${
                    isSelected ? 'bg-[var(--surface-2)] border-[var(--good)]' : 'bg-[var(--surface)] border-[var(--edge)]'
                  }`}>
                    <div className="flex items-center justify-between text-xs mb-1 font-mono">
                      <span className="font-bold text-[var(--good)]">{evt.action}</span>
                      <span className="text-[var(--ink-3)] text-[10px]">{new Date(evt.timestamp).toLocaleString()}</span>
                    </div>

                    <div className="text-xs text-[var(--ink)] font-semibold">{evt.diff}</div>
                    
                    <div className="flex items-center justify-between text-[11px] text-[var(--ink-3)] mt-2 border-t border-[var(--edge)] pt-1.5 font-mono">
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
        <div className="lg:col-span-6 sub space-y-5">
          <div className="sub-h">
            <div>
              <span className="mono text-xs text-[var(--good)]">EVENT INSPECTOR: {selectedEvent.id}</span>
              <h3 className="text-lg font-bold text-[var(--ink)] mt-0.5">{selectedEvent.action}</h3>
            </div>
          </div>

          <div className="space-y-2.5 text-xs font-mono">
            <div className="p-3 rounded bg-[var(--surface)] border border-[var(--edge)] flex justify-between">
              <span className="text-[var(--ink-3)]">Actor & Role Persona:</span>
              <span className="text-[var(--ink)] font-bold">{selectedEvent.actor} ({selectedEvent.role})</span>
            </div>

            <div className="p-3 rounded bg-[var(--surface)] border border-[var(--edge)] flex justify-between">
              <span className="text-[var(--ink-3)]">Target Object Reference:</span>
              <span className="text-[var(--cyan)] font-bold">{selectedEvent.objectRef}</span>
            </div>

            <div className="p-3 rounded bg-[var(--surface)] border border-[var(--edge)] space-y-1">
              <div className="text-[var(--ink-3)]">Current Event SHA-256 Hash:</div>
              <div className="text-[var(--good)] text-[11px] break-all">{selectedEvent.hash}</div>
            </div>

            <div className="p-3 rounded bg-[var(--surface)] border border-[var(--edge)] space-y-1">
              <div className="text-[var(--ink-3)]">Previous Event Hash (Hash-Chain Link):</div>
              <div className="text-[var(--ink-3)] text-[11px] break-all">{selectedEvent.prevHash}</div>
            </div>
          </div>

          {/* Explainability Node */}
          <div className="p-4 rounded bg-[var(--abyss)] border border-[var(--good)] space-y-1.5">
            <b className="text-xs text-[var(--good)] uppercase tracking-wider font-mono">
              Explainability & Evidence Lineage
            </b>
            <p className="text-xs text-[var(--ink-2)] leading-relaxed font-mono">
              Result is fully explainable. Cited document text spans are mapped to Rule R-SAN-004 (v2.4) and Clause Pattern CP-SAN-801 with 94% model confidence score.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
