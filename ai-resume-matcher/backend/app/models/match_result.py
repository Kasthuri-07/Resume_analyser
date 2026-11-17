from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Float, DateTime, JSON, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class MatchResult(Base):
    __tablename__ = "match_results"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("job_descriptions.id", ondelete="CASCADE"), nullable=False, index=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id", ondelete="CASCADE"), nullable=False, index=True)
    session_id = Column(String(100), nullable=True, index=True)

    # Component Scores (0 to 100)
    overall_score = Column(Float, nullable=False)
    skill_score = Column(Float, nullable=False)
    semantic_score = Column(Float, nullable=False)
    experience_score = Column(Float, nullable=False)
    education_score = Column(Float, nullable=False)
    project_score = Column(Float, nullable=False)

    # Qualitative Skills & Metrics
    matched_skills = Column(JSON, default=list)  # list of strings
    missing_skills = Column(JSON, default=list)  # list of strings
    related_skills = Column(JSON, default=list)  # list of dicts: {candidate_skill, required_skill, relation}

    # Recommendations & Explanations
    recommendation = Column(String(50), nullable=False)  # Excellent Match, Good Match, Moderate Match, Low Match
    strengths = Column(JSON, default=list)  # list of strings
    weaknesses = Column(JSON, default=list)  # list of strings
    score_explanation = Column(Text, nullable=False)  # Evidence-based breakdown

    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    job = relationship("JobDescription", back_populates="match_results")
    candidate = relationship("Candidate", back_populates="match_results")
