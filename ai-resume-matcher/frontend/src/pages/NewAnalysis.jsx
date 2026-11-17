import React, { useState } from 'react';
import {
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  X,
  Plus,
  Briefcase,
  GraduationCap,
  Code,
  ArrowRight,
  RefreshCw,
  Cpu,
  FileCheck,
  FolderOpen,
  FileUp,
  Zap,
  Sparkles
} from 'lucide-react';
import {
  createJob,
  extractJobFromText,
  uploadJobFile,
  uploadResumes,
  loadSampleResumes,
  runMatchingAnalysis
} from '../services/api';

export default function NewAnalysis({ onAnalysisComplete, onSelectJob }) {
  // Stepper state: 1 = Requisition, 2 = Batch Ingestion, 3 = Inference
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1: Job Description State
  const [jobTitle, setJobTitle] = useState('Senior AI & Full-Stack Engineer');
  const [company, setCompany] = useState('Apex Global AI Solutions');
  const [jdText, setJdText] = useState(`JOB TITLE: Senior AI & Full-Stack Engineer
COMPANY: Apex Global AI Solutions
LOCATION: Remote / Hybrid

ABOUT THE ROLE:
Apex Global AI is looking for an exceptional Senior AI & Full-Stack Engineer to architect intelligent, data-driven applications. You will spearhead the development of our next-generation NLP platforms, combining state-of-the-art machine learning models with resilient microservice backends and responsive frontend interfaces.

KEY RESPONSIBILITIES:
- Design and scale production-ready AI/NLP services and REST APIs with FastAPI.
- Implement modern frontend user interfaces with React and Tailwind CSS.
- Fine-tune deep learning and transformer models for enterprise intelligent document processing.
- Containerize microservices using Docker and orchestrate on cloud infrastructure.
- Collaborate with product managers and architects on high-performance database schema design.

REQUIRED QUALIFICATIONS & SKILLS:
- Bachelor's or Master's degree in Computer Science, Data Science, or related quantitative discipline.
- 3+ years of professional software engineering and AI/ML development experience.
- Deep proficiency in Python and modern backend frameworks (FastAPI or Flask).
- Strong foundation in Machine Learning, PyTorch, and Natural Language Processing (NLP).
- Hands-on experience developing web frontends with React.js and modern JavaScript/TypeScript.
- Solid experience with relational databases (SQL, PostgreSQL, MySQL) and database optimization.
- Proficiency in containerization with Docker and standard Git development workflows.

PREFERRED / GOOD TO HAVE:
- Experience with Transformers, Hugging Face, or LLM fine-tuning pipelines.
- Hands-on exposure to cloud deployments on AWS or GCP.
- Familiarity with Kubernetes, Redis caching, and CI/CD pipelines (GitHub Actions).`);

  const [extractedData, setExtractedData] = useState(null);
  const [extractingJd, setExtractingJd] = useState(false);
  const [newRequiredSkill, setNewRequiredSkill] = useState('');
  const [newPreferredSkill, setNewPreferredSkill] = useState('');
  const [createdJobId, setCreatedJobId] = useState(null);

  // Step 2: Resume Upload State
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResults, setUploadResults] = useState([]);
  const [uploadedCandidateIds, setUploadedCandidateIds] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [loadingSamples, setLoadingSamples] = useState(false);

  // Step 3: Matching State
  const [matchingInProgress, setMatchingInProgress] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Handle JD File Upload
  const handleJdFileUpload = async (file) => {
    if (!file) return;

    setExtractingJd(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await uploadJobFile(file);
      setJobTitle(res.title || file.name.split('.')[0]);
      setJdText(res.raw_text);
      setExtractedData(res);
      setSuccessMsg(`Extracted requirements from ${file.name} successfully!`);
    } catch (err) {
      setErrorMsg('Failed to extract JD from file. Please ensure backend is running.');
    } finally {
      setExtractingJd(false);
    }
  };

  // Auto-extract requirements from pasted text
  const handleExtractFromText = async () => {
    if (!jdText.trim()) {
      setErrorMsg('Please enter Job Description text first.');
      return;
    }
    setExtractingJd(true);
    setErrorMsg('');
    try {
      const res = await extractJobFromText({ raw_text: jdText, title: jobTitle });
      setExtractedData(res);
      setSuccessMsg('Structured criteria extracted successfully using spaCy NLP!');
    } catch (err) {
      setErrorMsg('Failed to extract structured requirements.');
    } finally {
      setExtractingJd(false);
    }
  };

  // Add / Remove skills
  const addSkill = (type) => {
    if (type === 'required' && newRequiredSkill.trim()) {
      const current = extractedData?.required_skills || [];
      if (!current.includes(newRequiredSkill.trim())) {
        setExtractedData({
          ...(extractedData || {}),
          required_skills: [...current, newRequiredSkill.trim()],
        });
      }
      setNewRequiredSkill('');
    } else if (type === 'preferred' && newPreferredSkill.trim()) {
      const current = extractedData?.preferred_skills || [];
      if (!current.includes(newPreferredSkill.trim())) {
        setExtractedData({
          ...(extractedData || {}),
          preferred_skills: [...current, newPreferredSkill.trim()],
        });
      }
      setNewPreferredSkill('');
    }
  };

  const removeSkill = (type, skillToRemove) => {
    if (type === 'required') {
      const current = extractedData?.required_skills || [];
      setExtractedData({
        ...extractedData,
        required_skills: current.filter((s) => s !== skillToRemove),
      });
    } else {
      const current = extractedData?.preferred_skills || [];
      setExtractedData({
        ...extractedData,
        preferred_skills: current.filter((s) => s !== skillToRemove),
      });
    }
  };

  // Save Job & Proceed to Step 2
  const handleSaveJobAndProceed = async () => {
    if (!jobTitle.trim() || !jdText.trim()) {
      setErrorMsg('Job Title and Job Description text are required.');
      return;
    }

    try {
      const payload = {
        title: jobTitle,
        company: company,
        raw_text: jdText,
        required_skills: extractedData?.required_skills || [
          'Python', 'FastAPI', 'Machine Learning', 'NLP', 'React', 'SQL', 'Docker'
        ],
        preferred_skills: extractedData?.preferred_skills || [
          'Kubernetes', 'AWS', 'Transformers', 'PostgreSQL', 'CI/CD'
        ],
        required_experience_years: extractedData?.required_experience_years || 3.0,
        required_education: extractedData?.required_education || ["Bachelor's in Computer Science or related"],
      };

      const res = await createJob(payload);
      setCreatedJobId(res.id);
      if (onSelectJob) onSelectJob(res.id);
      setCurrentStep(2);
      setErrorMsg('');
      setSuccessMsg(`Job "${res.title}" created with ID #${res.id}. Proceed to batch resume upload.`);
    } catch (err) {
      setErrorMsg('Failed to save job requisition: ' + (err.response?.data?.detail || err.message));
    }
  };

  // Upload Selected Resumes
  const processAndUploadFiles = async (files) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadProgress(0);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await uploadResumes(files, (progress) => {
        setUploadProgress(progress);
      });
      setUploadResults(res.results || []);
      const candIds = (res.results || [])
        .filter((r) => r.candidate_id)
        .map((r) => r.candidate_id);
      setUploadedCandidateIds(candIds);
      setSuccessMsg(`Successfully parsed ${res.successful_parses} of ${files.length} resume(s)!`);
    } catch (err) {
      setErrorMsg('Error uploading resumes. Please verify backend is running.');
    } finally {
      setUploading(false);
    }
  };

  // 1-Click Load 12 Pre-Generated Resumes (Creator Space Lab Gold Action)
  const handleLoadSamples = async () => {
    setLoadingSamples(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await loadSampleResumes();
      const sampleResults = res.candidates.map((c) => ({
        candidate_id: c.id,
        candidate_name: c.name,
        filename: c.filename,
        experience_years: c.experience_years,
        skills_count: c.skills_count,
        status: 'parsed_success',
      }));
      setUploadResults(sampleResults);
      setUploadedCandidateIds(res.candidate_ids);
      setSuccessMsg(`Loaded ${res.candidates.length} synthetic candidate resumes (PDF & DOCX) ready for AI matching!`);
    } catch (err) {
      setErrorMsg('Could not load sample resumes.');
    } finally {
      setLoadingSamples(false);
    }
  };

  // Drag and drop event handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      await processAndUploadFiles(files);
    }
  };

  // Run AI Matching
  const handleRunAiMatching = async () => {
    if (!createdJobId) {
      setErrorMsg('Active Job ID is missing. Please save Job Description first.');
      return;
    }

    setMatchingInProgress(true);
    setErrorMsg('');

    try {
      const results = await runMatchingAnalysis(
        createdJobId,
        uploadedCandidateIds.length > 0 ? uploadedCandidateIds : null
      );
      if (onAnalysisComplete) {
        onAnalysisComplete(createdJobId, results);
      }
    } catch (err) {
      setErrorMsg('Failed to complete AI matching analysis: ' + (err.response?.data?.detail || err.message));
      setMatchingInProgress(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6 bg-csl-bg min-h-screen">

      {/* Floating Stepper Bar (CSL Card Style) */}
      <div className="csl-card p-4 flex items-center justify-between">
        <div className={`flex items-center gap-3 ${currentStep === 1 ? 'text-csl-blue font-extrabold' : 'text-csl-muted'}`}>
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shadow-sm ${currentStep === 1
              ? 'bg-gradient-to-r from-csl-deep-blue to-csl-blue text-white shadow-csl-blue'
              : 'bg-[#F5B83D]/15 text-csl-text'
            }`}>
            01
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider font-extrabold text-csl-muted">Step 01</div>
            <div className="text-xs font-bold text-csl-text">Job Description & Criteria</div>
          </div>
        </div>

        <div className="h-0.5 w-12 bg-csl-gold/30 hidden sm:block"></div>

        <div className={`flex items-center gap-3 ${currentStep === 2 ? 'text-csl-blue font-extrabold' : 'text-csl-muted'}`}>
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shadow-sm ${currentStep === 2
              ? 'bg-gradient-to-r from-csl-deep-blue to-csl-blue text-white shadow-csl-blue'
              : 'bg-[#F5B83D]/15 text-csl-text'
            }`}>
            02
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider font-extrabold text-csl-muted">Step 02</div>
            <div className="text-xs font-bold text-csl-text">Batch Resume Upload</div>
          </div>
        </div>

        <div className="h-0.5 w-12 bg-csl-gold/30 hidden sm:block"></div>

        <div className={`flex items-center gap-3 ${currentStep === 3 ? 'text-csl-blue font-extrabold' : 'text-csl-muted'}`}>
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shadow-sm ${currentStep === 3
              ? 'bg-gradient-to-r from-csl-deep-blue to-csl-blue text-white shadow-csl-blue'
              : 'bg-[#F5B83D]/15 text-csl-text'
            }`}>
            03
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider font-extrabold text-csl-muted">Step 03</div>
            <div className="text-xs font-bold text-csl-text">AI Vector Matching</div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {errorMsg && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center gap-3 text-xs text-red-600 font-bold">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center gap-3 text-xs text-emerald-700 font-bold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* STEP 1: JOB DESCRIPTION MODULE */}
      {currentStep === 1 && (
        <div className="space-y-6">

          <div className="csl-card p-6 md:p-7 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-csl-gold/20">
              <div>
                <h3 className="text-base font-extrabold text-csl-text">Job Description & Requisition Criteria</h3>
                <p className="text-xs text-csl-muted mt-0.5">
                  Paste requisition text or upload a PDF/DOCX file to automatically parse candidate requirements.
                </p>
              </div>
              <span className="text-[10px] font-extrabold text-csl-blue bg-csl-blue/10 px-2.5 py-1 rounded-xl border border-csl-blue/20">
                spaCy NER Extractor
              </span>
            </div>

            {/* Inputs: Title, Company, File Upload */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-csl-text uppercase tracking-wider mb-1.5">
                  Job Title
                </label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g. Senior AI & Full-Stack Engineer"
                  className="w-full px-4 py-2.5 text-xs bg-white border border-csl-gold/30 rounded-xl focus:border-csl-blue focus:ring-2 focus:ring-csl-blue/20 font-semibold focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-csl-text uppercase tracking-wider mb-1.5">
                  Company / Organization
                </label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Apex Global AI Solutions"
                  className="w-full px-4 py-2.5 text-xs bg-white border border-csl-gold/30 rounded-xl focus:border-csl-blue focus:ring-2 focus:ring-csl-blue/20 font-semibold focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-csl-text uppercase tracking-wider mb-1.5">
                  Upload Requisition (PDF/DOCX)
                </label>
                <label className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-csl-text bg-white border border-csl-gold/40 border-dashed rounded-xl cursor-pointer hover:bg-csl-bg hover:border-csl-blue transition-colors">
                  <Upload className="w-3.5 h-3.5 text-csl-blue" />
                  <span>{extractingJd ? 'Extracting...' : 'Select File'}</span>
                  <input
                    type="file"
                    accept=".pdf,.docx,.doc,.txt"
                    onChange={(e) => e.target.files?.[0] && handleJdFileUpload(e.target.files[0])}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Raw JD Textarea */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-bold text-csl-text uppercase tracking-wider">
                  Requisition Raw Text
                </label>
                <button
                  type="button"
                  onClick={handleExtractFromText}
                  disabled={extractingJd}
                  className="flex items-center gap-1.5 px-3 py-1 bg-csl-gold/20 hover:bg-csl-gold/30 text-[#B45309] rounded-xl text-xs font-bold transition-colors border border-csl-gold/40 cursor-pointer"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${extractingJd ? 'animate-spin' : ''}`} />
                  <span>{extractingJd ? 'Extracting with spaCy...' : 'Auto-Extract Criteria'}</span>
                </button>
              </div>
              <textarea
                rows={9}
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                placeholder="Paste the job description text here..."
                className="w-full p-4 text-xs font-mono bg-white border border-csl-gold/30 rounded-2xl focus:border-csl-blue focus:ring-2 focus:ring-csl-blue/20 leading-relaxed text-csl-text focus:outline-none"
              />
            </div>

          </div>

          {/* Extracted Requirements Preview & Recruiter Edit Section (CSL Card Style) */}
          <div className="csl-card p-6 md:p-7 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-csl-gold/20">
              <div>
                <h4 className="text-sm font-extrabold text-csl-text flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-csl-blue" />
                  <span>Extracted Job Requirements (Recruiter Configurable)</span>
                </h4>
                <p className="text-xs text-csl-muted">
                  Review and customize technical skills and requirements before executing AI matching.
                </p>
              </div>
              {!extractedData && (
                <button
                  type="button"
                  onClick={handleExtractFromText}
                  className="text-xs font-bold text-csl-blue hover:underline cursor-pointer"
                >
                  Click to Extract Now
                </button>
              )}
            </div>

            {/* Required Technical Skills Editor */}
            <div>
              <label className="block text-[11px] font-extrabold text-csl-text uppercase tracking-wider mb-2">
                Required Technical Skills (40% Weighting)
              </label>
              <div className="flex flex-wrap gap-2 items-center mb-2">
                {(extractedData?.required_skills || ['Python', 'FastAPI', 'PyTorch', 'Machine Learning', 'React.js', 'SQL', 'Docker']).map((skill, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-csl-blue/10 text-csl-blue text-xs font-bold rounded-xl border border-csl-blue/20"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => removeSkill('required', skill)}
                      className="text-csl-blue hover:text-csl-deep-blue cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2 max-w-sm mt-2">
                <input
                  type="text"
                  value={newRequiredSkill}
                  onChange={(e) => setNewRequiredSkill(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill('required'))}
                  placeholder="Add custom required skill..."
                  className="px-3.5 py-2 text-xs bg-white border border-csl-gold/30 rounded-xl flex-1 focus:outline-none focus:ring-2 focus:ring-csl-blue/20 font-semibold"
                />
                <button
                  type="button"
                  onClick={() => addSkill('required')}
                  className="p-2 bg-gradient-to-r from-csl-deep-blue to-csl-blue text-white rounded-xl hover:scale-105 text-xs font-bold cursor-pointer transition-transform"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Preferred / Good to Have Skills */}
            <div>
              <label className="block text-[11px] font-extrabold text-csl-text uppercase tracking-wider mb-2">
                Preferred Technical Skills (Nice to Have)
              </label>
              <div className="flex flex-wrap gap-2 items-center mb-2">
                {(extractedData?.preferred_skills || ['Kubernetes', 'AWS', 'Transformers', 'PostgreSQL', 'CI/CD', 'Redis']).map((skill, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-csl-gold/15 text-[#B45309] text-xs font-bold rounded-xl border border-csl-gold/30"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => removeSkill('preferred', skill)}
                      className="text-[#B45309] hover:text-[#78350F] cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2 max-w-sm mt-2">
                <input
                  type="text"
                  value={newPreferredSkill}
                  onChange={(e) => setNewPreferredSkill(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill('preferred'))}
                  placeholder="Add preferred skill..."
                  className="px-3.5 py-2 text-xs bg-white border border-csl-gold/30 rounded-xl flex-1 focus:outline-none focus:ring-2 focus:ring-csl-blue/20 font-semibold"
                />
                <button
                  type="button"
                  onClick={() => addSkill('preferred')}
                  className="p-2 bg-csl-gold text-csl-text rounded-xl hover:scale-105 text-xs font-bold cursor-pointer transition-transform"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Experience and Education Requirements */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-[11px] font-bold text-csl-text uppercase tracking-wider mb-1.5">
                  Min Experience (Years)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="20"
                  value={extractedData?.required_experience_years || 3.0}
                  onChange={(e) =>
                    setExtractedData({
                      ...(extractedData || {}),
                      required_experience_years: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full px-4 py-2.5 text-xs bg-white border border-csl-gold/30 rounded-xl focus:border-csl-blue focus:ring-2 focus:ring-csl-blue/20 font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-csl-text uppercase tracking-wider mb-1.5">
                  Education Qualification
                </label>
                <input
                  type="text"
                  value={extractedData?.required_education?.[0] || "Bachelor's or Master's in Computer Science"}
                  onChange={(e) =>
                    setExtractedData({
                      ...(extractedData || {}),
                      required_education: [e.target.value],
                    })
                  }
                  className="w-full px-4 py-2.5 text-xs bg-white border border-csl-gold/30 rounded-xl focus:border-csl-blue focus:ring-2 focus:ring-csl-blue/20 font-semibold"
                />
              </div>
            </div>

            {/* Action Button: Proceed to Step 2 */}
            <div className="pt-4 border-t border-csl-gold/20 flex justify-end">
              <button
                type="button"
                onClick={handleSaveJobAndProceed}
                className="csl-btn-primary"
              >
                <span>Save Job & Proceed to Batch Upload</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>
      )}

      {/* STEP 2: RESUME UPLOAD MODULE */}
      {currentStep === 2 && (
        <div className="space-y-6">

          <div className="csl-card p-6 md:p-7 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-csl-gold/20">
              <div>
                <h3 className="text-base font-extrabold text-csl-text">Batch Resume Upload & Parsing</h3>
                <p className="text-xs text-csl-muted mt-0.5">
                  Ingest candidate profiles in PDF or DOCX format. Batch parsing of 10+ resumes supported simultaneously.
                </p>
              </div>

              {/* Creator Space Lab Gold Action Button */}
              <button
                type="button"
                onClick={handleLoadSamples}
                disabled={loadingSamples}
                className="csl-btn-gold"
              >
                <FolderOpen className={`w-4 h-4 ${loadingSamples ? 'animate-spin' : ''}`} />
                <span>{loadingSamples ? 'Ingesting Profiles...' : 'Load 12 Pre-Generated Profiles (PDF/DOCX)'}</span>
              </button>
            </div>

            {/* Drag & Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center transition-all text-center ${isDragging
                  ? 'border-csl-blue bg-csl-blue/10 scale-[1.01]'
                  : 'border-csl-gold/50 hover:border-csl-blue bg-white/70 hover:bg-white'
                }`}
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 transition-colors ${isDragging ? 'bg-gradient-to-r from-csl-deep-blue to-csl-blue text-white shadow-lg' : 'bg-csl-gold/20 text-[#B45309]'
                }`}>
                <FileUp className="w-7 h-7" />
              </div>

              <h4 className="text-sm font-extrabold text-csl-text">
                {isDragging ? 'Drop candidate PDF or DOCX files here' : 'Drag & drop candidate resumes here'}
              </h4>
              <p className="text-xs text-csl-muted mt-1 max-w-sm">
                PyMuPDF & python-docx engine extracts entities, non-overlapping work duration, and technical skills.
              </p>

              <label className="mt-4 px-6 py-2.5 bg-gradient-to-r from-csl-deep-blue to-csl-blue text-white rounded-xl text-xs font-bold cursor-pointer shadow-sm hover:scale-105 active:scale-95 transition-transform flex items-center gap-2">
                <Upload className="w-3.5 h-3.5" />
                <span>Select Files from Disk</span>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.docx,.doc"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      processAndUploadFiles(Array.from(e.target.files));
                    }
                  }}
                  className="hidden"
                />
              </label>
            </div>

            {/* Progress Bar */}
            {uploading && (
              <div className="space-y-1.5 p-4 bg-csl-blue/10 rounded-xl border border-csl-blue/20">
                <div className="flex justify-between font-bold text-xs text-csl-blue">
                  <span>Parsing AST & extracting entities...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-white rounded-full h-2 overflow-hidden">
                  <div className="bg-csl-blue h-2 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                </div>
              </div>
            )}

            {/* Resume Parsing Status Grid */}
            {uploadResults.length > 0 && (
              <div className="space-y-3 pt-3 border-t border-csl-gold/20">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold text-csl-text uppercase tracking-wider">
                    Indexed Profiles Ready for Matching ({uploadResults.length})
                  </h4>
                  <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Saved to SQLite</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-72 overflow-y-auto">
                  {uploadResults.map((r, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 bg-white rounded-xl border border-csl-gold/30 shadow-xs flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <div className="truncate">
                          <div className="font-extrabold text-csl-text truncate">{r.candidate_name || r.filename}</div>
                          <div className="font-mono text-[10px] text-csl-muted">
                            {r.experience_years} yrs exp • {r.skills_count} skills • {r.filename}
                          </div>
                        </div>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-lg font-bold text-[10px] bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 shrink-0">
                        READY
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Stepper Navigation Actions */}
            <div className="pt-4 border-t border-csl-gold/20 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="text-xs font-bold text-csl-muted hover:text-csl-text cursor-pointer"
              >
                ← Back to Requisition
              </button>

              <button
                type="button"
                disabled={uploadResults.length === 0}
                onClick={() => setCurrentStep(3)}
                className={`csl-btn-primary ${uploadResults.length === 0 ? 'opacity-40 cursor-not-allowed hover:scale-100' : ''
                  }`}
              >
                <span>Proceed to Matching ({uploadResults.length} Resumes)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>
      )}

      {/* STEP 3: AI MATCHING & RANKING ENGINE */}
      {currentStep === 3 && (
        <div className="space-y-6">

          {/* Creator Space Lab Signature Standout Blue Card */}
          <div className="csl-box-blue p-8 md:p-10 max-w-2xl mx-auto space-y-6 text-center">

            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center mx-auto shadow-lg border border-white/25">
              <Cpu className={`w-8 h-8 ${matchingInProgress ? 'animate-pulse' : ''}`} />
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-csl-gold/20 text-csl-light-gold border border-csl-gold/30 text-xs font-bold mb-2">
                <Sparkles className="w-3.5 h-3.5 text-csl-gold" />
                <span>SENTENCE-BERT VECTOR PIPELINE</span>
              </div>
              <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                Run AI Matching & Candidate Ranking Engine
              </h3>
              <p className="text-xs text-blue-100 mt-1.5 max-w-md mx-auto leading-relaxed">
                Evaluating candidate vectors against requisition <strong className="text-white underline">"{jobTitle}"</strong> utilizing dense 384-dimensional semantic embeddings.
              </p>
            </div>

            {/* Mathematical Weighted Breakdown Box */}
            <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-left text-xs space-y-2 text-white">
              <span className="font-extrabold text-[11px] text-csl-light-gold uppercase tracking-wider">
                5-Factor Scoring Formulation:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 font-semibold text-blue-50 text-[11px]">
                <div>• Skill Match: <strong className="text-white">40%</strong></div>
                <div>• Cosine Sim: <strong className="text-white">25%</strong></div>
                <div>• Experience: <strong className="text-white">20%</strong></div>
                <div>• Education: <strong className="text-white">10%</strong></div>
                <div>• Projects: <strong className="text-white">5%</strong></div>
                <div className="text-csl-gold font-black">• Total: 100%</div>
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleRunAiMatching}
                disabled={matchingInProgress}
                className="w-full csl-btn-gold py-3.5 text-sm"
              >
                {matchingInProgress ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-csl-text" />
                    <span>Computing Semantic Embeddings & Normalizing...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-csl-text" />
                    <span>Execute AI Matching & Open Rankings ({uploadResults.length} Profiles)</span>
                  </>
                )}
              </button>
            </div>

            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="text-xs text-blue-200 hover:text-white font-medium cursor-pointer"
            >
              ← Back to Uploads
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
