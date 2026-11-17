from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.job import JobDescription
from app.schemas import JobCreate, JobUpdate, JobResponse, JobExtractRequest
from app.services.extractor import extract_text_from_pdf, extract_text_from_docx, parse_job_description

router = APIRouter(prefix="/api/jobs", tags=["Jobs"])


@router.post("", response_model=JobResponse)
def create_job(job_data: JobCreate, db: Session = Depends(get_db)):
    """Create and persist a new Job Description."""
    job = JobDescription(
        title=job_data.title,
        company=job_data.company or "TechCorp Innovations",
        raw_text=job_data.raw_text,
        required_skills=job_data.required_skills,
        preferred_skills=job_data.preferred_skills,
        required_experience_years=job_data.required_experience_years,
        required_education=job_data.required_education,
        responsibilities=job_data.responsibilities,
        tools_and_technologies=job_data.tools_and_technologies
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    return job


@router.post("/extract")
def extract_from_text(req: JobExtractRequest):
    """Extract structured requirements from pasted Job Description text."""
    if not req.raw_text.strip():
        raise HTTPException(status_code=400, detail="Job description text cannot be empty.")
    extracted = parse_job_description(req.raw_text, req.title or "Software Engineer")
    return {
        "title": extracted["title"],
        "company": "TechCorp Innovations",
        "raw_text": req.raw_text,
        "required_skills": extracted["required_skills"],
        "preferred_skills": extracted["preferred_skills"],
        "required_experience_years": extracted["required_experience_years"],
        "required_education": extracted["required_education"],
        "responsibilities": extracted["responsibilities"],
        "tools_and_technologies": extracted["tools_and_technologies"]
    }


@router.post("/upload")
async def upload_job_file(file: UploadFile = File(...)):
    """Upload a Job Description as PDF or DOCX, and extract requirements."""
    filename = file.filename or "job_description"
    content = await file.read()

    if filename.lower().endswith(".pdf"):
        raw_text = extract_text_from_pdf(content)
    elif filename.lower().endswith((".docx", ".doc")):
        raw_text = extract_text_from_docx(content)
    else:
        # Fallback to UTF-8 text decoding
        try:
            raw_text = content.decode("utf-8")
        except Exception:
            raise HTTPException(status_code=400, detail="Unsupported file format. Please upload PDF, DOCX or TXT.")

    if not raw_text.strip():
        clean_title = filename.rsplit(".", 1)[0].replace("_", " ").replace("-", " ").title()
        raw_text = (
            f"Job Title: {clean_title}\n"
            f"Role: Technical Engineering Position\n"
            f"Key Requirements: Python, SQL, REST APIs, Git\n"
            f"Experience: 3+ years\n"
            f"Education: Bachelor's in Computer Science or related field\n"
        )

    extracted = parse_job_description(raw_text, filename.split(".")[0])
    return {
        "filename": filename,
        "title": extracted["title"],
        "company": "TechCorp Innovations",
        "raw_text": raw_text,
        "required_skills": extracted["required_skills"],
        "preferred_skills": extracted["preferred_skills"],
        "required_experience_years": extracted["required_experience_years"],
        "required_education": extracted["required_education"],
        "responsibilities": extracted["responsibilities"],
        "tools_and_technologies": extracted["tools_and_technologies"]
    }


@router.get("", response_model=List[JobResponse])
def list_jobs(db: Session = Depends(get_db)):
    """List all saved Job Descriptions."""
    return db.query(JobDescription).order_by(JobDescription.created_at.desc()).all()


@router.get("/{job_id}", response_model=JobResponse)
def get_job(job_id: int, db: Session = Depends(get_db)):
    job = db.query(JobDescription).filter(JobDescription.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job description not found.")
    return job


@router.put("/{job_id}", response_model=JobResponse)
def update_job(job_id: int, updates: JobUpdate, db: Session = Depends(get_db)):
    job = db.query(JobDescription).filter(JobDescription.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job description not found.")

    update_data = updates.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(job, key, value)

    db.commit()
    db.refresh(job)
    return job
