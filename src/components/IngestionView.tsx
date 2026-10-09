import React, { useState } from 'react';
import { Upload, FileText, CheckCircle2, AlertTriangle, Play, Sparkles, Layers, Edit3, ArrowRight, ShieldCheck } from 'lucide-react';
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
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Top Banner */}
      <div className="glass-panel p-6 border-l-4 border-l-sky-500 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-sky-400 font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" /> Capability F3 — Multi-File Ingestion & Structuring
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Document Ingestion & Pre-Flight Analysis
          </h2>
          <p className="text-slate-400 text-sm mt-1 max-w-3xl">
            Upload charter parties, rider clauses, and recaps. TDV automatically classifies document types, performs OCR quality scoring, segments clauses, and extracts key commercial terms.
          </p>
        </div>

        <button
          onClick={handleRunAnalysisModal}
          disabled={isLaunching}
          className="btn btn-primary shadow-lg shadow-sky-500/25 px-6 py-3 text-sm flex items-center gap-2 font-bold whitespace-nowrap"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>Launch Analysis & Validation (F4)</span>
        </button>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Upload Zone & Document List (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Drag & Drop Zone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            className={`glass-panel p-8 border-2 border-dashed transition-all text-center rounded-2xl ${
              dragActive ? 'border-sky-400 bg-sky-500/10' : 'border-slate-700 hover:border-slate-500'
            }`}
          >
            <div className="w-14 h-14 mx-auto rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 mb-4 shadow-inner">
              <Upload className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-semibold text-white">Drag and drop contract documents here</h3>
            <p className="text-slate-400 text-xs mt-1">
              Supports PDF, DOCX, EML, MSG, scanned images (Max 100 MB per file, 500 pages)
            </p>
            <div className="mt-4 flex items-center justify-center gap-3">
              <label className="btn btn-secondary text-xs cursor-pointer">
                Browse Files
                <input type="file" multiple className="hidden" />
              </label>
              <span className="text-slate-500 text-xs">or connect SharePoint / Google Drive</span>
            </div>
          </div>

          {/* Ingested Documents List */}
          <div className="glass-panel p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-sky-400" />
                Ingested Contract Files ({activeCase.documents.length})
              </h3>
              <span className="text-xs text-slate-400">Precedence Order Governed</span>
            </div>

            <div className="space-y-3">
              {activeCase.documents.map((doc: DocumentFile) => (
                <div
                  key={doc.id}
                  className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-sky-950/60 border border-sky-800/50 flex items-center justify-center text-sky-400 font-bold text-xs">
                      #{doc.precedenceOrder}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">{doc.name}</h4>
                      <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                        <span className="badge badge-blue">{doc.type}</span>
                        <span>{doc.pages} Pages</span>
                        <span className="text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> OCR {doc.ocrQuality}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right text-xs">
                    <div className="text-slate-400 font-mono">SHA256: {doc.sha256.substring(0, 8)}...</div>
                    <span className="text-slate-500">Uploaded {new Date(doc.uploadedAt).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Key Field Extraction Panel (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-panel p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                Extracted Key Terms (F3 AI Structuring)
              </h3>
              <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> High Confidence
              </span>
            </div>

            <div className="space-y-3">
              {activeCase.extractedFields.map((field) => {
                const isEditing = editingFieldId === field.id;
                return (
                  <div
                    key={field.id}
                    className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                      <span className="font-semibold text-slate-300">{field.name}</span>
                      <span className="text-sky-400 font-mono">{(field.confidence * 100).toFixed(0)}% AI Conf</span>
                    </div>

                    {isEditing ? (
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="glass-input text-xs flex-1 py-1 px-2"
                        />
                        <button
                          onClick={() => handleSaveEdit(field.id)}
                          className="btn btn-success py-1 px-2 text-xs"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between text-sm text-white font-medium">
                        <span className="break-all">{field.value}</span>
                        <button
                          onClick={() => handleStartEdit(field)}
                          className="text-slate-500 hover:text-sky-400 p-1"
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

      {/* Launch Analysis Progress Modal */}
      {isLaunching && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel p-8 max-w-lg w-full text-center space-y-6 animate-fade-in border border-sky-500/30">
            <div className="w-16 h-16 mx-auto rounded-full bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-400 animate-spin">
              <Sparkles className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-white">Running Validation Pipeline (F4)</h3>
              <p className="text-slate-400 text-xs mt-1">Checking rules, retrieving clause patterns, and scoring exposure...</p>
            </div>

            <div className="space-y-2 text-left text-xs">
              <div className={`p-3 rounded-lg flex items-center gap-3 ${analysisStep >= 1 ? 'bg-sky-950/60 border border-sky-700 text-sky-200' : 'bg-slate-900 text-slate-500'}`}>
                <CheckCircle2 className={`w-4 h-4 ${analysisStep >= 1 ? 'text-sky-400' : 'text-slate-600'}`} />
                <span>1. Layout OCR & Clause Segmentation</span>
              </div>
              <div className={`p-3 rounded-lg flex items-center gap-3 ${analysisStep >= 2 ? 'bg-sky-950/60 border border-sky-700 text-sky-200' : 'bg-slate-900 text-slate-500'}`}>
                <CheckCircle2 className={`w-4 h-4 ${analysisStep >= 2 ? 'text-sky-400' : 'text-slate-600'}`} />
                <span>2. F1 Governance Rules Evaluation (Sanctions, EU ETS, Demurrage)</span>
              </div>
              <div className={`p-3 rounded-lg flex items-center gap-3 ${analysisStep >= 3 ? 'bg-sky-950/60 border border-sky-700 text-sky-200' : 'bg-slate-900 text-slate-500'}`}>
                <CheckCircle2 className={`w-4 h-4 ${analysisStep >= 3 ? 'text-sky-400' : 'text-slate-600'}`} />
                <span>3. F2 Anonymized Clause Intelligence Benchmarking</span>
              </div>
              <div className={`p-3 rounded-lg flex items-center gap-3 ${analysisStep >= 4 ? 'bg-sky-950/60 border border-sky-700 text-sky-200' : 'bg-slate-900 text-slate-500'}`}>
                <CheckCircle2 className={`w-4 h-4 ${analysisStep >= 4 ? 'text-sky-400' : 'text-slate-600'}`} />
                <span>4. Section 18 Expected Loss & Case Risk Score (Noisy-OR)</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
