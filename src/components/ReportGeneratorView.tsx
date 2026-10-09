import React, { useState } from 'react';
import { FileSpreadsheet, Download, Share2, Lock, Sparkles } from 'lucide-react';
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
    <div className="p-5 max-w-7xl mx-auto space-y-5 animate-fade-in">
      {/* Top Banner Sub-Panel */}
      <div className="sub border-l-4 border-l-[var(--good)]">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="pip live dot">Capability F9</span>
              <span className="mono text-xs text-[var(--ink-3)]">REPORT GENERATION & DISTRIBUTION</span>
            </div>
            <h1 className="text-2xl font-extrabold text-[var(--ink)] tracking-tight">
              Executive Briefs, Audit Reports & DOCX Redlines
            </h1>
            <p className="text-[var(--ink-2)] text-xs mt-1 max-w-3xl">
              Generate branded executive summaries, full legal audit reports, and counterparty redline tracked changes. Enforces strict external sharing rules with automated redaction, OTP verification, and dynamic watermarking.
            </p>
          </div>

          <button
            onClick={() => onGenerateReport(selectedReportType)}
            className="btn btn-primary px-5 py-2.5 text-xs font-bold flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" /> Generate {selectedReportType}
          </button>
        </div>
      </div>

      {/* Format Selector Bar */}
      <div className="sub flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {(['Executive Summary', 'Detailed Audit Report', 'DOCX Redline Pack'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setSelectedReportType(type)}
              className={`px-4 py-2 rounded text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                selectedReportType === type
                  ? 'bg-[var(--surface-2)] text-[var(--good)] border border-[var(--good)]'
                  : 'bg-[var(--surface)] text-[var(--ink-3)] border border-[var(--edge)] hover:text-[var(--ink)]'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Redaction Toggle */}
        <div className="flex items-center gap-3 bg-[var(--surface)] px-3 py-1.5 rounded border border-[var(--edge)] text-xs font-mono">
          <Lock className="w-3.5 h-3.5 text-[var(--good)]" />
          <span className="text-[var(--ink-2)]">External Sharing Redaction:</span>
          <button
            onClick={() => setIsRedacted(!isRedacted)}
            className={`px-2.5 py-0.5 rounded font-bold transition-colors ${
              isRedacted ? 'bg-[var(--surface-2)] text-[var(--good)] border border-[var(--good)]' : 'bg-[var(--surface-2)] text-[var(--rose)] border border-[var(--rose)]'
            }`}
          >
            {isRedacted ? 'ON (Hide Internal Scores)' : 'OFF (Internal View)'}
          </button>
        </div>
      </div>

      {/* Report Preview Document Surface */}
      <div className="sub doc p-8 space-y-6 max-w-4xl mx-auto border border-[var(--edge)] bg-[var(--deep)] text-[var(--ink-2)] relative overflow-hidden">
        {/* Dynamic Watermark */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none text-5xl font-extrabold rotate-[-30deg] uppercase tracking-widest text-[var(--ink)] select-none whitespace-nowrap font-mono">
          TEGRITY TDV RATIFIED REPORT • {new Date().toLocaleDateString()}
        </div>

        {/* Report Header */}
        <div className="sub-h pb-4">
          <div>
            <div className="mono text-xs text-[var(--good)] font-bold">TEGRITY DOCUMENT VALIDATION ENGINE</div>
            <h1 className="text-2xl font-extrabold text-[var(--ink)] mt-0.5">{selectedReportType}</h1>
            <p className="mono text-xs text-[var(--ink-3)] mt-0.5">Case Reference: {activeCase.id} — {activeCase.title}</p>
          </div>

          <div className="text-right">
            <span className="pip ok">Ratified & Sealed</span>
            <div className="mono text-[11px] text-[var(--ink-3)] mt-1">Date: {activeCase.effectiveDate}</div>
          </div>
        </div>

        {/* Section 1 */}
        <div className="space-y-2 font-mono">
          <b className="text-xs uppercase tracking-wider text-[var(--cyan)] block">1. Executive Risk Overview</b>
          <div className="grid grid-cols-3 gap-4 p-4 rounded bg-[var(--surface)] border border-[var(--edge)] text-xs">
            <div>
              <div className="text-[var(--ink-3)]">Case Risk Score:</div>
              <div className="text-lg font-bold text-[var(--rose)]">{isRedacted ? '[REDACTED EXTERNAL]' : `${activeCase.riskScore} / 100 (${activeCase.riskBand})`}</div>
            </div>
            <div>
              <div className="text-[var(--ink-3)]">Quantified Exposure:</div>
              <div className="text-lg font-bold text-[var(--ink)]">${isRedacted ? '[REDACTED EXTERNAL]' : '$825,000'}</div>
            </div>
            <div>
              <div className="text-[var(--ink-3)]">Ratifying Authority:</div>
              <div className="text-xs font-bold text-[var(--good)] mt-1">Ashwani Sethi (Legal Lead)</div>
            </div>
          </div>
        </div>

        {/* Section 2 */}
        <div className="space-y-2 font-mono">
          <b className="text-xs uppercase tracking-wider text-[var(--cyan)] block">2. Key Clause Recommendations & Redline Wording</b>
          
          <div className="space-y-3 text-xs">
            {activeCase.findings.map((f) => (
              <div key={f.id} className="p-4 rounded bg-[var(--abyss)] border border-[var(--edge)] space-y-1.5">
                <div className="flex justify-between font-bold">
                  <span className="text-[var(--ink)]">{f.type} (ID: {f.id})</span>
                  <span className="text-[var(--good)]">Action: {f.recommendationAction.toUpperCase()}</span>
                </div>
                <div className="text-[var(--ink-2)] bg-[var(--deep)] p-3 rounded border border-[var(--edge)] leading-relaxed">
                  "{f.proposedText}"
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-3 border-t border-[var(--edge)] font-mono">
          <button onClick={() => setShowShareModal(true)} className="btn btn-secondary text-xs flex items-center gap-2">
            <Share2 className="w-3.5 h-3.5 text-[var(--good)]" /> Share Link
          </button>
          <button className="btn btn-primary text-xs flex items-center gap-2">
            <Download className="w-3.5 h-3.5" /> Download PDF / DOCX
          </button>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 bg-[#030e17]/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="sub max-w-md w-full space-y-4 border-2 border-[var(--good)]">
            <div className="sub-h">
              <b className="flex items-center gap-2 text-sm text-[var(--good)]">
                <Share2 className="w-4 h-4" /> Share External Secure Link
              </b>
              <button onClick={() => setShowShareModal(false)} className="text-[var(--ink-3)] hover:text-white">✕</button>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div>
                <label className="text-[var(--ink-2)] font-semibold">Recipient Email (Allow-listed Domain):</label>
                <input
                  type="email"
                  value={shareEmail}
                  onChange={(e) => setShareEmail(e.target.value)}
                  className="glass-input w-full mt-1"
                />
              </div>

              <div className="p-3 rounded bg-[var(--deep)] border border-[var(--edge)] space-y-1 text-[11px] text-[var(--ink-3)]">
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
