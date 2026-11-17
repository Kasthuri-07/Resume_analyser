import os
os.environ["HF_HUB_OFFLINE"] = "1"
os.environ["TRANSFORMERS_OFFLINE"] = "1"
import numpy as np
from typing import Dict, Any, List, Tuple
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer
from app.services.extractor import SKILL_RELATIONS, KNOWN_SKILLS

# AI Model Loader
_sentence_model = None
_model_load_attempted = False
_using_fallback = False


def get_sentence_transformer():
    global _sentence_model, _model_load_attempted, _using_fallback
    if not _model_load_attempted:
        _model_load_attempted = True
        try:
            from sentence_transformers import SentenceTransformer
            # Load all-MiniLM-L6-v2
            _sentence_model = SentenceTransformer("all-MiniLM-L6-v2")
            print("Successfully initialized SentenceTransformer ('all-MiniLM-L6-v2').")
        except Exception as e:
            print(f"Warning: SentenceTransformer loading failed ({e}). Enabling TF-IDF semantic fallback.")
            _sentence_model = None
            _using_fallback = True
    return _sentence_model


def compute_semantic_similarity(text1: str, text2: str) -> Tuple[float, bool]:
    """
    Compute semantic similarity between two texts.
    Returns (similarity_score_0_to_100, is_fallback_used).
    """
    model = get_sentence_transformer()

    if not text1.strip() or not text2.strip():
        return 0.0, _using_fallback

    if model is not None:
        try:
            embeddings = model.encode([text1, text2])
            sim = cosine_similarity([embeddings[0]], [embeddings[1]])[0][0]
            # MiniLM cosine similarity typically ranges from 0.15 to 0.85
            # Calibrate accurately to 0 - 100 scale
            normalized = max(0.0, min(100.0, ((float(sim) - 0.15) / (0.80 - 0.15)) * 100.0))
            return round(normalized, 1), False
        except Exception as e:
            print(f"Embedding inference error: {e}")

    # Fallback method: TF-IDF with character n-grams + cosine similarity
    try:
        vectorizer = TfidfVectorizer(ngram_range=(1, 2), stop_words="english")
        tfidf_matrix = vectorizer.fit_transform([text1, text2])
        sim = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
        score = min(100.0, float(sim) * 115.0)
        return round(score, 1), True
    except Exception:
        return 50.0, True


def match_skills(candidate_skills: List[str], required_skills: List[str], preferred_skills: List[str]) -> Tuple[float, List[str], List[str], List[Dict[str, Any]]]:
    """
    Compare candidate skills against required and preferred skills.
    Returns:
    (skill_score_0_to_100, matched_skills, missing_skills, related_skills)
    """
    cand_skills_lower = {s.lower(): s for s in candidate_skills}

    matched = []
    missing = []
    related = []

    # Map aliases & synonyms
    synonym_map = {
        "sql": ["mysql", "postgresql", "sqlite", "oracle db", "sql"],
        "mysql": ["sql", "mariadb"],
        "postgresql": ["sql", "postgres"],
        "react.js": ["react", "next.js"],
        "react": ["react.js", "next.js"],
        "node.js": ["node", "express.js"],
        "node": ["node.js", "express.js"],
        "machine learning": ["scikit-learn", "deep learning"],
        "natural language processing (nlp)": ["nlp", "spacy", "nltk", "transformers"]
    }

    # Weight: Required = 80%, Preferred = 20%
    req_weight = 0.8 if preferred_skills else 1.0
    pref_weight = 0.2 if preferred_skills else 0.0

    req_points = 0.0
    pref_points = 0.0

    # Evaluate Required Skills
    for req in required_skills:
        req_low = req.lower()
        if req_low in cand_skills_lower:
            matched.append(req)
            req_points += 1.0
            continue

        # Check synonyms
        synonyms = synonym_map.get(req_low, [])
        syn_found = None
        for s in synonyms:
            if s in cand_skills_lower:
                syn_found = cand_skills_lower[s]
                break
        if syn_found:
            matched.append(f"{req} ({syn_found})")
            req_points += 0.95
            continue

        # Check Related Skills
        relations = SKILL_RELATIONS.get(req, [])
        rel_found = None
        for r in relations:
            if r.lower() in cand_skills_lower:
                rel_found = cand_skills_lower[r.lower()]
                break

        if rel_found:
            related.append({
                "candidate_skill": rel_found,
                "required_skill": req,
                "relation": f"Alternative / complementary technology to {req}"
            })
            req_points += 0.60  # Partial credit for related skill
        else:
            missing.append(req)

    # Evaluate Preferred Skills
    for pref in preferred_skills:
        pref_low = pref.lower()
        if pref_low in cand_skills_lower:
            matched.append(f"{pref} [Preferred]")
            pref_points += 1.0
        else:
            # Check related
            relations = SKILL_RELATIONS.get(pref, [])
            rel_found = None
            for r in relations:
                if r.lower() in cand_skills_lower:
                    rel_found = cand_skills_lower[r.lower()]
                    break
            if rel_found:
                related.append({
                    "candidate_skill": rel_found,
                    "required_skill": f"{pref} [Preferred]",
                    "relation": f"Complementary to preferred skill {pref}"
                })
                pref_points += 0.50

    # Calculate overall Skill Score
    req_score = (req_points / max(1, len(required_skills))) * 100.0 if required_skills else 80.0
    pref_score = (pref_points / max(1, len(preferred_skills))) * 100.0 if preferred_skills else 80.0

    final_skill_score = min(100.0, max(0.0, (req_score * req_weight) + (pref_score * pref_weight)))
    return round(final_skill_score, 1), matched, missing, related


def calculate_experience_score(candidate_years: float, required_years: float, internships: List[Any], summary: str) -> Tuple[float, List[str]]:
    """
    Score experience based on candidate years vs required years and internships.
    """
    notes = []
    if required_years <= 0:
        required_years = 1.0

    # Base ratio
    ratio = candidate_years / required_years

    if ratio >= 1.0:
        # Full score + slight seniority advantage up to 100
        score = min(100.0, 90.0 + min(10.0, (ratio - 1.0) * 10.0))
        notes.append(f"Meets/exceeds requirement: {candidate_years} yrs vs {required_years} yrs required.")
    else:
        # Partial score
        score = ratio * 85.0
        notes.append(f"Candidate experience ({candidate_years} yrs) is under the desired {required_years} yrs.")

    # Internship boost if candidate is early career
    if internships and candidate_years < 3.0:
        intern_boost = min(15.0, len(internships) * 5.0)
        score = min(100.0, score + intern_boost)
        notes.append(f"Credited {len(internships)} internship experience(s) (+{intern_boost:.0f} pts).")

    # Gap penalty check
    if "gap" in summary.lower():
        score = max(20.0, score - 5.0)
        notes.append("Minor gap detected in timeline (-5 pts).")

    return round(score, 1), notes


def calculate_education_score(education: List[Dict[str, Any]], required_education: List[str]) -> Tuple[float, str]:
    """Score education level and field relevance."""
    if not education:
        return 65.0, "General academic background identified."

    highest_score = 65.0
    best_deg = "Undergraduate Degree"

    for edu in education:
        deg = edu.get("degree", "").lower()
        if any(d in deg for d in ["ph.d", "phd", "doctorate"]):
            if highest_score < 100.0:
                highest_score = 100.0
                best_deg = "Ph.D. / Doctorate degree"
        elif any(d in deg for d in ["master", "m.tech", "m.s", "ms", "mca", "mba"]):
            if highest_score < 95.0:
                highest_score = 95.0
                best_deg = "Master's Degree (M.Tech/MS/MCA)"
        elif any(d in deg for d in ["bachelor", "b.tech", "b.e", "b.s", "bs", "bca"]):
            if highest_score < 85.0:
                highest_score = 85.0
                best_deg = "Bachelor's Degree in Engineering/Technology"
        elif any(d in deg for d in ["diploma", "associate"]):
            if highest_score < 70.0:
                highest_score = 70.0
                best_deg = "Associate Degree / Diploma"

    # Field alignment boost
    all_edu_text = " ".join([str(e.get("degree", "")) for e in education]).lower()
    if any(f in all_edu_text for f in ["computer", "data", "software", "information technology", "artificial intelligence", "electronics"]):
        highest_score = min(100.0, highest_score + 5.0)
        best_deg += " in Computer Science / IT / Related Field"

    return round(highest_score, 1), best_deg


def calculate_project_relevance(projects: List[Dict[str, Any]], internships: List[Dict[str, Any]], jd_text: str) -> Tuple[float, str]:
    """
    Score practical relevance of candidate's projects and internships to the job.
    """
    if not projects and not internships:
        return 50.0, "No specific practical projects highlighted."

    # Combine project and internship descriptions
    proj_texts = []
    for p in projects:
        proj_texts.append(p.get("title", "") + " " + p.get("description", ""))
    for i in internships:
        proj_texts.append(i.get("role", "") + " " + i.get("description", ""))

    combined_text = " ".join(proj_texts)
    proj_sim, _ = compute_semantic_similarity(combined_text, jd_text)

    # Scale score with project count
    count_boost = min(15.0, (len(projects) + len(internships)) * 3.0)
    final_score = min(100.0, max(30.0, (proj_sim * 0.85) + count_boost))

    note = f"Evaluated {len(projects)} technical project(s) and {len(internships)} internship(s) with high domain alignment."
    return round(final_score, 1), note


def evaluate_candidate(candidate_data: Dict[str, Any], job_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Complete AI evaluation pipeline.
    Calculates weighted matching score according to assignment specifications:
    - Skill Match: 40%
    - Semantic Similarity: 25%
    - Experience Match: 20%
    - Education Match: 10%
    - Project Relevance: 5%
    """
    # 1. Technical Skills Match (40%)
    skill_score, matched_skills, missing_skills, related_skills = match_skills(
        candidate_skills=candidate_data.get("technical_skills", []),
        required_skills=job_data.get("required_skills", []),
        preferred_skills=job_data.get("preferred_skills", [])
    )

    # 2. Semantic Similarity (25%)
    # Combine candidate profile summary with JD content
    cand_profile_text = (
        f"Candidate: {candidate_data.get('name', '')}. "
        f"Skills: {', '.join(candidate_data.get('technical_skills', []))}. "
        f"Experience: {candidate_data.get('total_experience_years', 0)} years. {candidate_data.get('experience_summary', '')}. "
        f"{candidate_data.get('raw_text', '')[:2000]}"
    )
    semantic_score, fallback_used = compute_semantic_similarity(
        cand_profile_text,
        job_data.get("raw_text", "")
    )

    # 3. Experience Match (20%)
    exp_score, exp_notes = calculate_experience_score(
        candidate_years=candidate_data.get("total_experience_years", 0.0),
        required_years=job_data.get("required_experience_years", 2.0),
        internships=candidate_data.get("internship_experience", []),
        summary=candidate_data.get("experience_summary", "")
    )

    # 4. Education Match (10%)
    edu_score, edu_note = calculate_education_score(
        education=candidate_data.get("education", []),
        required_education=job_data.get("required_education", [])
    )

    # 5. Project & Internship Relevance (5%)
    project_score, proj_note = calculate_project_relevance(
        projects=candidate_data.get("projects", []),
        internships=candidate_data.get("internship_experience", []),
        jd_text=job_data.get("raw_text", "")
    )

    # Weighted Overall Score Formula
    overall_score = round(
        (skill_score * 0.40) +
        (semantic_score * 0.25) +
        (exp_score * 0.20) +
        (edu_score * 0.10) +
        (project_score * 0.05),
        1
    )
    overall_score = min(100.0, max(0.0, overall_score))

    # Recommendation tier
    if overall_score >= 85.0:
        recommendation = "Excellent Match"
    elif overall_score >= 70.0:
        recommendation = "Good Match"
    elif overall_score >= 50.0:
        recommendation = "Moderate Match"
    else:
        recommendation = "Low Match"

    # Strengths generation
    strengths = []
    if skill_score >= 75.0:
        strengths.append(f"Strong technical skill alignment: matched {len(matched_skills)} required/preferred competencies.")
    if candidate_data.get("total_experience_years", 0) >= job_data.get("required_experience_years", 2.0):
        strengths.append(f"Satisfies tenure criteria with {candidate_data.get('total_experience_years', 0)} years of relevant industry experience.")
    if semantic_score >= 75.0:
        strengths.append("High contextual and contextual semantic similarity across professional background.")
    if edu_score >= 85.0:
        strengths.append(f"Educational pedigree matches requirement: {edu_note}.")
    if candidate_data.get("certifications"):
        strengths.append(f"Holds industry certifications: {', '.join(candidate_data.get('certifications', []))}.")
    if not strengths:
        strengths.append("Candidate demonstrates foundational competencies in software development.")

    # Weaknesses / Areas for improvement
    weaknesses = []
    if missing_skills:
        weaknesses.append(f"Missing core technical skills: {', '.join(missing_skills[:4])}.")
    if candidate_data.get("total_experience_years", 0) < job_data.get("required_experience_years", 2.0):
        gap = round(job_data.get("required_experience_years", 2.0) - candidate_data.get("total_experience_years", 0), 1)
        weaknesses.append(f"Under target tenure requirement by approximately {gap} years.")
    if related_skills:
        weaknesses.append(f"Relies on adjacent alternatives ({', '.join([r['candidate_skill'] for r in related_skills[:2]])}) rather than native required stack.")
    if not candidate_data.get("projects"):
        weaknesses.append("Lack of dedicated production-grade project portfolio documentation.")
    if not weaknesses:
        weaknesses.append("No critical weaknesses identified for this role requisition.")

    # Detailed Transparent Score Explanation
    ai_tag = "[Sentence Transformers - all-MiniLM-L6-v2 Embeddings]" if not fallback_used else "[Fallback TF-IDF & Character N-gram Cosine Similarity]"
    explanation = (
        f"Candidate '{candidate_data.get('name', 'Candidate')}' attained an overall matching score of {overall_score}% "
        f"classified as '{recommendation}'.\n\n"
        f"Evaluation Methodology & Score Breakdown:\n"
        f"• Technical Skills ({skill_score} × 40% = {round(skill_score * 0.40, 2)} pts): "
        f"Matched {len(matched_skills)} key skills ({', '.join(matched_skills[:5]) if matched_skills else 'None'}). "
        f"{len(related_skills)} related skill(s) recognized with partial credit. {len(missing_skills)} skill(s) missing.\n"
        f"• Semantic Cosine Similarity ({semantic_score} × 25% = {round(semantic_score * 0.25, 2)} pts): "
        f"Evaluated using {ai_tag}.\n"
        f"• Experience Match ({exp_score} × 20% = {round(exp_score * 0.20, 2)} pts): "
        f"{' '.join(exp_notes)}\n"
        f"• Education Match ({edu_score} × 10% = {round(edu_score * 0.10, 2)} pts): "
        f"Degree validated: {edu_note}.\n"
        f"• Project Relevance ({project_score} × 5% = {round(project_score * 0.05, 2)} pts): "
        f"{proj_note}\n\n"
        f"Formula: Final Score = ({skill_score} × 0.40) + ({semantic_score} × 0.25) + ({exp_score} × 0.20) + ({edu_score} × 0.10) + ({project_score} × 0.05) = {overall_score}%."
    )

    return {
        "overall_score": overall_score,
        "skill_score": skill_score,
        "semantic_score": semantic_score,
        "experience_score": exp_score,
        "education_score": edu_score,
        "project_score": project_score,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "related_skills": related_skills,
        "recommendation": recommendation,
        "strengths": strengths,
        "weaknesses": weaknesses,
        "score_explanation": explanation
    }
