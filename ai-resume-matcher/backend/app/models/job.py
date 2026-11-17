from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Float, DateTime, JSON
from sqlalchemy.orm import relationship
from app.database import Base


class JobDescription(Base):
    __tablename__ = "job_descriptions"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    company = Column(String(255), nullable=True, default="TechCorp Innovations")
    raw_text = Column(Text, nullable=False)
    required_skills = Column(JSON, default=list)  # list of strings
    preferred_skills = Column(JSON, default=list)  # list of strings
    required_experience_years = Column(Float, default=2.0)
    required_education = Column(JSON, default=list)  # list of strings
    responsibilities = Column(JSON, default=list)  # list of strings
    tools_and_technologies = Column(JSON, default=list)  # list of strings
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    match_results = relationship("MatchResult", back_populates="job", cascade="all, delete-orphan")
    sessions = relationship("AnalysisSession", back_populates="job", cascade="all, delete-orphan")
