from datetime import datetime
import uuid
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class AnalysisSession(Base):
    __tablename__ = "analysis_sessions"

    id = Column(String(50), primary_key=True, default=lambda: str(uuid.uuid4()))
    job_id = Column(Integer, ForeignKey("job_descriptions.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    candidate_count = Column(Integer, default=0)
    average_score = Column(Float, default=0.0)
    top_candidate_name = Column(String(255), nullable=True)
    top_score = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    job = relationship("JobDescription", back_populates="sessions")
