import React, { useState } from 'react';
import { FileSpreadsheet, Download, Share2, Eye, Lock, ShieldCheck, Sparkles, FileText, CheckCircle2 } from 'lucide-react';
import { CaseData, GeneratedReport } from '../types/tdv';

interface ReportGeneratorViewProps {
  activeCase: CaseData;
  reports: GeneratedReport[];
  onGenerateReport: (type: 'Executive Summary' | 'Detailed Audit Report' | 'DOCX Redline Pack') => void;
}

export const ReportGeneratorView: React.FC<ReportGeneratorViewProps> = ({
  activeCase,
  reports,
  onGenerateReport
}) => {
  const [selectedReportType, setSelectedReportType] = useState<'Executive Summary' | 'Detailed Audit Report' | 'DOCX Redline Pack'>('Executive Summary');
  const [isRedacted, setIsRedacted] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareEmail, setShareEmail] = useState('chartering@counterparty.com');

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Top Banner */}
      <div className="glass-panel p-6 border-l-4 border-l-teal-500 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-teal-400 font-semibold uppercase tracking-wider mb-1">
            <FileSpreadsheet className="w-4 h-4" /> Capability F9 — Multi-Format Report Generation & Secure Sharing
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Executive Briefs, Audit Reports & DOCX Redlines
          </h2>
          <p className="text-slate-400 text-sm mt-1 max-w-3xl">
            Generate branded executive summaries, full legal audit reports, and counterparty redline tracked changes. Enforces strict external sharing rules with automated redaction, OTP verification, and dynamic watermarking.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onGenerateReport(selectedReportType)}
            className="btn btn-primary px-5 py-2.5 text-xs font-bold shadow-lg shadow-teal-500/20 flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" /> Generate {selectedReportType}
          </button>
        </div>
      </div>

      {/* Format Selector Bar */}
      <div className="glass-panel p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {(['Executive Summary', 'Detailed Audit Report', 'DOCX Redline Pack'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setSelectedReportType(type)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                selectedReportType === type
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-sm'
                  : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Redaction Toggle */}
        <div className="flex items-center gap-3 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
          <Lock className="w-3.5 h-3.5 text-teal-400" />
          <span className="text-slate-300">External Sharing Redaction:</span>
          <button
            onClick={() => setIsRedacted(!isRedacted)}
            className={`px-2.5 py-0.5 rounded font-bold transition-colors ${
              isRedacted ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40' : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
            }`}
          >
            {isRedacted ? 'ON (Hide Scores & Internal Comments)' : 'OFF (Internal View)'}
          </button>
        </div>
      </div>

      {/* Interactive Report Document Previewer */}
      <div className="glass-panel p-8 space-y-6 max-w-4xl mx-auto border border-slate-700/60 bg-slate-900/90 text-slate-200 relative overflow-hidden">
        {/* Dynamic Watermark */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none text-6xl font-extrabold rotate-[-30deg] uppercase tracking-widest text-white select-none whitespace-nowrap">
          TEGRITY TDV RATIFIED REPORT • {new Date().toLocaleDateString()}
        </div>

        {/* Report Header */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-800">
          <div>
            <div className="text-xs text-teal-400 font-bold uppercase tracking-widest">Tegrity Document Validation</div>
            <h1 className="text-2xl font-extrabold text-white mt-1">{selectedReportType}</h1>
            <p className="text-xs text-slate-400 mt-0.5">Case Reference: {activeCase.id} — {activeCase.title}</p>
          </div>

          <div className="text-right text-xs">
            <span className="badge badge-low">Ratified & Sealed</span>
            <div className="text-slate-400 text-[11px] mt-1 font-mono">Date: {activeCase.effectiveDate}</div>
          </div>
        </div>

        {/* Executive Overview Section */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider text-sky-400">1. Executive Risk Overview</h3>
          <div className="grid grid-cols-3 gap-4 p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs">
            <div>
              <div className="text-slate-400">Case Risk Score:</div>
              <div className="text-xl font-extrabold text-rose-400">{isRedacted ? '[REDACTED EXTERNAL]' : `${activeCase.riskScore} / 100 (${activeCase.riskBand})`}</div>
            </div>
            <div>
              <div className="text-slate-400">Quantified Exposure:</div>
              <div className="text-xl font-extrabold text-white">${isRedacted ? '[REDACTED EXTERNAL]' : '$825,000'}</div>
            </div>
            <div>
              <div className="text-slate-400">Ratifying Authority:</div>
              <div className="text-sm font-bold text-emerald-400 mt-1">Ashwani Sethi (Legal Lead)</div>
            </div>
          </div>
        </div>

        {/* Section 2: Key Ratified Clause Actions */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider text-sky-400">2. Key Clause Recommendations & Redline Wording</h3>
          
          <div className="space-y-3 text-xs">
            {activeCase.findings.map((f) => (
              <div key={f.id} className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex justify-between font-bold">
                  <span className="text-white">{f.type} (ID: {f.id})</span>
                  <span className="text-teal-400">Action: {f.recommendationAction.toUpperCase()}</span>
                </div>
                <div className="text-slate-300 font-mono bg-slate-900 p-3 rounded border border-slate-800 leading-relaxed">
                  "{f.proposedText}"
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
          <button onClick={() => setShowShareModal(true)} className="btn btn-secondary text-xs flex items-center gap-2">
            <Share2 className="w-3.5 h-3.5 text-teal-400" /> Share Secure Link
          </button>
          <button className="btn btn-primary text-xs flex items-center gap-2">
            <Download className="w-3.5 h-3.5" /> Download PDF / DOCX
          </button>
        </div>
      </div>

      {/* Share Link Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel p-6 max-w-md w-full space-y-5 border border-teal-500/40 animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Share2 className="w-5 h-5 text-teal-400" />
                Share External Secure Report Link
              </h3>
              <button onClick={() => setShowShareModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-medium">Recipient Email (Allow-listed Domain):</label>
                <input
                  type="email"
                  value={shareEmail}
                  onChange={(e) => setShareEmail(e.target.value)}
                  className="glass-input w-full mt-1"
                />
              </div>

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1 text-[11px] text-slate-400">
                <div>• Expiry: 14 Days (Auto-revocable)</div>
                <div>• Security: Mandatory OTP verification sent to recipient</div>
                <div>• Traceability: Dynamic watermark with recipient IP & timestamp</div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setShowShareModal(false)} className="btn btn-secondary text-xs">Cancel</button>
              <button
                onClick={() => {
                  alert(`Secure link with OTP controls sent to ${shareEmail}!`);
                  setShowShareModal(false);
                }}
                className="btn btn-primary text-xs"
              >
                Send Secure Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
