import uuid
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.job import JobDescription
from app.models.candidate import Candidate
from app.models.match_result import MatchResult
from app.models.analysis_session import AnalysisSession
from app.schemas import MatchingRequest, MatchResultResponse
from app.services.matcher import evaluate_candidate

router = APIRouter(prefix="/api/matching", tags=["AI Matching & Ranking Engine"])


@router.post("/analyze", response_model=List[MatchResultResponse])
def analyze_resumes(req: MatchingRequest, db: Session = Depends(get_db)):
    """
    Run the AI Matching Engine comparing selected (or all) candidates against a Job Description.
    Applies the 5-component weighted scoring formula:
    (Skill 40% + Semantic 25% + Experience 20% + Education 10% + Project 5%).
    Saves results and creates an analysis session record.
    """
    job = db.query(JobDescription).filter(JobDescription.id == req.job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job description not found.")

    # Candidates selection
    if req.candidate_ids and len(req.candidate_ids) > 0:
        candidates = db.query(Candidate).filter(Candidate.id.in_(req.candidate_ids)).all()
    else:
        candidates = db.query(Candidate).all()

    if not candidates:
        raise HTTPException(status_code=400, detail="No candidates found to evaluate. Please upload resumes first.")

    session_id = str(uuid.uuid4())
    job_dict = {
        "id": job.id,
        "title": job.title,
        "raw_text": job.raw_text,
        "required_skills": job.required_skills or [],
        "preferred_skills": job.preferred_skills or [],
        "required_experience_years": job.required_experience_years or 2.0,
        "required_education": job.required_education or [],
        "responsibilities": job.responsibilities or [],
        "tools_and_technologies": job.tools_and_technologies or []
    }

    results = []

    for cand in candidates:
        cand_dict = {
            "id": cand.id,
            "name": cand.name,
            "email": cand.email,
            "raw_text": cand.raw_text,
            "technical_skills": cand.technical_skills or [],
            "total_experience_years": cand.total_experience_years or 0.0,
            "experience_summary": cand.experience_summary or "",
            "education": cand.education or [],
            "work_experience": cand.work_experience or [],
            "internship_experience": cand.internship_experience or [],
            "projects": cand.projects or [],
            "certifications": cand.certifications or []
        }

        eval_output = evaluate_candidate(cand_dict, job_dict)

        # Check for existing match result for this job & candidate
        existing_result = db.query(MatchResult).filter(
            MatchResult.job_id == job.id,
            MatchResult.candidate_id == cand.id
        ).first()

        if existing_result:
            result_record = existing_result
            result_record.session_id = session_id
            result_record.overall_score = eval_output["overall_score"]
            result_record.skill_score = eval_output["skill_score"]
            result_record.semantic_score = eval_output["semantic_score"]
            result_record.experience_score = eval_output["experience_score"]
            result_record.education_score = eval_output["education_score"]
            result_record.project_score = eval_output["project_score"]
            result_record.matched_skills = eval_output["matched_skills"]
            result_record.missing_skills = eval_output["missing_skills"]
            result_record.related_skills = eval_output["related_skills"]
            result_record.recommendation = eval_output["recommendation"]
            result_record.strengths = eval_output["strengths"]
            result_record.weaknesses = eval_output["weaknesses"]
            result_record.score_explanation = eval_output["score_explanation"]
        else:
            result_record = MatchResult(
                job_id=job.id,
                candidate_id=cand.id,
                session_id=session_id,
                overall_score=eval_output["overall_score"],
                skill_score=eval_output["skill_score"],
                semantic_score=eval_output["semantic_score"],
                experience_score=eval_output["experience_score"],
                education_score=eval_output["education_score"],
                project_score=eval_output["project_score"],
                matched_skills=eval_output["matched_skills"],
                missing_skills=eval_output["missing_skills"],
                related_skills=eval_output["related_skills"],
                recommendation=eval_output["recommendation"],
                strengths=eval_output["strengths"],
                weaknesses=eval_output["weaknesses"],
                score_explanation=eval_output["score_explanation"]
            )
            db.add(result_record)

        results.append((result_record, cand))

    db.commit()

    # Sort results by overall_score descending
    results.sort(key=lambda x: x[0].overall_score, reverse=True)

    # Record analysis session
    top_cand = results[0][1].name if results else "None"
    top_sc = results[0][0].overall_score if results else 0.0
    avg_sc = round(sum(r[0].overall_score for r in results) / len(results), 1) if results else 0.0

    session = AnalysisSession(
        id=session_id,
        job_id=job.id,
        title=f"Analysis: {job.title}",
        candidate_count=len(results),
        average_score=avg_sc,
        top_candidate_name=top_cand,
        top_score=top_sc
    )
    db.add(session)
    db.commit()

    # Form response with ranks
    response_list = []
    for rank, (res, cand) in enumerate(results, start=1):
        db.refresh(res)
        response_list.append(MatchResultResponse(
            id=res.id,
            job_id=res.job_id,
            candidate_id=res.candidate_id,
            candidate_name=cand.name,
            candidate_email=cand.email,
            candidate_experience=cand.total_experience_years,
            rank=rank,
            overall_score=res.overall_score,
            skill_score=res.skill_score,
            semantic_score=res.semantic_score,
            experience_score=res.experience_score,
            education_score=res.education_score,
            project_score=res.project_score,
            matched_skills=res.matched_skills or [],
            missing_skills=res.missing_skills or [],
            related_skills=res.related_skills or [],
            recommendation=res.recommendation,
            strengths=res.strengths or [],
            weaknesses=res.weaknesses or [],
            score_explanation=res.score_explanation,
            created_at=res.created_at
        ))

    return response_list


@router.get("/results/{job_id}", response_model=List[MatchResultResponse])
def get_job_results(
    job_id: int,
    min_score: Optional[float] = Query(None, description="Minimum overall score"),
    recommendation: Optional[str] = Query(None, description="Filter by recommendation category"),
    search: Optional[str] = Query(None, description="Search candidate name or email"),
    sort_by: Optional[str] = Query("overall_score", description="Sort by overall_score, experience, or skill_score"),
    sort_order: Optional[str] = Query("desc", description="desc or asc"),
    skill: Optional[str] = Query(None, description="Filter by matched skill"),
    db: Session = Depends(get_db)
):
    """Retrieve ranked candidate results for a given Job Description with interactive filtering and sorting."""
    query = db.query(MatchResult, Candidate).join(Candidate, MatchResult.candidate_id == Candidate.id).filter(
        MatchResult.job_id == job_id
    )

    if min_score is not None and isinstance(min_score, (int, float)):
        query = query.filter(MatchResult.overall_score >= min_score)

    if recommendation and isinstance(recommendation, str):
        query = query.filter(MatchResult.recommendation == recommendation)

    if search and isinstance(search, str):
        search_filter = f"%{search.lower()}%"
        query = query.filter(
            (Candidate.name.ilike(search_filter)) |
            (Candidate.email.ilike(search_filter))
        )

    records = query.all()

    # Filter by specific skill in python
    if skill and isinstance(skill, str):
        skill_clean = skill.lower()
        records = [
            (res, cand) for res, cand in records
            if any(skill_clean in s.lower() for s in (res.matched_skills or []))
        ]

    # Python sorting
    is_desc = True
    if sort_order and isinstance(sort_order, str):
        is_desc = (sort_order.lower() == "desc")

    s_by = "overall_score"
    if sort_by and isinstance(sort_by, str):
        s_by = sort_by

    if s_by == "experience":
        records.sort(key=lambda x: x[1].total_experience_years or 0.0, reverse=is_desc)
    elif s_by == "skill_score":
        records.sort(key=lambda x: x[0].skill_score, reverse=is_desc)
    else:
        records.sort(key=lambda x: x[0].overall_score, reverse=is_desc)

    response_list = []
    for rank, (res, cand) in enumerate(records, start=1):
        response_list.append(MatchResultResponse(
            id=res.id,
            job_id=res.job_id,
            candidate_id=res.candidate_id,
            candidate_name=cand.name,
            candidate_email=cand.email,
            candidate_experience=cand.total_experience_years,
            rank=rank,
            overall_score=res.overall_score,
            skill_score=res.skill_score,
            semantic_score=res.semantic_score,
            experience_score=res.experience_score,
            education_score=res.education_score,
            project_score=res.project_score,
            matched_skills=res.matched_skills or [],
            missing_skills=res.missing_skills or [],
            related_skills=res.related_skills or [],
            recommendation=res.recommendation,
            strengths=res.strengths or [],
            weaknesses=res.weaknesses or [],
            score_explanation=res.score_explanation,
            created_at=res.created_at
        ))

    return response_list
