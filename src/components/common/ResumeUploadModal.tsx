/**
 * CareerSphere AI — Resume Document Upload & Semantic Analysis Modal
 * Features full Drag & Drop support, 10MB limit enforcement, format validation (PDF/DOCX/TXT),
 * and automatic parsing that updates candidate profile competencies, target role, and UI in real-time.
 */
import React, { useState, useRef } from 'react';
import { Modal } from './Modal';
import { apiClient } from '../../services/api';
import { UploadResumeResult } from '../../types';
import { Upload, FileText, CheckCircle2, AlertTriangle, Loader2, Sparkles, Tag, ArrowRight } from 'lucide-react';

interface ResumeUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (result: UploadResumeResult) => void;
}

export const ResumeUploadModal: React.FC<ResumeUploadModalProps> = ({
  isOpen,
  onClose,
  onUploadSuccess,
}) => {
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<UploadResumeResult | null>(null);
  const [ocrWarning, setOcrWarning] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndSetFile = (selected: File) => {
    setError(null);
    setAnalysisResult(null);
    const maxBytes = 10 * 1024 * 1024; // 10 MB

    if (selected.size > maxBytes) {
      setError(`File exceeds the 10MB governance limit (${(selected.size / 1024 / 1024).toFixed(2)} MB). Please select a smaller file.`);
      setFile(null);
      return;
    }

    const ext = selected.name.split('.').pop()?.toLowerCase();
    if (!['pdf', 'docx', 'txt'].includes(ext || '')) {
      setError('Invalid document format. Only PDF, DOCX, and TXT files are accepted for ATS parsing.');
      setFile(null);
      return;
    }

    setFile(selected);
    if (!title) {
      setTitle(selected.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  // Drag and Drop handlers
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select or drop a resume file to upload.');
      return;
    }

    setLoading(true);
    setError(null);
    setOcrWarning(null);

    try {
      // Read file text content safely
      let textContent = '';
      try {
        textContent = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result;
            if (typeof result === 'string') {
              resolve(result);
            } else if (result instanceof ArrayBuffer) {
              const decoder = new TextDecoder('utf-8', { fatal: false });
              const str = decoder.decode(result);
              const printable = str.replace(/[^\x20-\x7E\n\r\t]/g, ' ').replace(/\s{3,}/g, ' ');
              resolve(printable.trim());
            } else {
              resolve('');
            }
          };
          reader.onerror = () => resolve('');
          if (file.name.toLowerCase().endsWith('.txt')) {
            reader.readAsText(file);
          } else {
            reader.readAsArrayBuffer(file);
          }
        });
      } catch {
        textContent = '';
      }

      const isScanned = textContent.replace(/[^a-zA-Z0-9]/g, '').length < 40;
      if (isScanned) {
        setOcrWarning('Notice: Document has minimal extractable text and is flagged for OCR. Basic analysis will proceed.');
      }

      const result = await apiClient.uploadResume({
        title: title || file.name,
        fileName: file.name,
        fileSize: file.size,
        textContent: isScanned ? '' : textContent,
      });

      setAnalysisResult(result);
      setSuccess(true);

      // Trigger state updates in parent
      onUploadSuccess(result);

      // Close modal after brief confirmation so user sees extracted skills
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setAnalysisResult(null);
        setOcrWarning(null);
        setFile(null);
        setTitle('');
      }, 1600);
    } catch (err: any) {
      setError(err?.message || 'Failed to upload and validate resume document.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Upload & Analyze Candidate Resume" maxWidth="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        
        {/* Governance banner */}
        <div className="p-3 rounded-lg border border-slate-800 bg-slate-950/60 text-xs text-slate-400 space-y-1">
          <div className="text-slate-200 font-semibold flex items-center justify-between">
            <span>10MB Private Enclave Governance</span>
            <span className="text-[10px] font-mono text-indigo-400 bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-800/60">
              Automatic Semantic Parsing
            </span>
          </div>
          <p>
            Your resume is parsed automatically upon upload to update your profile name, competencies, and match jobs. Supported formats: <span className="text-white font-mono">PDF, DOCX, TXT</span>.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-lg border border-rose-900/40 bg-rose-950/20 text-xs text-rose-300 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {ocrWarning && (
          <div className="p-3 rounded-lg border border-amber-900/40 bg-amber-950/30 text-xs text-amber-300 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
            <span>{ocrWarning}</span>
          </div>
        )}

        {success && analysisResult && (
          <div className="p-3.5 rounded-xl border border-emerald-900/50 bg-emerald-950/30 text-xs text-emerald-200 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-emerald-300">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Resume analyzed successfully! UI updated with detected details.</span>
            </div>
            {analysisResult.extractedSkills && analysisResult.extractedSkills.length > 0 && (
              <div className="pt-1 flex flex-wrap gap-1.5 items-center">
                <span className="text-[11px] text-slate-300">Extracted Skills:</span>
                {analysisResult.extractedSkills.slice(0, 5).map((skill, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-emerald-900/60 text-emerald-200 border border-emerald-700/60">
                    {skill}
                  </span>
                ))}
                {analysisResult.extractedSkills.length > 5 && (
                  <span className="text-[10px] text-slate-400 font-mono">+{analysisResult.extractedSkills.length - 5} more</span>
                )}
              </div>
            )}
            {analysisResult.detectedRole && (
              <div className="text-[11px] text-slate-300">
                Target Role Identified: <span className="font-semibold text-white">{analysisResult.detectedRole}</span>
              </div>
            )}
          </div>
        )}

        {/* Title Input */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Document Label / Title</label>
          <input
            type="text"
            placeholder="e.g. Alex_Chen_Principal_Engineer_Resume.pdf"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* File Drag & Drop Zone */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Resume File (Drag & Drop or Click to Select)
          </label>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
            className="hidden"
          />

          <div
            onDragOver={handleDragOver}
            onDragEnter={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-7 text-center cursor-pointer transition-all space-y-2.5 ${
              isDragging
                ? 'border-indigo-400 bg-indigo-950/50 scale-[1.01]'
                : file
                ? 'border-emerald-600/60 bg-emerald-950/20'
                : 'border-slate-800 hover:border-slate-700 bg-slate-950/40 hover:bg-slate-900/40'
            }`}
          >
            <div className={`h-11 w-11 mx-auto rounded-full flex items-center justify-center transition-colors ${
              isDragging
                ? 'bg-indigo-600 text-white'
                : file
                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                : 'bg-slate-900 text-indigo-400 border border-slate-800'
            }`}>
              <Upload className="h-5 w-5" />
            </div>

            {file ? (
              <div className="space-y-1">
                <div className="text-xs font-semibold text-white flex items-center justify-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-emerald-400" />
                  <span>{file.name}</span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  {(file.size / 1024).toFixed(1)} KB · Ready to analyze & extract profile details
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <div className="text-xs font-semibold text-slate-200">
                  {isDragging ? 'Drop your resume file here now' : 'Drag & drop your resume here, or browse files'}
                </div>
                <div className="text-[11px] text-slate-400">
                  Supports PDF, DOCX, or TXT up to 10MB
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!file || loading || success}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-md transition-colors cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Analyzing Resume...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5 text-indigo-300" />
                <span>Upload & Analyze</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
