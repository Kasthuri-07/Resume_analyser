import React, { useState, useEffect } from 'react';
import {
  Users,
  Award,
  Briefcase,
  TrendingUp,
  CheckCircle2,
  BarChart3,
  Activity,
  ChevronRight,
  RefreshCw,
  Sparkles,
  Zap,
  ArrowRight
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { getDashboardStats } from '../services/api';

export default function Dashboard({ onNavigateToRankings, onStartNewAnalysis, onViewCandidate }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadStats = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center min-h-[60vh] text-csl-muted bg-csl-bg">
        <RefreshCw className="w-7 h-7 animate-spin text-csl-blue mb-3" />
        <p className="font-bold text-xs text-csl-text">Aggregating live candidate metrics...</p>
      </div>
    );
  }

  const scoreDist = stats?.score_distribution || [];
  const topCandidates = stats?.top_5_candidates || [];
  const activities = stats?.recent_activities || [];
  const skillStats = stats?.skill_match_statistics || [];

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto bg-csl-bg min-h-screen">

      {/* Creator Space Lab Signature Hero Blue Box */}
      <div className="csl-box-blue p-7 md:p-8 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">

        {/* Soft background glow flare */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="space-y-2 relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-csl-gold/20 text-csl-light-gold border border-csl-gold/30 text-xs font-bold mb-1">
            <Sparkles className="w-3.5 h-3.5 text-csl-gold" />
            <span>AI-Driven Candidate Intelligence System</span>
          </div>

          <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            Intelligent Recruitment Dashboard
          </h3>

          <p className="text-xs text-blue-100 font-mono leading-relaxed">
            FORMULA: FinalScore = (Skill × 0.40) + (Semantic × 0.25) + (Experience × 0.20) + (Education × 0.10) + (Projects × 0.05)
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10 shrink-0">
          <button
            onClick={() => loadStats(true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-white/10 hover:bg-white/20 rounded-xl transition-all border border-white/20 backdrop-blur-sm cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={onStartNewAnalysis}
            className="csl-btn-gold"
          >
            <Zap className="w-3.5 h-3.5 text-csl-text" />
            <span>+ Start Matching</span>
          </button>
        </div>
      </div>

      {/* 5 KPI Metric Floating Boxes (Featuring Signature Creator Space Lab Blue & Gold Boxes) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">

        {/* Standout CSL Blue Box 1: Average Match Score */}
        <div className="csl-box-blue p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-[11px] text-blue-100 uppercase tracking-wider">
              Avg Match Score
            </span>
            <div className="p-2 bg-white/20 rounded-xl text-white backdrop-blur-sm">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="font-black text-3xl text-white">
              {stats?.average_matching_score ? `${stats.average_matching_score}%` : '0%'}
            </div>
            <p className="text-[11px] text-blue-200 mt-1 font-medium">Cohort mean evaluation</p>
          </div>
        </div>

        {/* Standout CSL Blue Box 2: Top Ranked Match */}
        <div className="csl-box-blue bg-gradient-to-br from-csl-deep-blue via-[#0c3987] to-csl-blue p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-[11px] text-blue-100 uppercase tracking-wider">
              Top Ranked Match
            </span>
            <div className="p-2 bg-csl-gold text-csl-text rounded-xl font-black text-xs shadow-sm">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-sm font-black text-white truncate">
              {stats?.top_ranked_candidate || 'None evaluated'}
            </div>
            <p className="font-bold text-[11px] text-csl-gold mt-1">
              Top Score: {stats?.top_ranked_score || 0}%
            </p>
          </div>
        </div>

        {/* Floating Card 3: Total Candidates */}
        <div className="csl-card p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-[11px] text-csl-muted uppercase tracking-wider">
              Resumes Parsed
            </span>
            <div className="p-2 bg-csl-blue/10 rounded-xl text-csl-blue">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="font-black text-3xl text-csl-text">
              {stats?.total_candidates || 0}
            </div>
            <p className="text-[11px] text-csl-muted mt-1 font-medium">PDF & DOCX profiles</p>
          </div>
        </div>

        {/* Floating Card 4: Jobs Analyzed */}
        <div className="csl-card p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-[11px] text-csl-muted uppercase tracking-wider">
              Active Jobs
            </span>
            <div className="p-2 bg-csl-gold/15 rounded-xl text-[#B45309]">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="font-black text-3xl text-csl-text">
              {stats?.total_jobs || 0}
            </div>
            <p className="text-[11px] text-csl-muted mt-1 font-medium">Requisitions in database</p>
          </div>
        </div>

        {/* Floating Card 5: High Matches (>= 70%) */}
        <div className="csl-card p-5 flex flex-col justify-between border-l-4 border-l-csl-blue">
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-[11px] text-csl-muted uppercase tracking-wider">
              High Match (≥70%)
            </span>
            <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="font-black text-3xl text-csl-blue">
              {stats?.high_match_count || 0}
            </div>
            <p className="text-[11px] text-csl-muted mt-1 font-medium">Interview ready</p>
          </div>
        </div>

      </div>

      {/* Main Visualizations Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Chart 1: Candidate Score Distribution (Floating Card) */}
        <div className="csl-card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-csl-gold/20">
            <div>
              <h4 className="text-sm font-extrabold text-csl-text">Candidate Score Distribution</h4>
              <p className="text-xs text-csl-muted">Distribution across 4 standard HR suitability tiers</p>
            </div>
            <span className="text-xs font-bold text-csl-blue bg-csl-blue/10 px-2.5 py-1 rounded-xl border border-csl-blue/20">
              all-MiniLM-L6-v2 Scale
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scoreDist} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#6B7280' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#6B7280' }} />
                <Tooltip
                  formatter={(val, name, props) => [`${val} Candidates (${props.payload.percentage}%)`, 'Count']}
                  contentStyle={{ backgroundColor: '#0B2E6F', color: '#FFFFFF', borderRadius: '12px', fontSize: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(11, 46, 111, 0.25)' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {scoreDist.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={index === 0 ? '#0B2E6F' : index === 1 ? '#1455B8' : index === 2 ? '#3B82F6' : '#F5B83D'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Bracket legend indicators */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-3 border-t border-csl-gold/20 text-xs">
            {scoreDist.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: idx === 0 ? '#0B2E6F' : idx === 1 ? '#1455B8' : idx === 2 ? '#3B82F6' : '#F5B83D' }}
                ></span>
                <span className="text-csl-muted font-medium truncate">{item.label}:</span>
                <strong className="text-csl-text">{item.count}</strong>
              </div>
            ))}
          </div>
        </div>

        {/* Creator Space Lab Signature Standout Blue Card: In-Demand Technical Skills */}
        <div className="csl-box-blue p-6 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-xl pointer-events-none"></div>

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-sm font-extrabold text-white">Skill Frequency Index</h4>
              <div className="p-1.5 bg-white/20 rounded-xl text-white backdrop-blur-sm">
                <BarChart3 className="w-4 h-4" />
              </div>
            </div>
            <p className="text-xs text-blue-100 mb-4 font-medium">Most verified candidate competencies</p>

            <div className="space-y-3.5">
              {skillStats.length > 0 ? (
                skillStats.slice(0, 6).map((item, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-white">{item.skill}</span>
                      <span className="text-csl-light-gold font-mono">{item.count} resumes ({item.percentage}%)</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-csl-gold h-1.5 rounded-full"
                        style={{ width: `${Math.min(item.percentage, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-blue-200 text-xs">
                  No skills indexed yet.
                </div>
              )}
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-white/20 flex items-center justify-between text-[11px] text-blue-100 relative z-10">
            <span>Taxonomy: 250+ tokens</span>
            <span className="bg-csl-gold text-csl-text font-black px-2 py-0.5 rounded-md text-[10px]">spaCy v3.7</span>
          </div>
        </div>

      </div>

      {/* Two Lower Columns: Top Ranked Candidates & Activity Log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Top 5 Ranked Candidates Table (Floating Card) */}
        <div className="csl-card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-csl-gold/20">
            <div>
              <h4 className="text-sm font-extrabold text-csl-text">Top-Ranked Candidates</h4>
              <p className="text-xs text-csl-muted">Highest composite match results for current active job</p>
            </div>
            <button
              onClick={onNavigateToRankings}
              className="text-xs font-bold text-csl-blue hover:text-csl-deep-blue flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-csl-gold/20 text-[10px] font-bold uppercase tracking-wider text-csl-muted">
                  <th className="pb-2.5">Rank</th>
                  <th className="pb-2.5">Candidate</th>
                  <th className="pb-2.5">Experience</th>
                  <th className="pb-2.5">Recommendation</th>
                  <th className="pb-2.5 text-right">Score</th>
                  <th className="pb-2.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-csl-gold/15">
                {topCandidates.length > 0 ? (
                  topCandidates.map((c, i) => (
                    <tr
                      key={c.id || i}
                      className="hover:bg-csl-blue/[0.04] transition-colors cursor-pointer group"
                      onClick={() => onViewCandidate && onViewCandidate(c)}
                    >
                      <td className="py-3 font-mono font-black text-csl-text">
                        #{c.rank || i + 1}
                      </td>
                      <td className="py-3">
                        <div className="font-extrabold text-csl-text group-hover:text-csl-blue transition-colors">
                          {c.candidate_name}
                        </div>
                        <div className="text-[11px] text-csl-muted truncate max-w-[160px]">
                          {c.email || c.filename}
                        </div>
                      </td>
                      <td className="py-3 font-mono font-medium text-csl-text">
                        {c.experience_years} yrs
                      </td>
                      <td className="py-3">
                        <span className={`px-2.5 py-0.5 rounded-xl text-[10px] font-bold ${c.recommendation === 'Excellent Match'
                            ? 'bg-csl-blue/10 text-csl-blue border border-csl-blue/20'
                            : c.recommendation === 'Good Match'
                              ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/20'
                              : 'bg-csl-gold/15 text-[#B45309] border border-csl-gold/30'
                          }`}>
                          {c.recommendation}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <span className="font-mono font-black text-csl-blue text-sm">
                          {c.overall_score}%
                        </span>
                      </td>
                      <td className="py-3 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onViewCandidate) onViewCandidate(c);
                          }}
                          className="px-2.5 py-1 text-[11px] font-bold text-csl-text hover:text-csl-blue hover:bg-csl-blue/10 rounded-lg transition-colors"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-csl-muted text-xs">
                      No matching records found. Upload resumes and run an analysis to see ranked candidates.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Evaluation Runs (Floating Card) */}
        <div className="csl-card p-6">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-csl-gold/20">
            <div>
              <h4 className="text-sm font-extrabold text-csl-text">Recent Activity</h4>
              <p className="text-xs text-csl-muted">Evaluation audit trail</p>
            </div>
            <Activity className="w-3.5 h-3.5 text-csl-muted" />
          </div>

          <div className="space-y-3">
            {activities.length > 0 ? (
              activities.map((act, idx) => (
                <div key={idx} className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-white transition-colors">
                  <div className="w-2 h-2 rounded-full bg-csl-gold mt-1.5 shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-csl-text leading-snug truncate">
                      {act.title}
                    </p>
                    <p className="text-[11px] text-csl-muted truncate">
                      {act.subtitle}
                    </p>
                    <span className="font-mono text-[10px] text-csl-muted">
                      {act.time}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-csl-muted text-xs">
                No recent activity logged.
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
