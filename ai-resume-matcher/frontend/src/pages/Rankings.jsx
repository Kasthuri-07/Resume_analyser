import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Download, 
  Filter, 
  ArrowUpDown, 
  Award, 
  Briefcase, 
  Eye, 
  CheckCircle2, 
  AlertTriangle,
  RefreshCw,
  FileSpreadsheet,
  ChevronRight,
  Sparkles,
  Zap
} from 'lucide-react';
import { getMatchingResults, getExportCsvUrl, getCandidate } from '../services/api';
import CandidateModal from '../components/CandidateModal';

export default function Rankings({ selectedJobId, jobs = [] }) {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [scoreFilter, setScoreFilter] = useState('all');
  const [skillFilter, setSkillFilter] = useState('');
  const [sortBy, setSortBy] = useState('overall_score');
  const [sortOrder, setSortOrder] = useState('desc');

  // Candidate detail modal state
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [rawResumeText, setRawResumeText] = useState('');
  const [loadingDetail, setLoadingDetail] = useState(false);

  const fetchResults = async () => {
    if (!selectedJobId) return;
    setLoading(true);
    try {
      const params = {
        sort_by: sortBy,
        sort_order: sortOrder,
      };
      if (scoreFilter === 'excellent') params.min_score = 85.0;
      else if (scoreFilter === 'good') params.recommendation = 'Good Match';
      else if (scoreFilter === 'moderate') params.recommendation = 'Moderate Match';
      else if (scoreFilter === 'low') params.recommendation = 'Low Match';

      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (skillFilter.trim()) params.skill = skillFilter.trim();

      const data = await getMatchingResults(selectedJobId, params);
      setCandidates(data);
    } catch (err) {
      console.error('Failed to load candidate rankings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, [selectedJobId, scoreFilter, sortBy, sortOrder, skillFilter]);

  // Handle View Details
  const handleViewDetails = async (cand) => {
    setSelectedCandidate(cand);
    setLoadingDetail(true);
    try {
      const detail = await getCandidate(cand.candidate_id);
      setRawResumeText(detail.raw_text || '');
    } catch (err) {
      setRawResumeText(cand.score_explanation || '');
    } finally {
      setLoadingDetail(false);
    }
  };

  // Toggle Sorting
  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  // Export CSV handler
  const handleExportCsv = () => {
    if (!selectedJobId) return;
    window.open(getExportCsvUrl(selectedJobId), '_blank');
  };

  const getRecommendationBadge = (rec) => {
    switch (rec) {
      case 'Excellent Match':
        return 'bg-csl-blue/10 text-csl-blue border-csl-blue/30 font-bold';
      case 'Good Match':
        return 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30 font-bold';
      case 'Moderate Match':
        return 'bg-csl-gold/15 text-[#B45309] border-csl-gold/30 font-bold';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300 font-medium';
    }
  };

  const currentJob = jobs.find((j) => j.id === Number(selectedJobId));
  const topCandidate = candidates.length > 0 ? candidates[0] : null;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 bg-csl-bg min-h-screen">
      
      {/* Top Header Controls Bar (CSL Card Style) */}
      <div className="csl-card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-extrabold text-csl-text tracking-tight flex items-center gap-2">
              <Award className="w-5 h-5 text-csl-blue" />
              <span>Candidate Rankings & Intelligence Table</span>
            </h3>
            <span className="font-bold text-[10px] text-csl-blue bg-csl-blue/10 px-2 py-0.5 rounded-lg border border-csl-blue/20">
              REQUISITION #{selectedJobId || 'NONE'}
            </span>
          </div>
          <p className="text-xs text-csl-muted mt-0.5">
            Role: <strong className="text-csl-text">{currentJob?.title || 'Senior AI & Full-Stack Engineer'}</strong> • {candidates.length} Profiles Evaluated
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchResults}
            className="p-2.5 text-csl-muted hover:text-csl-blue bg-white hover:bg-csl-bg rounded-xl transition-colors text-xs border border-csl-gold/30 shadow-xs cursor-pointer"
            title="Refresh Rankings"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={handleExportCsv}
            className="csl-btn-primary"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Creator Space Lab Signature Standout Blue Card: Top Ranked Candidate */}
      {topCandidate && (
        <div className="csl-box-blue p-6 md:p-7 flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-xl pointer-events-none"></div>

          <div className="flex items-center gap-4 relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-csl-gold text-csl-text flex items-center justify-center font-black text-xl shadow-lg border border-white/20 shrink-0">
              #1
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-csl-light-gold">
                  Top Recommended Candidate
                </span>
                <span className="px-2.5 py-0.5 rounded-xl text-[10px] font-bold bg-white/20 text-white border border-white/25">
                  {topCandidate.recommendation}
                </span>
              </div>
              <h4 className="text-xl font-black text-white mt-0.5">
                {topCandidate.candidate_name}
              </h4>
              <p className="text-xs text-blue-100 mt-0.5 font-medium">
                {topCandidate.candidate_experience} Years Exp • Matched: {topCandidate.matched_skills?.slice(0, 4).join(', ')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 relative z-10 shrink-0">
            <div className="text-right">
              <span className="text-[10px] text-blue-200 uppercase font-extrabold">Matching Score</span>
              <div className="font-mono text-3xl font-black text-white">{topCandidate.overall_score}%</div>
            </div>
            <button
              onClick={() => handleViewDetails(topCandidate)}
              className="csl-btn-gold"
            >
              <Eye className="w-4 h-4 text-csl-text" />
              <span>Inspect Profile</span>
            </button>
          </div>
        </div>
      )}

      {/* Filter and Search Bar (CSL Card Style) */}
      <div className="csl-card p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-csl-muted absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchResults()}
            placeholder="Search candidate name..."
            className="w-full pl-10 pr-3 py-2 bg-white border border-csl-gold/30 rounded-xl focus:outline-none focus:border-csl-blue focus:ring-2 focus:ring-csl-blue/20 font-semibold text-xs"
          />
        </div>

        {/* Score Tier Filter */}
        <div className="flex items-center gap-2">
          <span className="text-csl-muted font-bold shrink-0">Tier:</span>
          <select
            value={scoreFilter}
            onChange={(e) => setScoreFilter(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-csl-gold/30 rounded-xl focus:outline-none focus:border-csl-blue focus:ring-2 focus:ring-csl-blue/20 text-xs font-bold cursor-pointer"
          >
            <option value="all">All Tiers (0–100%)</option>
            <option value="excellent">Excellent Match (85–100%)</option>
            <option value="good">Good Match (70–84%)</option>
            <option value="moderate">Moderate Match (50–69%)</option>
            <option value="low">Low Match (&lt;50%)</option>
          </select>
        </div>

        {/* Skill Filter */}
        <div className="flex items-center gap-2">
          <span className="text-csl-muted font-bold shrink-0">Skill:</span>
          <input
            type="text"
            value={skillFilter}
            onChange={(e) => setSkillFilter(e.target.value)}
            placeholder="e.g. Python, React"
            className="w-full px-3 py-2 bg-white border border-csl-gold/30 rounded-xl focus:outline-none focus:border-csl-blue focus:ring-2 focus:ring-csl-blue/20 font-semibold text-xs"
          />
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-2">
          <span className="text-csl-muted font-bold shrink-0">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-csl-gold/30 rounded-xl focus:outline-none focus:border-csl-blue focus:ring-2 focus:ring-csl-blue/20 text-xs font-bold cursor-pointer"
          >
            <option value="overall_score">Matching Score (%)</option>
            <option value="experience">Experience (Years)</option>
            <option value="skill_score">Technical Skill Match</option>
          </select>
        </div>

      </div>

      {/* Main Candidate Table (CSL Card Style) */}
      <div className="csl-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#FAF8F5] border-b border-csl-gold/20 text-[10px] font-extrabold uppercase tracking-wider text-csl-muted">
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Candidate Profile</th>
                <th 
                  className="py-3 px-4 cursor-pointer hover:text-csl-blue transition-colors"
                  onClick={() => toggleSort('experience')}
                >
                  <div className="flex items-center gap-1">
                    <span>Experience</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th 
                  className="py-3 px-4 cursor-pointer hover:text-csl-blue transition-colors"
                  onClick={() => toggleSort('overall_score')}
                >
                  <div className="flex items-center gap-1">
                    <span>Match Score</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4">Skills Verification</th>
                <th className="py-3 px-4">Recommendation</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-csl-gold/15">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-csl-muted">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto text-csl-blue mb-2" />
                    <span className="font-bold text-xs">Querying candidate vector database...</span>
                  </td>
                </tr>
              ) : candidates.length > 0 ? (
                candidates.map((cand, idx) => (
                  <tr 
                    key={cand.id || idx}
                    className="hover:bg-csl-blue/[0.04] transition-colors group cursor-pointer"
                    onClick={() => handleViewDetails(cand)}
                  >
                    {/* Rank */}
                    <td className="py-3.5 px-4 font-mono font-black text-csl-text">
                      #{cand.rank || idx + 1}
                    </td>

                    {/* Candidate Name & Contact */}
                    <td className="py-3.5 px-4">
                      <div className="font-extrabold text-csl-text group-hover:text-csl-blue transition-colors">
                        {cand.candidate_name}
                      </div>
                      <div className="text-[11px] text-csl-muted truncate max-w-xs">
                        {cand.candidate_email || cand.filename || 'PDF Profile'}
                      </div>
                    </td>

                    {/* Experience */}
                    <td className="py-3.5 px-4 font-mono font-semibold text-csl-text">
                      <div>{cand.candidate_experience || 0} Years</div>
                      <div className="text-[10px] text-csl-muted font-normal">verified tenure</div>
                    </td>

                    {/* Overall Score */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-csl-blue text-sm">
                          {cand.overall_score}%
                        </span>
                        <div className="w-16 bg-[#E5E0D4] rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-csl-blue h-1.5 rounded-full"
                            style={{ width: `${cand.overall_score}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="text-[10px] text-csl-muted mt-0.5 font-medium">
                        Skill: {cand.skill_score}% • Cosine: {cand.semantic_similarity_score}%
                      </div>
                    </td>

                    {/* Skills Breakdown */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="flex flex-wrap gap-1 mb-1">
                        {(cand.matched_skills || []).slice(0, 3).map((s, i) => (
                          <span 
                            key={i} 
                            className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-csl-blue/10 text-csl-blue border border-csl-blue/20"
                          >
                            {s}
                          </span>
                        ))}
                        {(cand.matched_skills || []).length > 3 && (
                          <span className="text-[10px] font-bold text-csl-muted">
                            +{cand.matched_skills.length - 3} more
                          </span>
                        )}
                      </div>
                      {cand.missing_skills && cand.missing_skills.length > 0 && (
                        <div className="text-[10px] text-csl-muted truncate">
                          Missing: {cand.missing_skills.slice(0, 2).join(', ')}
                        </div>
                      )}
                    </td>

                    {/* Recommendation Badge */}
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border ${getRecommendationBadge(cand.recommendation)}`}>
                        {cand.recommendation}
                      </span>
                    </td>

                    {/* Action Button */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetails(cand);
                        }}
                        className="px-3 py-1.5 bg-white hover:bg-csl-blue hover:text-white text-csl-text border border-csl-gold/40 rounded-xl text-xs font-bold transition-all shadow-xs inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-csl-muted text-xs">
                    No matching candidates found matching current filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Candidate Profile Detailed Modal */}
      {selectedCandidate && (
        <CandidateModal 
          candidate={selectedCandidate} 
          onClose={() => setSelectedCandidate(null)}
          rawResumeText={rawResumeText}
        />
      )}

    </div>
  );
}
