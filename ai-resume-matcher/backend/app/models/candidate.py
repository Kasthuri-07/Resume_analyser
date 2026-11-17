from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Float, DateTime, JSON
from sqlalchemy.orm import relationship
from app.database import Base


class Candidate(Base):
    __tablename__ = "candidates"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255), nullable=False)
    file_type = Column(String(50), nullable=False)  # pdf, docx
    raw_text = Column(Text, nullable=False)
    name = Column(String(255), nullable=False, index=True)
    email = Column(String(255), nullable=True)
    phone = Column(String(100), nullable=True)
    education = Column(JSON, default=list)  # list of dicts: {degree, institution, year, details}
    technical_skills = Column(JSON, default=list)  # list of strings
    work_experience = Column(JSON, default=list)  # list of dicts: {role, company, duration, years, description}
    internship_experience = Column(JSON, default=list)  # list of dicts: {role, company, duration, description}
    projects = Column(JSON, default=list)  # list of dicts: {title, technologies, description}
    certifications = Column(JSON, default=list)  # list of strings
    total_experience_years = Column(Float, default=0.0)
    experience_summary = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    match_results = relationship("MatchResult", back_populates="candidate", cascade="all, delete-orphan")
