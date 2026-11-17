import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Briefcase, 
  Award, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  TrendingUp, 
  Check, 
  Copy, 
  Cpu,
  Sparkles
} from 'lucide-react';

export default function CandidateModal({ candidate, onClose, rawResumeText }) {
  const [showRawText, setShowRawText] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!candidate) return null;

  const copyToClipboard = () => {
    if (rawResumeText) {
      navigator.clipboard.writeText(rawResumeText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-csl-deep-blue/60 backdrop-blur-md flex items-center justify-center p-4 sm:p-6">
      <div className="bg-csl-bg rounded-3xl shadow-2xl border border-csl-gold/30 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Creator Space Lab Signature Standout Blue Header */}
        <div className="px-7 py-5 bg-gradient-to-r from-csl-deep-blue to-csl-blue text-white flex items-center justify-between shrink-0 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-xl pointer-events-none"></div>

          <div className="flex items-center gap-3.5 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-csl-gold text-csl-text flex items-center justify-center font-black text-xl shadow-md border border-white/20">
              #{candidate.rank || '1'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black text-white tracking-tight">
                  {candidate.candidate_name}
                </h3>
                <span className="px-3 py-0.5 text-xs font-bold rounded-xl bg-white/20 text-white border border-white/25">
                  {candidate.recommendation}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-blue-100 mt-1 font-medium">
                {candidate.candidate_email && (
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" /> {candidate.candidate_email}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5" /> {candidate.candidate_experience || 0} Years Experience
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 relative z-10">
            <button
              onClick={() => setShowRawText(!showRawText)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-white/15 hover:bg-white/25 text-white border border-white/25 transition-all backdrop-blur-sm cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{showRawText ? 'Hide Text' : 'View Extracted Resume'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-7 overflow-y-auto space-y-6 flex-1 bg-csl-bg">
          
          {/* Raw Text Drawer View */}
          {showRawText && (
            <div className="bg-white rounded-2xl p-5 text-csl-text font-mono text-xs shadow-sm border border-csl-gold/30">
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-csl-gold/20">
                <span className="text-csl-blue font-sans font-bold flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-csl-blue" />
                  <span>Extracted Plaintext ({candidate.filename})</span>
                </span>
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-1 text-[11px] font-bold text-csl-text hover:text-csl-blue bg-csl-bg px-2.5 py-1 rounded-xl border border-csl-gold/30 cursor-pointer"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied' : 'Copy Text'}</span>
                </button>
              </div>
              <pre className="whitespace-pre-wrap max-h-56 overflow-y-auto leading-relaxed text-csl-text/80 text-[11px]">
                {rawResumeText || candidate.score_explanation || 'No raw text cached.'}
              </pre>
            </div>
          )}

          {/* Top Score Banner Floating Card */}
          <div className="csl-card p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="text-[11px] font-extrabold uppercase tracking-wider text-csl-muted">
                Overall Matching Score
              </div>
              <div className="text-sm font-bold text-csl-text mt-0.5">
                Sentence-BERT Semantic Cosine & 5-Factor Weighted Score
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="font-mono text-4xl font-black text-csl-blue">
                  {candidate.overall_score}%
                </span>
              </div>
              <div className="w-28 bg-[#E5E0D4] rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-csl-blue h-2.5 rounded-full"
                  style={{ width: `${candidate.overall_score}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* 5-Factor Component Scores Grid (CSL Card Style) */}
          <div className="csl-card p-6 space-y-4">
            <h4 className="text-xs font-extrabold text-csl-text uppercase tracking-wider">
              Component Score Breakdown (100% Normalized Scale)
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              
              {/* Technical Skill Match (40%) */}
              <div className="p-3.5 bg-csl-bg rounded-xl border border-csl-gold/25">
                <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                  <span className="text-csl-text">Skill Match (40%)</span>
                  <span className="font-mono text-csl-blue">{candidate.skill_score}%</span>
                </div>
                <div className="w-full bg-[#E5E0D4] rounded-full h-1.5">
                  <div className="bg-csl-blue h-1.5 rounded-full" style={{ width: `${candidate.skill_score}%` }}></div>
                </div>
              </div>

              {/* Semantic Similarity (25%) */}
              <div className="p-3.5 bg-csl-bg rounded-xl border border-csl-gold/25">
                <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                  <span className="text-csl-text">Semantic Cosine (25%)</span>
                  <span className="font-mono text-csl-blue">{candidate.semantic_similarity_score}%</span>
                </div>
                <div className="w-full bg-[#E5E0D4] rounded-full h-1.5">
                  <div className="bg-csl-blue h-1.5 rounded-full" style={{ width: `${candidate.semantic_similarity_score}%` }}></div>
                </div>
              </div>

              {/* Experience Match (20%) */}
              <div className="p-3.5 bg-csl-bg rounded-xl border border-csl-gold/25">
                <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                  <span className="text-csl-text">Experience Match (20%)</span>
                  <span className="font-mono text-csl-blue">{candidate.experience_score}%</span>
                </div>
                <div className="w-full bg-[#E5E0D4] rounded-full h-1.5">
                  <div className="bg-csl-blue h-1.5 rounded-full" style={{ width: `${candidate.experience_score}%` }}></div>
                </div>
              </div>

              {/* Education Match (10%) */}
              <div className="p-3.5 bg-csl-bg rounded-xl border border-csl-gold/25">
                <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                  <span className="text-csl-text">Education Pedigree (10%)</span>
                  <span className="font-mono text-csl-blue">{candidate.education_score}%</span>
                </div>
                <div className="w-full bg-[#E5E0D4] rounded-full h-1.5">
                  <div className="bg-csl-blue h-1.5 rounded-full" style={{ width: `${candidate.education_score}%` }}></div>
                </div>
              </div>

              {/* Project Relevance (5%) */}
              <div className="p-3.5 bg-csl-bg rounded-xl border border-csl-gold/25 sm:col-span-2 md:col-span-1">
                <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                  <span className="text-csl-text">Project Relevance (5%)</span>
                  <span className="font-mono text-csl-blue">{candidate.project_score}%</span>
                </div>
                <div className="w-full bg-[#E5E0D4] rounded-full h-1.5">
                  <div className="bg-csl-blue h-1.5 rounded-full" style={{ width: `${candidate.project_score}%` }}></div>
                </div>
              </div>

            </div>
          </div>

          {/* Technical Skills Categorization (CSL Card Style) */}
          <div className="csl-card p-6 space-y-4">
            <h4 className="text-xs font-extrabold text-csl-text uppercase tracking-wider">
              Technical Skill Categorization
            </h4>

            {/* Matched Skills */}
            <div>
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-csl-blue mb-2">
                <CheckCircle2 className="w-4 h-4 text-csl-blue" />
                <span>Verified Matched Skills ({candidate.matched_skills?.length || 0})</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {(candidate.matched_skills || []).length > 0 ? (
                  candidate.matched_skills.map((s, idx) => (
                    <span 
                      key={idx} 
                      className="px-3 py-1 bg-csl-blue/10 text-csl-blue text-xs font-bold rounded-xl border border-csl-blue/20"
                    >
                      {s}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-csl-muted italic">No exact technical matches identified.</span>
                )}
              </div>
            </div>

            {/* Related / Transferred Skills */}
            {candidate.related_skills && candidate.related_skills.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#0B2E6F] mb-2">
                  <TrendingUp className="w-4 h-4 text-[#0B2E6F]" />
                  <span>Related / Transferable Skills ({candidate.related_skills.length})</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {candidate.related_skills.map((s, idx) => (
                    <span 
                      key={idx} 
                      className="px-3 py-1 bg-[#0B2E6F]/10 text-[#0B2E6F] text-xs font-bold rounded-xl border border-[#0B2E6F]/20"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Missing Skills */}
            <div>
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-red-600 mb-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span>Missing Requisition Skills ({candidate.missing_skills?.length || 0})</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {(candidate.missing_skills || []).length > 0 ? (
                  candidate.missing_skills.map((s, idx) => (
                    <span 
                      key={idx} 
                      className="px-3 py-1 bg-red-500/10 text-red-600 text-xs font-bold rounded-xl border border-red-500/20"
                    >
                      {s}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-emerald-700 font-bold">Zero missing skills. Complete coverage!</span>
                )}
              </div>
            </div>
          </div>

          {/* Why This Candidate Received This Score? */}
          <div className="csl-card p-6 space-y-2.5">
            <h4 className="text-xs font-extrabold text-csl-text uppercase tracking-wider flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-csl-blue" />
              <span>Why This Candidate Received This Score?</span>
            </h4>
            <div className="bg-csl-bg p-4 rounded-2xl border border-csl-gold/30 text-xs font-medium text-csl-text leading-relaxed">
              {candidate.score_explanation || 'Comprehensive weighted formula score calculated.'}
            </div>
          </div>

          {/* Strengths & Improvement Opportunities */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Strengths */}
            <div className="csl-card p-6 space-y-2.5">
              <h4 className="text-xs font-extrabold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Candidate Strengths</span>
              </h4>
              <ul className="space-y-2 text-xs text-csl-text font-medium">
                {(candidate.strengths || [
                  'Strong domain alignment with core requirements',
                  'Verified hands-on production experience',
                  'Relevant technical project portfolio'
                ]).map((st, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>{st}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Areas for Improvement */}
            <div className="csl-card p-6 space-y-2.5">
              <h4 className="text-xs font-extrabold text-[#B45309] uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-[#B45309]" />
                <span>Areas for Improvement</span>
              </h4>
              <ul className="space-y-2 text-xs text-csl-text font-medium">
                {(candidate.weaknesses || [
                  'Specific secondary technology stack items missing',
                  'Further technical vetting suggested during interview'
                ]).map((wk, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-[#B45309] font-bold">•</span>
                    <span>{wk}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-7 py-4 bg-white border-t border-csl-gold/20 flex items-center justify-end">
          <button
            onClick={onClose}
            className="csl-btn-primary"
          >
            Close Profile
          </button>
        </div>

      </div>
    </div>
  );
}
