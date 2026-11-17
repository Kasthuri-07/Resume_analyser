import React, { useState, useEffect } from 'react';
import {
  History as HistoryIcon,
  Trash2,
  Briefcase,
  Users,
  Award,
  Calendar,
  RefreshCw,
  ArrowRight
} from 'lucide-react';
import { getAnalysisHistory, deleteAnalysis } from '../services/api';

export default function History({ onSelectJob, onViewRankings }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await getAnalysisHistory();
      setSessions(data);
    } catch (err) {
      console.error('Failed to load analysis history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this evaluation run record from SQLite?')) return;
    try {
      await deleteAnalysis(id);
      setSessions(sessions.filter((s) => s.id !== id));
    } catch (err) {
      alert('Failed to delete analysis session.');
    }
  };

  const handleOpenResults = (jobId) => {
    if (onSelectJob) onSelectJob(jobId);
    if (onViewRankings) onViewRankings();
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6 bg-csl-bg min-h-screen">

      {/* Header Bar (CSL Card Style) */}
      <div className="csl-card p-5 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-extrabold text-csl-text tracking-tight flex items-center gap-2">
              <HistoryIcon className="w-5 h-5 text-csl-blue" />
              <span>Analysis Sessions History</span>
            </h3>
            <span className="text-[10px] font-bold text-csl-blue bg-csl-blue/10 px-2 py-0.5 rounded-lg border border-csl-blue/20">
              PERSISTED IN SQLITE
            </span>
          </div>
          <p className="text-xs text-csl-muted mt-0.5">
            Audit log of candidate matching evaluation sessions.
          </p>
        </div>
        <button
          onClick={fetchHistory}
          className="p-2.5 text-csl-muted hover:text-csl-blue bg-white hover:bg-csl-bg rounded-xl transition-colors text-xs border border-csl-gold/30 shadow-xs cursor-pointer"
          title="Refresh History"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Sessions Grid */}
      {loading ? (
        <div className="p-16 flex flex-col items-center justify-center text-csl-muted">
          <RefreshCw className="w-7 h-7 animate-spin text-csl-blue mb-2" />
          <p className="text-xs font-bold text-csl-text">Retrieving analysis history...</p>
        </div>
      ) : sessions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {sessions.map((sess) => (
            <div
              key={sess.id}
              className="csl-card p-6 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[11px] text-csl-muted font-bold">
                    ID: #{sess.id.substring(0, 8)}
                  </span>
                  <div className="flex items-center gap-1.5 text-[11px] text-csl-muted font-semibold">
                    <Calendar className="w-3.5 h-3.5 text-csl-gold" />
                    <span>{new Date(sess.created_at).toLocaleDateString()} {new Date(sess.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>

                <h4 className="text-sm font-black text-csl-text mb-1">
                  {sess.job_title}
                </h4>
                <p className="text-xs text-csl-muted mb-4 font-medium">
                  Company: {sess.company || 'Enterprise Requisition'}
                </p>

                <div className="grid grid-cols-3 gap-2 p-3 bg-csl-bg rounded-xl border border-csl-gold/25 text-center text-xs mb-4">
                  <div>
                    <span className="text-[10px] text-csl-muted block uppercase font-bold">Candidates</span>
                    <strong className="text-csl-text text-sm font-black">{sess.total_candidates_analyzed}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-csl-muted block uppercase font-bold">Avg Score</span>
                    <strong className="text-csl-blue text-sm font-black">{sess.average_score}%</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-csl-muted block uppercase font-bold">Top Score</span>
                    <strong className="text-emerald-700 text-sm font-black">{sess.top_score}%</strong>
                  </div>
                </div>

                {sess.top_candidate_name && (
                  <div className="flex items-center gap-2 text-xs text-csl-text font-bold mb-4">
                    <Award className="w-4 h-4 text-csl-gold" />
                    <span>Top Match: <strong className="text-csl-blue">{sess.top_candidate_name}</strong></span>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-csl-gold/20 flex items-center justify-between">
                <button
                  onClick={() => handleDelete(sess.id)}
                  className="flex items-center gap-1 text-[11px] font-bold text-red-600 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Session</span>
                </button>

                <button
                  onClick={() => handleOpenResults(sess.job_id)}
                  className="csl-btn-primary py-2 px-4"
                >
                  <span>Open Results</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="csl-card p-12 text-center text-csl-muted text-xs">
          No analysis sessions recorded yet. Run a candidate matching analysis to persist audit records.
        </div>
      )}

    </div>
  );
}
