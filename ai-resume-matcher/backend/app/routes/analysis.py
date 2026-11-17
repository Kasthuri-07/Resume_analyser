import csv
import io
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from datetime import datetime

from app.database import get_db
from app.models.job import JobDescription
from app.models.candidate import Candidate
from app.models.match_result import MatchResult
from app.models.analysis_session import AnalysisSession
from app.schemas import (
    AnalysisSessionResponse,
    DashboardStatsResponse,
    ScoreDistribution,
    TopCandidateItem,
    RecentActivityItem,
    SkillStatItem
)

router = APIRouter(prefix="/api", tags=["Analysis, Dashboard & Reporting"])


@router.get("/analysis/history", response_model=List[AnalysisSessionResponse])
def get_analysis_history(db: Session = Depends(get_db)):
    """Fetch all saved analysis sessions."""
    sessions = db.query(AnalysisSession).order_by(AnalysisSession.created_at.desc()).all()
    output = []
    for s in sessions:
        job = db.query(JobDescription).filter(JobDescription.id == s.job_id).first()
        output.append(AnalysisSessionResponse(
            id=s.id,
            job_id=s.job_id,
            job_title=job.title if job else "Archived Job",
            title=s.title,
            candidate_count=s.candidate_count,
            average_score=s.average_score,
            top_candidate_name=s.top_candidate_name,
            top_score=s.top_score,
            created_at=s.created_at
        ))
    return output


@router.delete("/analysis/{analysis_id}")
def delete_analysis(analysis_id: str, db: Session = Depends(get_db)):
    """Delete an analysis session record."""
    session = db.query(AnalysisSession).filter(AnalysisSession.id == analysis_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Analysis session not found.")
    db.delete(session)
    db.commit()
    return {"message": "Analysis session deleted successfully."}


@router.get("/dashboard/stats", response_model=DashboardStatsResponse)
def get_dashboard_stats(db: Session = Depends(get_db)):
    """
    Generate dynamic dashboard metrics from SQLite database:
    - Total candidates, average score, top candidate, total jobs, high match count
    - Score distribution across 4 standard HR brackets
    - Top 5 ranked candidates
    - Recent analysis activity
    - Skill match statistics
    """
    total_candidates = db.query(Candidate).count()
    total_jobs = db.query(JobDescription).count()

    results = db.query(MatchResult, Candidate, JobDescription).join(
        Candidate, MatchResult.candidate_id == Candidate.id
    ).join(
        JobDescription, MatchResult.job_id == JobDescription.id
    ).all()

    if not results:
        return DashboardStatsResponse(
            total_candidates=total_candidates,
            average_matching_score=0.0,
            top_ranked_candidate=None,
            top_ranked_score=0.0,
            total_jobs=total_jobs,
            high_match_count=0,
            score_distribution=[
                ScoreDistribution(label="85–100% (Excellent)", count=0, percentage=0.0, color="#10B981"),
                ScoreDistribution(label="70–84% (Good)", count=0, percentage=0.0, color="#3B82F6"),
                ScoreDistribution(label="50–69% (Moderate)", count=0, percentage=0.0, color="#F59E0B"),
                ScoreDistribution(label="Below 50% (Low)", count=0, percentage=0.0, color="#EF4444"),
            ],
            top_5_candidates=[],
            recent_activities=[],
            skill_match_statistics=[]
        )

    # Averages and extremes
    all_scores = [r[0].overall_score for r in results]
    avg_score = round(sum(all_scores) / len(all_scores), 1)

    sorted_results = sorted(results, key=lambda x: x[0].overall_score, reverse=True)
    top_result, top_cand, top_job = sorted_results[0]
    top_candidate_name = top_cand.name
    top_score = top_result.overall_score

    # High matching scores count (>= 70)
    high_match_count = sum(1 for s in all_scores if s >= 70.0)

    # Score Distribution
    c_exc = sum(1 for s in all_scores if s >= 85.0)
    c_good = sum(1 for s in all_scores if 70.0 <= s < 85.0)
    c_mod = sum(1 for s in all_scores if 50.0 <= s < 70.0)
    c_low = sum(1 for s in all_scores if s < 50.0)
    total_matches = len(all_scores)

    score_dist = [
        ScoreDistribution(label="85–100% (Excellent)", count=c_exc, percentage=round((c_exc / total_matches) * 100, 1), color="#10B981"),
        ScoreDistribution(label="70–84% (Good)", count=c_good, percentage=round((c_good / total_matches) * 100, 1), color="#3B82F6"),
        ScoreDistribution(label="50–69% (Moderate)", count=c_mod, percentage=round((c_mod / total_matches) * 100, 1), color="#F59E0B"),
        ScoreDistribution(label="Below 50% (Low)", count=c_low, percentage=round((c_low / total_matches) * 100, 1), color="#EF4444"),
    ]

    # Top 5 candidates (unique by candidate)
    seen_cands = set()
    top_5 = []
    rank = 1
    for r, c, j in sorted_results:
        if c.id not in seen_cands:
            seen_cands.add(c.id)
            top_5.append(TopCandidateItem(
                rank=rank,
                candidate_id=c.id,
                name=c.name,
                job_title=j.title,
                score=r.overall_score,
                recommendation=r.recommendation,
                matched_skills_count=len(r.matched_skills or []),
                experience_years=c.total_experience_years
            ))
            rank += 1
            if len(top_5) >= 5:
                break

    # Recent activities
    recent_activities = []
    sessions = db.query(AnalysisSession).order_by(AnalysisSession.created_at.desc()).limit(5).all()
    for s in sessions:
        recent_activities.append(RecentActivityItem(
            id=s.id,
            type="analysis",
            title=f"Completed {s.title}",
            description=f"Evaluated {s.candidate_count} candidates. Top candidate: {s.top_candidate_name or 'N/A'} ({s.top_score}%).",
            timestamp=s.created_at,
            badge="Completed"
        ))

    # Skill match statistics
    skill_counts = {}
    for r, _, _ in results:
        for s in (r.matched_skills or []):
            clean_s = s.split(" [")[0].split(" (")[0]
            skill_counts[clean_s] = skill_counts.get(clean_s, 0) + 1

    sorted_skills = sorted(skill_counts.items(), key=lambda x: x[1], reverse=True)[:8]
    skill_stats = [
        SkillStatItem(
            skill=name,
            match_count=count,
            frequency=round((count / max(1, total_matches)) * 100, 1)
        )
        for name, count in sorted_skills
    ]

    return DashboardStatsResponse(
        total_candidates=total_candidates,
        average_matching_score=avg_score,
        top_ranked_candidate=top_candidate_name,
        top_ranked_score=top_score,
        total_jobs=total_jobs,
        high_match_count=high_match_count,
        score_distribution=score_dist,
        top_5_candidates=top_5,
        recent_activities=recent_activities,
        skill_match_statistics=skill_stats
    )


@router.get("/export/csv/{job_id}")
def export_csv(job_id: int, db: Session = Depends(get_db)):
    """Export ranked candidate list for a job to downloadable CSV."""
    job = db.query(JobDescription).filter(JobDescription.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job description not found.")

    results = db.query(MatchResult, Candidate).join(
        Candidate, MatchResult.candidate_id == Candidate.id
    ).filter(
        MatchResult.job_id == job_id
    ).order_by(MatchResult.overall_score.desc()).all()

    output = io.StringIO()
    writer = csv.writer(output)

    # Header
    writer.writerow([
        "Rank", "Candidate Name", "Email", "Phone", "Total Experience (Years)",
        "Overall Matching Score (%)", "Recommendation",
        "Technical Skill Score (%)", "Semantic Similarity (%)", "Experience Score (%)",
        "Education Score (%)", "Project Relevance (%)",
        "Matched Skills", "Missing Skills", "Related Skills", "Strengths", "Weaknesses"
    ])

    for rank, (res, cand) in enumerate(results, start=1):
        writer.writerow([
            rank,
            cand.name,
            cand.email or "",
            cand.phone or "",
            cand.total_experience_years,
            res.overall_score,
            res.recommendation,
            res.skill_score,
            res.semantic_score,
            res.experience_score,
            res.education_score,
            res.project_score,
            "; ".join(res.matched_skills or []),
            "; ".join(res.missing_skills or []),
            "; ".join([f"{r['candidate_skill']} -> {r['required_skill']}" for r in (res.related_skills or [])]),
            " | ".join(res.strengths or []),
            " | ".join(res.weaknesses or [])
        ])

    output.seek(0)
    filename = f"candidates_ranking_job_{job_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"

    return StreamingResponse(
        io.BytesIO(output.getvalue().encode("utf-8")),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
