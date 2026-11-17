from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime


# Job Schemas
class JobCreate(BaseModel):
    title: str
    company: Optional[str] = "TechCorp Innovations"
    raw_text: str
    required_skills: List[str] = []
    preferred_skills: List[str] = []
    required_experience_years: float = 2.0
    required_education: List[str] = []
    responsibilities: List[str] = []
    tools_and_technologies: List[str] = []


class JobUpdate(BaseModel):
    title: Optional[str] = None
    company: Optional[str] = None
    raw_text: Optional[str] = None
    required_skills: Optional[List[str]] = None
    preferred_skills: Optional[List[str]] = None
    required_experience_years: Optional[float] = None
    required_education: Optional[List[str]] = None
    responsibilities: Optional[List[str]] = None
    tools_and_technologies: Optional[List[str]] = None


class JobResponse(JobCreate):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class JobExtractRequest(BaseModel):
    raw_text: str
    title: Optional[str] = "Software Engineer"


# Candidate Schemas
class CandidateResponse(BaseModel):
    id: int
    filename: str
    file_type: str
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    education: List[Any] = []
    technical_skills: List[str] = []
    work_experience: List[Any] = []
    internship_experience: List[Any] = []
    projects: List[Any] = []
    certifications: List[str] = []
    total_experience_years: float = 0.0
    experience_summary: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class CandidateDetailResponse(CandidateResponse):
    raw_text: str


# Matching Schemas
class MatchingRequest(BaseModel):
    job_id: int
    candidate_ids: Optional[List[int]] = None


class MatchResultResponse(BaseModel):
    id: int
    job_id: int
    candidate_id: int
    candidate_name: str
    candidate_email: Optional[str] = None
    candidate_experience: float
    rank: Optional[int] = None
    overall_score: float
    skill_score: float
    semantic_score: float
    experience_score: float
    education_score: float
    project_score: float
    matched_skills: List[str] = []
    missing_skills: List[str] = []
    related_skills: List[Dict[str, Any]] = []
    recommendation: str
    strengths: List[str] = []
    weaknesses: List[str] = []
    score_explanation: str
    created_at: datetime

    class Config:
        from_attributes = True


# Analysis Session Schemas
class AnalysisSessionResponse(BaseModel):
    id: str
    job_id: int
    job_title: Optional[str] = None
    title: str
    candidate_count: int
    average_score: float
    top_candidate_name: Optional[str] = None
    top_score: float
    created_at: datetime

    class Config:
        from_attributes = True


# Dashboard Schemas
class ScoreDistribution(BaseModel):
    label: str
    count: int
    percentage: float
    color: str


class TopCandidateItem(BaseModel):
    rank: int
    candidate_id: int
    name: str
    job_title: str
    score: float
    recommendation: str
    matched_skills_count: int
    experience_years: float


class RecentActivityItem(BaseModel):
    id: str
    type: str  # 'analysis', 'job_created', 'resume_uploaded'
    title: str
    description: str
    timestamp: datetime
    badge: Optional[str] = None


class SkillStatItem(BaseModel):
    skill: str
    match_count: int
    frequency: float


class DashboardStatsResponse(BaseModel):
    total_candidates: int
    average_matching_score: float
    top_ranked_candidate: Optional[str] = None
    top_ranked_score: float = 0.0
    total_jobs: int
    high_match_count: int
    score_distribution: List[ScoreDistribution]
    top_5_candidates: List[TopCandidateItem]
    recent_activities: List[RecentActivityItem]
    skill_match_statistics: List[SkillStatItem]
