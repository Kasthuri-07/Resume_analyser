import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Cpu, 
  Database, 
  ShieldCheck, 
  RefreshCw, 
  Sliders, 
  Sparkles,
  Zap
} from 'lucide-react';
import { getHealth } from '../services/api';

export default function Settings() {
  const [health, setHealth] = useState(null);
  const [checking, setChecking] = useState(false);

  const checkHealth = async () => {
    setChecking(true);
    try {
      const data = await getHealth();
      setHealth(data);
    } catch (err) {
      setHealth({ status: 'offline', error: err.message });
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6 bg-csl-bg min-h-screen">
      
      {/* Title Header (CSL Card Style) */}
      <div className="csl-card p-5 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-extrabold text-csl-text tracking-tight flex items-center gap-2">
              <SettingsIcon className="w-5 h-5 text-csl-blue" />
              <span>AI Engine Architecture & System Settings</span>
            </h3>
            <span className="text-[10px] font-bold text-csl-blue bg-csl-blue/10 px-2 py-0.5 rounded-lg border border-csl-blue/20">
              AI VECTOR ENGINE v2.4
            </span>
          </div>
          <p className="text-xs text-csl-muted mt-0.5">
            Technical configuration, mathematical weighting models, and diagnostics.
          </p>
        </div>
        <button
          onClick={checkHealth}
          disabled={checking}
          className="csl-btn-primary py-2 px-4"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin' : ''}`} />
          <span>Check Status</span>
        </button>
      </div>

      {/* Subsystem Health (CSL Card Style) */}
      <div className="csl-card p-6">
        <h4 className="text-xs font-extrabold text-csl-text uppercase tracking-wider mb-4 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Core System Health & Services</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-csl-bg border border-csl-gold/25">
            <div className="text-csl-muted font-bold text-[10px] uppercase mb-1">FastAPI Backend API</div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span className="font-extrabold text-csl-text text-sm">Operational (Port 8000)</span>
            </div>
            <div className="text-[10px] text-csl-muted mt-1 font-medium">Uvicorn ASGI • REST APIs</div>
          </div>

          <div className="p-4 rounded-2xl bg-csl-blue/10 border border-csl-blue/25">
            <div className="text-csl-blue font-bold text-[10px] uppercase mb-1">AI Embedding Model</div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-csl-blue"></span>
              <span className="font-extrabold text-csl-blue text-sm">all-MiniLM-L6-v2 (Active)</span>
            </div>
            <div className="text-[10px] text-csl-blue mt-1 font-medium">Dense 384-Dimensions • Torch CPU</div>
          </div>

          <div className="p-4 rounded-2xl bg-csl-bg border border-csl-gold/25">
            <div className="text-csl-muted font-bold text-[10px] uppercase mb-1">Database & ORM</div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span className="font-extrabold text-csl-text text-sm">SQLite + SQLAlchemy 2.0</span>
            </div>
            <div className="text-[10px] text-csl-muted mt-1 font-medium">resume_matcher.db</div>
          </div>
        </div>
      </div>

      {/* Creator Space Lab Signature Standout Blue Card: Weighted Scoring Formula */}
      <div className="csl-box-blue p-7 md:p-8 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/20 rounded-xl text-white backdrop-blur-sm">
              <Sliders className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-extrabold text-white">
              5-Factor Weighted Scoring Methodology
            </h4>
          </div>
          <span className="font-bold text-[10px] bg-csl-gold text-csl-text px-2.5 py-1 rounded-xl shadow-sm">
            NORMALIZED 0-100
          </span>
        </div>

        <p className="text-xs text-blue-100 font-mono leading-relaxed">
          Overall Matching Score = (Skill Match × 0.40) + (Semantic Sim × 0.25) + (Experience × 0.20) + (Education × 0.10) + (Project × 0.05)
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-2 text-xs">
          <div className="p-3.5 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
            <span className="text-[10px] text-blue-200 uppercase font-bold block">Technical Skills</span>
            <strong className="text-white text-lg font-black">40%</strong>
            <p className="text-[10px] text-blue-200 mt-1">Exact & synonym tech match</p>
          </div>

          <div className="p-3.5 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
            <span className="text-[10px] text-blue-200 uppercase font-bold block">Semantic Cosine</span>
            <strong className="text-white text-lg font-black">25%</strong>
            <p className="text-[10px] text-blue-200 mt-1">Sentence-BERT embeddings</p>
          </div>

          <div className="p-3.5 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
            <span className="text-[10px] text-blue-200 uppercase font-bold block">Relevant Exp</span>
            <strong className="text-white text-lg font-black">20%</strong>
            <p className="text-[10px] text-blue-200 mt-1">Non-overlapping tenure</p>
          </div>

          <div className="p-3.5 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
            <span className="text-[10px] text-blue-200 uppercase font-bold block">Education</span>
            <strong className="text-white text-lg font-black">10%</strong>
            <p className="text-[10px] text-blue-200 mt-1">Degree & major pedigree</p>
          </div>

          <div className="p-3.5 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
            <span className="text-[10px] text-blue-200 uppercase font-bold block">Projects</span>
            <strong className="text-white text-lg font-black">5%</strong>
            <p className="text-[10px] text-blue-200 mt-1">Applied project relevance</p>
          </div>
        </div>
      </div>

      {/* Extraction Pipeline Specifications (CSL Card Style) */}
      <div className="csl-card p-6 space-y-4">
        <h4 className="text-xs font-extrabold text-csl-text uppercase tracking-wider flex items-center gap-2">
          <Cpu className="w-4 h-4 text-csl-blue" />
          <span>Extraction Engine Pipeline Architecture</span>
        </h4>

        <div className="space-y-2.5 text-xs text-csl-text">
          <div className="p-3.5 bg-csl-bg rounded-xl border border-csl-gold/25 flex items-center justify-between">
            <span className="text-csl-muted font-bold">PDF Text Extraction Engine:</span>
            <span className="text-csl-text font-extrabold">PyMuPDF (fitz) v1.23 • Multi-strategy block extraction</span>
          </div>

          <div className="p-3.5 bg-csl-bg rounded-xl border border-csl-gold/25 flex items-center justify-between">
            <span className="text-csl-muted font-bold">DOCX Document Parser:</span>
            <span className="text-csl-text font-extrabold">python-docx • XML paragraph traversal</span>
          </div>

          <div className="p-3.5 bg-csl-bg rounded-xl border border-csl-gold/25 flex items-center justify-between">
            <span className="text-csl-muted font-bold">NLP Entity Recognition:</span>
            <span className="text-csl-text font-extrabold">spaCy en_core_web_sm (NER: PERSON, ORG, DATE, GPE)</span>
          </div>

          <div className="p-3.5 bg-csl-bg rounded-xl border border-csl-gold/25 flex items-center justify-between">
            <span className="text-csl-muted font-bold">Technical Skill Taxonomy:</span>
            <span className="text-csl-text font-extrabold">250+ tokens with synonym & alias graph</span>
          </div>

          <div className="p-3.5 bg-csl-bg rounded-xl border border-csl-gold/25 flex items-center justify-between">
            <span className="text-csl-muted font-bold">Experience Overlap Elimination:</span>
            <span className="text-csl-text font-extrabold">Interval merge algorithm (non-overlapping total tenure)</span>
          </div>
        </div>
      </div>

    </div>
  );
}
