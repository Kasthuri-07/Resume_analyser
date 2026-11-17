import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 60000,
});

export const getHealth = async () => {
  const res = await api.get('/health');
  return res.data;
};

export const getDashboardStats = async () => {
  const res = await api.get('/dashboard/stats');
  return res.data;
};

// Jobs
export const getJobs = async () => {
  const res = await api.get('/jobs');
  return res.data;
};

export const getJob = async (jobId) => {
  const res = await api.get(`/jobs/${jobId}`);
  return res.data;
};

export const createJob = async (jobData) => {
  const res = await api.post('/jobs', jobData);
  return res.data;
};

export const extractJobFromText = async (data) => {
  const res = await api.post('/jobs/extract', data);
  return res.data;
};

export const uploadJobFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await api.post('/jobs/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

// Resumes
export const uploadResumes = async (files, onProgress) => {
  const formData = new FormData();
  for (let i = 0; i < files.length; i++) {
    formData.append('files', files[i]);
  }
  const res = await api.post('/resumes/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percentCompleted);
      }
    },
  });
  return res.data;
};

export const loadSampleResumes = async () => {
  const res = await api.post('/resumes/load-samples');
  return res.data;
};

export const getCandidates = async () => {
  const res = await api.get('/resumes/candidates');
  return res.data;
};

export const getCandidate = async (candidateId) => {
  const res = await api.get(`/resumes/candidates/${candidateId}`);
  return res.data;
};

// Matching & Rankings
export const runMatchingAnalysis = async (jobId, candidateIds = null) => {
  const res = await api.post('/matching/analyze', {
    job_id: jobId,
    candidate_ids: candidateIds,
  });
  return res.data;
};

export const getMatchingResults = async (jobId, params = {}) => {
  const res = await api.get(`/matching/results/${jobId}`, { params });
  return res.data;
};

// History
export const getAnalysisHistory = async () => {
  const res = await api.get('/analysis/history');
  return res.data;
};

export const deleteAnalysis = async (analysisId) => {
  const res = await api.delete(`/analysis/${analysisId}`);
  return res.data;
};

export const getExportCsvUrl = (jobId) => `/api/export/csv/${jobId}`;

export default api;
