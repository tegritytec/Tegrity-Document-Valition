import React, { useState } from 'react';
import { Upload, FileText, CheckCircle2, Play, Sparkles, Layers, Edit3, ShieldCheck } from 'lucide-react';
import { CaseData, DocumentFile, ExtractedField } from '../types/tdv';

interface IngestionViewProps {
  activeCase: CaseData;
  onUpdateExtractedField: (fieldId: string, newValue: string) => void;
  onLaunchAnalysis: () => void;
}

export const IngestionView: React.FC<IngestionViewProps> = ({
  activeCase,
  onUpdateExtractedField,
  onLaunchAnalysis
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [isLaunching, setIsLaunching] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleStartEdit = (field: ExtractedField) => {
    setEditingFieldId(field.id);
    setEditValue(field.value);
  };

  const handleSaveEdit = (fieldId: string) => {
    onUpdateExtractedField(fieldId, editValue);
    setEditingFieldId(null);
  };

  const handleRunAnalysisModal = () => {
    setIsLaunching(true);
    setAnalysisStep(1);
    setTimeout(() => setAnalysisStep(2), 800);
    setTimeout(() => setAnalysisStep(3), 1600);
    setTimeout(() => setAnalysisStep(4), 2400);
    setTimeout(() => {
      setIsLaunching(false);
      onLaunchAnalysis();
    }, 3200);
  };

  return (
    <div className="p-5 max-w-7xl mx-auto space-y-5 animate-fade-in">
      {/* Top Banner Sub-Panel */}
      <div className="sub border-l-4 border-l-[var(--cyan)]">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="pip live dot">Capability F3</span>
              <span className="mono text-xs text-[var(--ink-3)]">INGESTION & STRUCTURING ENGINE</span>
            </div>
            <h1 className="text-2xl font-extrabold text-[var(--ink)] tracking-tight">
              Document Ingestion & Pre-Flight Analysis
            </h1>
            <p className="text-[var(--ink-2)] text-xs mt-1 max-w-3xl">
              Upload charter parties, rider clauses, and recaps. TDV automatically classifies document types, performs OCR quality scoring, segments clauses, and extracts key commercial terms.
            </p>
          </div>

          <button
            onClick={handleRunAnalysisModal}
            disabled={isLaunching}
            className="btn btn-primary px-5 py-2.5 text-xs flex items-center gap-2 font-bold whitespace-nowrap"
          >
            <Play className="w-4 h-4 fill-[#031206]" />
            <span>Launch Validation Pipeline (F4)</span>
          </button>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Upload Zone & Document List (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Drag & Drop Zone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            className={`sub p-8 text-center transition-all border-dashed ${
              dragActive ? 'border-[var(--signal)] bg-[var(--surface-2)]' : 'border-[var(--edge)] hover:border-[var(--edge-hi)]'
            }`}
          >
            <div className="w-12 h-12 mx-auto rounded bg-[var(--surface-3)] border border-[var(--edge)] flex items-center justify-center text-[var(--signal)] mb-3">
              <Upload className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[var(--ink)]">Drag & Drop Contract Files</h3>
            <p className="text-[var(--ink-3)] text-xs mt-1">
              Supports PDF, DOCX, EML, MSG, scanned images (Max 100 MB per file, 500 pages)
            </p>
            <div className="mt-4 flex items-center justify-center gap-3">
              <label className="btn btn-secondary text-xs cursor-pointer">
                Browse Files
                <input type="file" multiple className="hidden" />
              </label>
              <span className="text-[var(--ink-3)] text-xs font-mono">or connect SharePoint / Google Drive</span>
            </div>
          </div>

          {/* Ingested Documents List */}
          <div className="sub space-y-3">
            <div className="sub-h">
              <b>Ingested Contract Files ({activeCase.documents.length})</b>
              <span>Precedence Order Governed</span>
            </div>

            <div className="rows">
              {activeCase.documents.map((doc: DocumentFile) => (
                <div key={doc.id} className="row info flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="pip info mono">#{doc.precedenceOrder}</span>
                    <div>
                      <span className="rt">{doc.name}</span>
                      <div className="flex items-center gap-2 text-xs mt-0.5">
                        <span className="chip">{doc.type}</span>
                        <span className="mono text-[var(--ink-3)]">{doc.pages} Pages</span>
                        <span className="text-[var(--good)] font-mono text-[11px] flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> OCR {doc.ocrQuality}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right text-xs font-mono">
                    <div className="text-[var(--ink-3)]">SHA256: {doc.sha256.substring(0, 8)}...</div>
                    <span className="text-[var(--ink-3)] text-[10px]">Uploaded {new Date(doc.uploadedAt).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Key Field Extraction Panel (5 cols) */}
        <div className="lg:col-span-5">
          <div className="sub space-y-4">
            <div className="sub-h">
              <b>Extracted Key Terms (F3 AI Structuring)</b>
              <span className="text-[var(--good)] font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> High Confidence
              </span>
            </div>

            <div className="space-y-2.5">
              {activeCase.extractedFields.map((field) => {
                const isEditing = editingFieldId === field.id;
                return (
                  <div key={field.id} className="p-3 rounded bg-[var(--surface-2)] border border-[var(--edge)]">
                    <div className="flex items-center justify-between text-xs text-[var(--ink-3)] mb-1 font-mono">
                      <span>{field.name}</span>
                      <span className="text-[var(--cyan)]">{(field.confidence * 100).toFixed(0)}% AI Conf</span>
                    </div>

                    {isEditing ? (
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="glass-input text-xs flex-1 py-1 px-2 font-mono"
                        />
                        <button
                          onClick={() => handleSaveEdit(field.id)}
                          className="btn btn-primary py-1 px-2 text-xs"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between text-xs text-[var(--ink)] font-semibold font-mono">
                        <span className="break-all">{field.value}</span>
                        <button
                          onClick={() => handleStartEdit(field)}
                          className="text-[var(--ink-3)] hover:text-[var(--signal)] p-1"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Modal */}
      {isLaunching && (
        <div className="fixed inset-0 z-50 bg-[#030e17]/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="sub max-w-lg w-full text-center space-y-5 border-2 border-[var(--signal)]">
            <div className="w-14 h-14 mx-auto rounded-full bg-[var(--surface-2)] border border-[var(--signal)] flex items-center justify-center text-[var(--signal)] animate-spin">
              <Sparkles className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-[var(--ink)]">Running Validation Pipeline (F4)</h3>
              <p className="text-[var(--ink-3)] text-xs mt-1">Evaluating rules, retrieving clause intelligence, scoring expected loss...</p>
            </div>

            <div className="space-y-2 text-left text-xs font-mono">
              <div className={`p-3 rounded flex items-center gap-3 ${analysisStep >= 1 ? 'bg-[var(--surface-3)] text-[var(--signal)] border border-[var(--signal)]' : 'bg-[var(--deep)] text-[var(--ink-3)]'}`}>
                <CheckCircle2 className={`w-4 h-4 ${analysisStep >= 1 ? 'text-[var(--signal)]' : 'text-[var(--ink-3)]'}`} />
                <span>1. Layout OCR & Clause Segmentation</span>
              </div>
              <div className={`p-3 rounded flex items-center gap-3 ${analysisStep >= 2 ? 'bg-[var(--surface-3)] text-[var(--signal)] border border-[var(--signal)]' : 'bg-[var(--deep)] text-[var(--ink-3)]'}`}>
                <CheckCircle2 className={`w-4 h-4 ${analysisStep >= 2 ? 'text-[var(--signal)]' : 'text-[var(--ink-3)]'}`} />
                <span>2. F1 Governance Rules Evaluation (Sanctions, EU ETS)</span>
              </div>
              <div className={`p-3 rounded flex items-center gap-3 ${analysisStep >= 3 ? 'bg-[var(--surface-3)] text-[var(--signal)] border border-[var(--signal)]' : 'bg-[var(--deep)] text-[var(--ink-3)]'}`}>
                <CheckCircle2 className={`w-4 h-4 ${analysisStep >= 3 ? 'text-[var(--signal)]' : 'text-[var(--ink-3)]'}`} />
                <span>3. F2 Anonymized Clause Intelligence Benchmarking</span>
              </div>
              <div className={`p-3 rounded flex items-center gap-3 ${analysisStep >= 4 ? 'bg-[var(--surface-3)] text-[var(--signal)] border border-[var(--signal)]' : 'bg-[var(--deep)] text-[var(--ink-3)]'}`}>
                <CheckCircle2 className={`w-4 h-4 ${analysisStep >= 4 ? 'text-[var(--signal)]' : 'text-[var(--ink-3)]'}`} />
                <span>4. Section 18 Expected Loss & Case Risk Score (Noisy-OR)</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
