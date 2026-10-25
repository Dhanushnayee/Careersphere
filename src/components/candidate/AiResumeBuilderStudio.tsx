/**
 * CareerSphere AI — AI Resume Builder & Explainable ATS Analyzer Studio (Modules 4, 5, 6)
 * - Multiple Resume Version Management & Role-Specific Tagging
 * - AI Resume Builder from Candidate Profile (Fresher, Experienced, Python Fullstack, AI/ML)
 * - Anti-hallucination factual achievement generation & tailored cover letters
 * - Comprehensive Explainable ATS Analyzer (keyword coverage, section completeness, readability, before/after suggestions)
 */
import React, { useState } from 'react';
import { CandidateProfile, ResumeDocument, Job, AiGeneratedResume, ResumeAnalysisReport } from '../../types';
import { apiClient } from '../../services/api';
import {
  FileText,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Download,
  Copy,
  ChevronRight,
  Loader2,
  Award,
  Layers,
  ArrowRight,
  BookOpen,
  Send,
  Eye,
  Check,
} from 'lucide-react';

interface AiResumeBuilderStudioProps {
  profile: CandidateProfile | null;
  resumes: ResumeDocument[];
  jobs: Job[];
  onRefreshResumes?: () => void;
  onOpenUploadModal: () => void;
}

export const AiResumeBuilderStudio: React.FC<AiResumeBuilderStudioProps> = ({
  profile,
  resumes,
  jobs,
  onRefreshResumes,
  onOpenUploadModal,
}) => {
  const [activeTab, setActiveTab] = useState<'builder' | 'ats' | 'versions'>('builder');

  // Builder State
  const [templateType, setTemplateType] = useState<'python-fullstack' | 'ai-ml' | 'data-analyst' | 'fresher' | 'experienced'>('python-fullstack');
  const [targetJobDesc, setTargetJobDesc] = useState('');
  const [generatingResume, setGeneratingResume] = useState(false);
  const [generatedResume, setGeneratedResume] = useState<AiGeneratedResume | null>(null);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  // ATS Analyzer State
  const [selectedResumeId, setSelectedResumeId] = useState<string>(resumes[0]?.id || 'res_01');
  const [analyzingAts, setAnalyzingAts] = useState(false);
  const [atsReport, setAtsReport] = useState<ResumeAnalysisReport | null>(null);
  const [selectedJobForAts, setSelectedJobForAts] = useState<string>(jobs[0]?.id || '');

  const primaryResume = resumes.find((r) => r.isPrimary) || resumes[0];

  const handleGenerateResume = async () => {
    setGeneratingResume(true);
    try {
      const result = await apiClient.generateAiResume({
        templateType,
        targetJobDescription: targetJobDesc,
      });
      setGeneratedResume(result);
    } catch (err: any) {
      console.error('Resume generation failed:', err);
    } finally {
      setGeneratingResume(false);
    }
  };

  const handleRunAtsAnalysis = async () => {
    setAnalyzingAts(true);
    try {
      const activeRes = resumes.find((r) => r.id === selectedResumeId) || resumes[0];
      const targetJob = jobs.find((j) => j.id === selectedJobForAts);
      const report = await apiClient.analyzeResumeAts({
        resumeText: activeRes?.extractedText || '',
        jobDescription: targetJob ? `${targetJob.title} - ${targetJob.description} ${targetJob.skillsRequired.join(', ')}` : '',
        targetRole: profile?.targetRole,
      });
      setAtsReport(report);
    } catch (err: any) {
      console.error('ATS Analysis failed:', err);
    } finally {
      setAnalyzingAts(false);
    }
  };

  const handleCopy = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2500);
  };

  const handleDownloadDraft = (content: string, filename = 'Resume_Draft.txt') => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6 text-left">
      {/* Studio Header */}
      <div className="p-6 rounded-2xl border border-indigo-900/60 bg-gradient-to-r from-indigo-950/60 via-slate-900 to-slate-950 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-indigo-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
              AI Resume Studio & Explainable ATS Engine
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
            Resume Builder, Copilot & ATS Diagnostics
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed mt-1">
            Build tailored resumes from genuine profile facts, audit keyword match rates against target job descriptions, and prevent ATS parsing errors.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenUploadModal}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors shadow-sm cursor-pointer"
          >
            <Upload className="h-4 w-4" />
            <span>Upload Resume</span>
          </button>
        </div>
      </div>

      {/* Navigation Pills */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('builder')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-colors cursor-pointer ${
            activeTab === 'builder'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
          }`}
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>AI Resume & Cover Letter Builder</span>
        </button>

        <button
          onClick={() => setActiveTab('ats')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-colors cursor-pointer ${
            activeTab === 'ats'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
          }`}
        >
          <Award className="h-3.5 w-3.5 text-emerald-400" />
          <span>Explainable ATS Diagnostics</span>
        </button>

        <button
          onClick={() => setActiveTab('versions')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-colors cursor-pointer ${
            activeTab === 'versions'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
          }`}
        >
          <Layers className="h-3.5 w-3.5 text-cyan-400" />
          <span>Resume Versions Vault ({resumes.length})</span>
        </button>
      </div>

      {/* =====================================================================
          TAB 1: AI RESUME BUILDER
         ===================================================================== */}
      {activeTab === 'builder' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileText className="h-4 w-4 text-indigo-400" />
              <span>Select Architecture Template & Role Focus</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs font-semibold">
              {[
                { id: 'python-fullstack', label: 'Python Full-Stack' },
                { id: 'ai-ml', label: 'AI / ML & Systems' },
                { id: 'data-analyst', label: 'Data Analyst' },
                { id: 'fresher', label: 'Fresher / Graduate' },
                { id: 'experienced', label: 'Senior / Staff' },
              ].map((tmpl) => (
                <button
                  key={tmpl.id}
                  type="button"
                  onClick={() => setTemplateType(tmpl.id as any)}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    templateType === tmpl.id
                      ? 'border-indigo-500 bg-indigo-950/60 text-white shadow-md'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                  {tmpl.label}
                </button>
              ))}
            </div>

            <div className="space-y-2 pt-2">
              <label className="block text-xs font-medium text-slate-400">
                Optional: Paste Target Job Description (AI will optimize keyword alignment based on candidate's real profile facts)
              </label>
              <textarea
                rows={3}
                value={targetJobDesc}
                onChange={(e) => setTargetJobDesc(e.target.value)}
                placeholder="e.g. Senior Backend Engineer with FastAPI, PostgreSQL, Docker, and Redis experience..."
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500 placeholder-slate-600"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleGenerateResume}
                disabled={generatingResume}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md transition-colors cursor-pointer disabled:opacity-50"
              >
                {generatingResume ? (
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                ) : (
                  <Sparkles className="h-4 w-4 text-amber-300" />
                )}
                <span>{generatingResume ? 'Synthesizing Resume with Gemini 3.8 Flash...' : 'Generate Resume & Cover Letter'}</span>
              </button>
            </div>
          </div>

          {/* Generated Result Display */}
          {generatedResume && (
            <div className="space-y-6 animate-fadeIn">
              {/* Executive Summary */}
              <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Executive Summary
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopy(generatedResume.objectiveSummary, 'summary')}
                      className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white"
                    >
                      {copiedSection === 'summary' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>{copiedSection === 'summary' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {generatedResume.objectiveSummary}
                </p>
              </div>

              {/* Quantifiable Experience Bullets */}
              <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Quantifiable Action-Verb Experience Bullets
                  </span>
                  <button
                    onClick={() => handleCopy(generatedResume.experienceBullets.join('\n• '), 'exp')}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white"
                  >
                    {copiedSection === 'exp' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedSection === 'exp' ? 'Copied' : 'Copy All'}</span>
                  </button>
                </div>
                <ul className="space-y-2 text-xs text-slate-300">
                  {generatedResume.experienceBullets.map((bullet, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold shrink-0">•</span>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Project Bullets */}
              <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Flagship Technical Projects
                  </span>
                  <button
                    onClick={() => handleCopy(generatedResume.projectBullets.join('\n• '), 'proj')}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white"
                  >
                    {copiedSection === 'proj' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedSection === 'proj' ? 'Copied' : 'Copy All'}</span>
                  </button>
                </div>
                <ul className="space-y-2 text-xs text-slate-300">
                  {generatedResume.projectBullets.map((bullet, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-indigo-400 font-bold shrink-0">•</span>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Cover Letter */}
              {generatedResume.coverLetter && (
                <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Tailored Cover Letter
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopy(generatedResume.coverLetter!, 'cover')}
                        className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white"
                      >
                        {copiedSection === 'cover' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                        <span>{copiedSection === 'cover' ? 'Copied' : 'Copy'}</span>
                      </button>
                      <button
                        onClick={() => handleDownloadDraft(generatedResume.coverLetter!, 'Cover_Letter.txt')}
                        className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-white"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>Download</span>
                      </button>
                    </div>
                  </div>
                  <div className="text-xs text-slate-300 whitespace-pre-line leading-relaxed">
                    {generatedResume.coverLetter}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* =====================================================================
          TAB 2: EXPLAINABLE ATS DIAGNOSTICS
         ===================================================================== */}
      {activeTab === 'ats' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Award className="h-4 w-4 text-emerald-400" />
              <span>Configure ATS Diagnostics Benchmark</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Select Resume to Analyze</label>
                <select
                  value={selectedResumeId}
                  onChange={(e) => setSelectedResumeId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  {resumes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.fileName} {r.isPrimary ? '(Primary Default)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Target Benchmark Job</label>
                <select
                  value={selectedJobForAts}
                  onChange={(e) => setSelectedJobForAts(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  {jobs.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.title} · {j.company_name} ({j.salary_range})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleRunAtsAnalysis}
                disabled={analyzingAts}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md transition-colors cursor-pointer disabled:opacity-50"
              >
                {analyzingAts ? (
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                ) : (
                  <Award className="h-4 w-4 text-white" />
                )}
                <span>{analyzingAts ? 'Calculating ATS Metrics...' : 'Run In-Depth ATS Diagnostic'}</span>
              </button>
            </div>
          </div>

          {/* ATS Report Results */}
          {atsReport && (
            <div className="space-y-6 animate-fadeIn">
              {/* Score Breakdown Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 space-y-1">
                  <div className="text-[11px] text-slate-400 font-medium">Overall ATS Score</div>
                  <div className="text-2xl font-bold font-mono text-emerald-400">{atsReport.overallScore}/100</div>
                  <div className="text-[10px] text-slate-500">Weighted ATS compliance</div>
                </div>

                <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 space-y-1">
                  <div className="text-[11px] text-slate-400 font-medium">Section Completeness</div>
                  <div className="text-2xl font-bold font-mono text-indigo-400">{atsReport.sectionCompleteness}%</div>
                  <div className="text-[10px] text-slate-500">Headers & content depth</div>
                </div>

                <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 space-y-1">
                  <div className="text-[11px] text-slate-400 font-medium">Keyword Coverage</div>
                  <div className="text-2xl font-bold font-mono text-cyan-400">{atsReport.keywordCoverage}%</div>
                  <div className="text-[10px] text-slate-500">Target role keywords</div>
                </div>

                <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 space-y-1">
                  <div className="text-[11px] text-slate-400 font-medium">Readability Score</div>
                  <div className="text-2xl font-bold font-mono text-purple-400">{atsReport.readabilityScore}%</div>
                  <div className="text-[10px] text-slate-500">Structure & formatting</div>
                </div>
              </div>

              {/* Matched vs Missing Keywords */}
              <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Keywords Analysis
                </h4>
                <div className="space-y-3">
                  <div>
                    <div className="text-[11px] text-emerald-400 font-semibold mb-1">
                      Matched Skills ({atsReport.matchedSkills.length})
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {atsReport.matchedSkills.map((sk) => (
                        <span
                          key={sk}
                          className="px-2.5 py-0.5 rounded text-[10px] font-mono bg-emerald-950/70 text-emerald-300 border border-emerald-800/60"
                        >
                          ✓ {sk}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] text-amber-400 font-semibold mb-1">
                      Missing Required Keywords ({atsReport.missingSkills.length})
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {atsReport.missingSkills.map((sk) => (
                        <span
                          key={sk}
                          className="px-2.5 py-0.5 rounded text-[10px] font-mono bg-amber-950/70 text-amber-300 border border-amber-800/60"
                        >
                          + {sk}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Before and After Content Suggestions */}
              {atsReport.beforeAfterImprovements && (
                <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Before-and-After Actionable Improvements
                  </h4>
                  <div className="space-y-3">
                    {atsReport.beforeAfterImprovements.map((item, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl border border-slate-800 bg-slate-950 space-y-2 text-xs">
                        <div className="text-rose-400 line-through">
                          <strong className="text-slate-400 font-normal">Original:</strong> "{item.original}"
                        </div>
                        <div className="text-emerald-300 font-medium">
                          <strong className="text-slate-300 font-normal">Improved:</strong> "{item.improved}"
                        </div>
                        <div className="text-[11px] text-slate-500 italic">
                          Rationale: {item.rationale}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* =====================================================================
          TAB 3: RESUME VERSIONS VAULT
         ===================================================================== */}
      {activeTab === 'versions' && (
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white">Stored Resume Versions</h3>
              <p className="text-xs text-slate-400">
                Manage role-specific resumes, mark primary versions for auto-apply, and download anytime.
              </p>
            </div>
            <button
              onClick={onOpenUploadModal}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 cursor-pointer"
            >
              <Upload className="h-3.5 w-3.5" />
              <span>Add Version</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {resumes.map((res) => (
              <div
                key={res.id}
                className="p-4 rounded-xl border border-slate-800 bg-slate-950 space-y-3 flex flex-col justify-between text-xs"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                      {res.fileFormat} · {(res.fileSizeBytes / 1024).toFixed(0)} KB
                    </span>
                    {res.isPrimary && (
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60">
                        Primary Default
                      </span>
                    )}
                  </div>
                  <h4 className="font-semibold text-white truncate" title={res.fileName}>
                    {res.fileName}
                  </h4>
                  <div className="text-[11px] text-slate-400">
                    ATS Score:{' '}
                    <strong className="text-emerald-400 font-mono">{res.atsScore || 88}%</strong>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">{res.uploadedAt || 'Verified & Parsed'}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDownloadDraft(res.extractedText || 'Resume content', res.fileName)}
                      className="text-indigo-400 hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="h-3 w-3" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
