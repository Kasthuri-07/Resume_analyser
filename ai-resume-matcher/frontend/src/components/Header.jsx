import React from 'react';
import { Briefcase, Plus, Sparkles } from 'lucide-react';

export default function Header({ 
  activePage, 
  jobs = [], 
  selectedJobId, 
  setSelectedJobId, 
  onStartNewAnalysis 
}) {
  const getPageInfo = () => {
    switch (activePage) {
      case 'dashboard':
        return {
          title: 'Executive Recruitment Dashboard',
          subtitle: 'Live candidate telemetry, score distribution, and AI matching insights',
        };
      case 'new-analysis':
        return {
          title: 'New Resume Matching Analysis',
          subtitle: 'Extract job criteria, batch upload PDF/DOCX resumes, and compute rankings',
        };
      case 'rankings':
        return {
          title: 'Candidate Rankings & Evaluation',
          subtitle: 'Intelligent multi-factor scoring with transparent evidence derivation',
        };
      case 'history':
        return {
          title: 'Evaluation Run History',
          subtitle: 'Audit trail of past matching sessions and candidate cohorts stored in SQLite',
        };
      case 'settings':
        return {
          title: 'System & Engine Configuration',
          subtitle: 'Sentence Transformer hyperparameters, 5-factor scoring weights, and diagnostics',
        };
      default:
        return { title: 'Dashboard', subtitle: '' };
    }
  };

  const { title, subtitle } = getPageInfo();

  return (
    <header className="bg-csl-bg/90 backdrop-blur-md border-b border-csl-gold/25 sticky top-0 z-20 px-8 py-3.5 shadow-[0_2px_10px_-2px_rgba(245,184,61,0.06)]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Page Titles */}
        <div>
          <h2 className="text-lg font-black text-csl-text tracking-tight">{title}</h2>
          <p className="text-xs text-csl-muted mt-0.5">{subtitle}</p>
        </div>

        {/* Action Controls & Active Job Selector */}
        <div className="flex items-center gap-3">
          {jobs.length > 0 && (
            <div className="flex items-center gap-2 bg-white border border-csl-gold/30 rounded-xl px-3.5 py-2 shadow-xs hover:border-csl-blue/60 transition-colors">
              <Briefcase className="w-3.5 h-3.5 text-csl-blue" />
              <div className="text-xs flex items-center gap-1.5">
                <span className="text-csl-muted font-bold text-[10px] uppercase">JOB:</span>
                <select
                  value={selectedJobId || ''}
                  onChange={(e) => setSelectedJobId(Number(e.target.value))}
                  className="bg-transparent font-bold text-csl-text focus:outline-none cursor-pointer max-w-[220px] truncate text-xs"
                >
                  {jobs.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.title} (ID: #{j.id})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <button
            onClick={onStartNewAnalysis}
            className="csl-btn-primary"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ New Analysis</span>
          </button>
        </div>
      </div>
    </header>
  );
}
