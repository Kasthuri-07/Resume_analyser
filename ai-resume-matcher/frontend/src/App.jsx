import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import NewAnalysis from './pages/NewAnalysis';
import Rankings from './pages/Rankings';
import History from './pages/History';
import Settings from './pages/Settings';
import { getJobs } from './services/api';

export default function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(null);

  // Load available jobs from backend
  const loadJobs = async () => {
    try {
      const data = await getJobs();
      setJobs(data);
      if (data.length > 0 && !selectedJobId) {
        setSelectedJobId(data[0].id);
      }
    } catch (err) {
      console.error('Failed to load job listings:', err);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const handleAnalysisComplete = (newJobId, results) => {
    loadJobs();
    setSelectedJobId(newJobId);
    setActivePage('rankings');
  };

  const handleStartNewAnalysis = () => {
    setActivePage('new-analysis');
  };

  const handleSelectJob = (jobId) => {
    setSelectedJobId(jobId);
  };

  const handleNavigateToRankings = () => {
    setActivePage('rankings');
  };

  return (
    <div className="flex min-h-screen bg-white font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      {/* Sidebar Navigation */}
      <Sidebar activePage={activePage} setActivePage={setActivePage} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          activePage={activePage}
          jobs={jobs}
          selectedJobId={selectedJobId}
          setSelectedJobId={setSelectedJobId}
          onStartNewAnalysis={handleStartNewAnalysis}
        />

        <main className="flex-1 overflow-y-auto">
          {activePage === 'dashboard' && (
            <Dashboard
              onNavigateToRankings={handleNavigateToRankings}
              onStartNewAnalysis={handleStartNewAnalysis}
              onViewCandidate={(cand) => {
                if (cand.job_id) setSelectedJobId(cand.job_id);
                setActivePage('rankings');
              }}
            />
          )}

          {activePage === 'new-analysis' && (
            <NewAnalysis
              onAnalysisComplete={handleAnalysisComplete}
              onSelectJob={handleSelectJob}
            />
          )}

          {activePage === 'rankings' && (
            <Rankings
              selectedJobId={selectedJobId}
              jobs={jobs}
            />
          )}

          {activePage === 'history' && (
            <History
              onSelectJob={handleSelectJob}
              onViewRankings={handleNavigateToRankings}
            />
          )}

          {activePage === 'settings' && (
            <Settings />
          )}
        </main>
      </div>
    </div>
  );
}
