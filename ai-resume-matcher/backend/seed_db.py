import os
import glob
import json
import uuid
from app.database import Base, engine, SessionLocal
from app.models.job import JobDescription
from app.models.candidate import Candidate
from app.models.match_result import MatchResult
from app.models.analysis_session import AnalysisSession
from app.services.extractor import extract_text_from_pdf, extract_text_from_docx, parse_resume_content
from app.services.matcher import evaluate_candidate, get_sentence_transformer

def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Pre-warm model
    get_sentence_transformer()

    # 1. Check or create Sample Job Description
    with open("sample_resumes/sample_job_description.json") as f:
        job_data = json.load(f)

    job = db.query(JobDescription).filter(JobDescription.title == job_data["title"]).first()
    if not job:
        job = JobDescription(
            title=job_data["title"],
            company=job_data["company"],
            raw_text=job_data["raw_text"],
            required_skills=job_data["required_skills"],
            preferred_skills=job_data["preferred_skills"],
            required_experience_years=job_data["required_experience_years"],
            required_education=job_data["required_education"],
            responsibilities=job_data["responsibilities"],
            tools_and_technologies=job_data["required_skills"] + job_data["preferred_skills"]
        )
        db.add(job)
        db.commit()
        db.refresh(job)
        print(f"Created Job Description: {job.title} (ID: {job.id})")
    else:
        print(f"Existing Job Description found: {job.title} (ID: {job.id})")

    # 2. Parse and insert 12 Synthetic Resumes
    files = glob.glob("sample_resumes/*.*")
    resume_files = [f for f in files if f.endswith((".pdf", ".docx"))]
    print(f"Parsing {len(resume_files)} synthetic resumes...")

    candidates = []
    for filepath in resume_files:
        filename = os.path.basename(filepath)
        ext = filename.split(".")[-1]
        with open(filepath, "rb") as f:
            content = f.read()

        if ext == "pdf":
            raw_text = extract_text_from_pdf(content)
        else:
            raw_text = extract_text_from_docx(content)

        parsed = parse_resume_content(raw_text, filename, ext)

        existing = db.query(Candidate).filter(Candidate.filename == filename).first()
        if not existing:
            cand = Candidate(
                filename=parsed["filename"],
                file_type=parsed["file_type"],
                raw_text=parsed["raw_text"],
                name=parsed["name"],
                email=parsed["email"],
                phone=parsed["phone"],
                education=parsed["education"],
                technical_skills=parsed["technical_skills"],
                work_experience=parsed["work_experience"],
                internship_experience=parsed["internship_experience"],
                projects=parsed["projects"],
                certifications=parsed["certifications"],
                total_experience_years=parsed["total_experience_years"],
                experience_summary=parsed["experience_summary"]
            )
            db.add(cand)
            db.commit()
            db.refresh(cand)
            candidates.append(cand)
        else:
            candidates.append(existing)

    print(f"Total candidates in database: {len(candidates)}")

    # 3. Run Matching Analysis
    session_id = str(uuid.uuid4())
    job_dict = {
        "id": job.id,
        "title": job.title,
        "raw_text": job.raw_text,
        "required_skills": job.required_skills,
        "preferred_skills": job.preferred_skills,
        "required_experience_years": job.required_experience_years,
        "required_education": job.required_education,
        "responsibilities": job.responsibilities,
        "tools_and_technologies": job.tools_and_technologies
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

        eval_out = evaluate_candidate(cand_dict, job_dict)

        existing_res = db.query(MatchResult).filter(
            MatchResult.job_id == job.id,
            MatchResult.candidate_id == cand.id
        ).first()

        if not existing_res:
            res = MatchResult(
                job_id=job.id,
                candidate_id=cand.id,
                session_id=session_id,
                overall_score=eval_out["overall_score"],
                skill_score=eval_out["skill_score"],
                semantic_score=eval_out["semantic_score"],
                experience_score=eval_out["experience_score"],
                education_score=eval_out["education_score"],
                project_score=eval_out["project_score"],
                matched_skills=eval_out["matched_skills"],
                missing_skills=eval_out["missing_skills"],
                related_skills=eval_out["related_skills"],
                recommendation=eval_out["recommendation"],
                strengths=eval_out["strengths"],
                weaknesses=eval_out["weaknesses"],
                score_explanation=eval_out["score_explanation"]
            )
            db.add(res)
            results.append((res, cand))
        else:
            results.append((existing_res, cand))

    db.commit()

    # Session record
    if not db.query(AnalysisSession).first():
        results.sort(key=lambda x: x[0].overall_score, reverse=True)
        top_cand_name = results[0][1].name if results else "None"
        top_sc = results[0][0].overall_score if results else 0.0
        avg_sc = round(sum(r[0].overall_score for r in results) / len(results), 1) if results else 0.0

        sess = AnalysisSession(
            id=session_id,
            job_id=job.id,
            title=f"Analysis: {job.title}",
            candidate_count=len(results),
            average_score=avg_sc,
            top_candidate_name=top_cand_name,
            top_score=top_sc
        )
        db.add(sess)
        db.commit()
        print(f"Created initial AnalysisSession (Average Score: {avg_sc}%, Top: {top_cand_name} - {top_sc}%)")

    db.close()
    print("Database seeding completed successfully!")

if __name__ == "__main__":
    seed()
