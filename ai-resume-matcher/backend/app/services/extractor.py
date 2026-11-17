import io
import re
try:
    import pymupdf as fitz
except ImportError:
    import fitz
from docx import Document
from typing import Dict, Any, List, Tuple
from datetime import datetime

# Try loading spaCy model, fallback gracefully if model weights aren't installed yet
try:
    import spacy
    try:
        nlp = spacy.load("en_core_web_sm")
    except Exception:
        nlp = spacy.blank("en")
except Exception:
    nlp = None

# Comprehensive Tech Taxonomy
KNOWN_SKILLS = {
    # Programming Languages
    "python": "Python", "java": "Java", "javascript": "JavaScript", "typescript": "TypeScript",
    "c++": "C++", "c#": "C#", "golang": "Go", "go": "Go", "rust": "Rust", "ruby": "Ruby",
    "php": "PHP", "swift": "Swift", "kotlin": "Kotlin", "scala": "Scala", "r": "R",
    "sql": "SQL", "bash": "Bash/Shell", "shell": "Bash/Shell", "html": "HTML5", "html5": "HTML5",
    "css": "CSS3", "css3": "CSS3", "dart": "Dart",

    # AI / ML / Data Science
    "machine learning": "Machine Learning", "deep learning": "Deep Learning", "nlp": "Natural Language Processing (NLP)",
    "natural language processing": "Natural Language Processing (NLP)", "computer vision": "Computer Vision",
    "pytorch": "PyTorch", "tensorflow": "TensorFlow", "keras": "Keras", "scikit-learn": "Scikit-Learn",
    "sklearn": "Scikit-Learn", "pandas": "Pandas", "numpy": "NumPy", "scipy": "SciPy",
    "huggingface": "Hugging Face", "hugging face": "Hugging Face", "transformers": "Transformers",
    "spacy": "spaCy", "nltk": "NLTK", "opencv": "OpenCV", "llm": "LLMs", "large language models": "LLMs",
    "genai": "Generative AI", "generative ai": "Generative AI", "langchain": "LangChain",
    "llama": "Llama", "sentence-transformers": "Sentence Transformers", "bert": "BERT",

    # Backend Frameworks
    "fastapi": "FastAPI", "flask": "Flask", "django": "Django", "express": "Express.js",
    "express.js": "Express.js", "node": "Node.js", "node.js": "Node.js", "spring boot": "Spring Boot",
    "spring": "Spring Boot", "asp.net": "ASP.NET", ".net": ".NET", "ruby on rails": "Ruby on Rails",
    "rails": "Ruby on Rails", "gin": "Gin", "nest.js": "NestJS", "nestjs": "NestJS",

    # Frontend Frameworks & Libraries
    "react": "React.js", "react.js": "React.js", "next.js": "Next.js", "nextjs": "Next.js",
    "vue": "Vue.js", "vue.js": "Vue.js", "angular": "Angular", "svelte": "Svelte",
    "tailwind": "Tailwind CSS", "tailwind css": "Tailwind CSS", "bootstrap": "Bootstrap",
    "redux": "Redux", "redux toolkit": "Redux Toolkit", "material-ui": "Material-UI", "mui": "Material-UI",

    # Databases & Caching
    "mysql": "MySQL", "postgresql": "PostgreSQL", "postgres": "PostgreSQL", "mongodb": "MongoDB",
    "redis": "Redis", "sqlite": "SQLite", "cassandra": "Cassandra", "elasticsearch": "Elasticsearch",
    "dynamodb": "DynamoDB", "oracle": "Oracle DB", "mariadb": "MariaDB", "firebase": "Firebase",
    "neo4j": "Neo4j", "supabase": "Supabase",

    # Cloud & DevOps
    "aws": "AWS", "amazon web services": "AWS", "azure": "Microsoft Azure", "gcp": "Google Cloud (GCP)",
    "google cloud": "Google Cloud (GCP)", "docker": "Docker", "kubernetes": "Kubernetes", "k8s": "Kubernetes",
    "terraform": "Terraform", "ansible": "Ansible", "jenkins": "Jenkins", "github actions": "GitHub Actions",
    "gitlab ci": "GitLab CI", "ci/cd": "CI/CD", "linux": "Linux", "nginx": "Nginx", "prometheus": "Prometheus",
    "grafana": "Grafana",

    # Big Data & Streaming
    "spark": "Apache Spark", "apache spark": "Apache Spark", "kafka": "Apache Kafka", "apache kafka": "Apache Kafka",
    "hadoop": "Hadoop", "snowflake": "Snowflake", "databricks": "Databricks", "bigquery": "BigQuery",
    "airflow": "Apache Airflow",

    # Tools, Architectures & Methodologies
    "git": "Git", "github": "GitHub", "gitlab": "GitLab", "jira": "Jira", "agile": "Agile",
    "scrum": "Scrum", "rest api": "REST APIs", "restful api": "REST APIs", "rest": "REST APIs",
    "graphql": "GraphQL", "microservices": "Microservices", "system design": "System Design",
    "grpc": "gRPC", "unit testing": "Unit Testing", "pytest": "PyTest", "jest": "Jest"
}

# Related Skills / Taxonomy Mappings
SKILL_RELATIONS = {
    "FastAPI": ["Flask", "Django", "Express.js", "NestJS", "Spring Boot", "REST APIs"],
    "Flask": ["FastAPI", "Django", "Express.js", "Python"],
    "Django": ["FastAPI", "Flask", "Python", "Ruby on Rails"],
    "React.js": ["Next.js", "Vue.js", "Angular", "TypeScript", "JavaScript"],
    "Next.js": ["React.js", "TypeScript", "Node.js"],
    "Vue.js": ["React.js", "Angular", "JavaScript"],
    "Angular": ["React.js", "Vue.js", "TypeScript"],
    "MySQL": ["PostgreSQL", "SQLite", "MariaDB", "Oracle DB", "SQL"],
    "PostgreSQL": ["MySQL", "SQLite", "Oracle DB", "SQL"],
    "MongoDB": ["DynamoDB", "Cassandra", "Redis", "Firebase"],
    "PyTorch": ["TensorFlow", "Keras", "Scikit-Learn", "Deep Learning"],
    "TensorFlow": ["PyTorch", "Keras", "Scikit-Learn", "Deep Learning"],
    "Scikit-Learn": ["Pandas", "NumPy", "Machine Learning", "SciPy"],
    "AWS": ["Google Cloud (GCP)", "Microsoft Azure", "Docker", "Kubernetes"],
    "Microsoft Azure": ["AWS", "Google Cloud (GCP)", "Docker", "Kubernetes"],
    "Google Cloud (GCP)": ["AWS", "Microsoft Azure", "Docker", "Kubernetes"],
    "Docker": ["Kubernetes", "CI/CD", "Linux", "Terraform"],
    "Kubernetes": ["Docker", "Terraform", "AWS", "Microservices"],
    "Natural Language Processing (NLP)": ["spaCy", "NLTK", "Transformers", "BERT", "LLMs"],
    "Large Language Models (LLMs)": ["Transformers", "Hugging Face", "Generative AI", "LangChain", "Natural Language Processing (NLP)"],
    "Generative AI": ["LLMs", "LangChain", "Transformers", "PyTorch"],
    "Apache Spark": ["Hadoop", "Databricks", "Pandas", "BigQuery"],
    "Apache Kafka": ["RabbitMQ", "Microservices", "Redis"],
    "Git": ["GitHub", "GitLab", "CI/CD"]
}


def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extract full raw text from a PDF document using PyMuPDF (fitz) with multi-strategy fallbacks."""
    text_parts = []
    try:
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        for page in doc:
            # Strategy 1: Standard text layout
            page_text = page.get_text("text")
            if page_text and page_text.strip():
                text_parts.append(page_text.strip())
            else:
                # Strategy 2: Blocks layout
                blocks = page.get_text("blocks")
                block_texts = [b[4] for b in blocks if isinstance(b, (list, tuple)) and len(b) > 4 and isinstance(b[4], str) and b[4].strip()]
                if block_texts:
                    text_parts.append("\n".join(block_texts))
                else:
                    # Strategy 3: Words layout
                    words = page.get_text("words")
                    word_texts = [w[4] for w in words if isinstance(w, (list, tuple)) and len(w) > 4 and isinstance(w[4], str)]
                    if word_texts:
                        text_parts.append(" ".join(word_texts))
        doc.close()
    except Exception as e:
        print(f"Error extracting PDF text with PyMuPDF: {e}")

    extracted = "\n".join(text_parts).strip()
    return extracted


def extract_text_from_docx(file_bytes: bytes) -> str:
    """Extract full raw text from a DOCX document using python-docx."""
    text_parts = []
    try:
        doc = Document(io.BytesIO(file_bytes))
        for p in doc.paragraphs:
            if p.text.strip():
                text_parts.append(p.text.strip())
        for table in doc.tables:
            for row in table.rows:
                cells = [cell.text.strip() for cell in row.cells if cell.text.strip()]
                if cells:
                    text_parts.append(" | ".join(cells))
    except Exception as e:
        print(f"Error extracting DOCX text: {e}")
    return "\n".join(text_parts).strip()


def extract_email(text: str) -> str:
    match = re.search(r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+', text)
    return match.group(0) if match else ""


def extract_phone(text: str) -> str:
    # Match standard formats like (123) 456-7890, +1-123-456-7890, 9876543210, etc.
    patterns = [
        r'\+?\d{1,3}[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}',
        r'\b\d{10}\b',
        r'\b\d{3}[-.\s]\d{3}[-.\s]\d{4}\b'
    ]
    for p in patterns:
        m = re.search(p, text)
        if m:
            return m.group(0).strip()
    return ""


def extract_candidate_name(text: str, filename: str = "") -> str:
    lines = [line.strip() for line in text.split("\n") if line.strip()]
    ignore_words = ["resume", "curriculum vitae", "cv", "profile", "contact", "email", "phone", "page"]

    # First check top 5 lines
    for line in lines[:5]:
        lower_line = line.lower()
        if any(ign in lower_line for ign in ignore_words) or "@" in line or any(c.isdigit() for c in line):
            continue
        # Words check: 2 to 4 words usually
        tokens = line.split()
        if 2 <= len(tokens) <= 4 and all(re.match(r'^[A-Za-z\.\'-]+$', t) for t in tokens):
            return line

    # If spaCy NER is available, check for PERSON entities in the first 300 chars
    if nlp:
        try:
            doc = nlp(text[:300])
            for ent in doc.ents:
                if ent.label_ == "PERSON" and 2 <= len(ent.text.split()) <= 4:
                    return ent.text.strip()
        except Exception:
            pass

    # Fallback to filename
    if filename:
        clean_name = re.sub(r'(\.pdf|\.docx|_resume|-resume|resume)', '', filename, flags=re.IGNORECASE)
        clean_name = re.sub(r'[_\-]+', ' ', clean_name).strip()
        if clean_name:
            return clean_name.title()

    return "Candidate"


def extract_skills_from_text(text: str) -> List[str]:
    """Scan text against comprehensive tech taxonomy with word boundaries."""
    found_skills = set()
    lower_text = " " + text.lower() + " "

    for skill_key, normalized_name in KNOWN_SKILLS.items():
        # Handle special characters in regex (e.g. C++, .NET, C#)
        if skill_key in ["c++", "c#", ".net", "r", "go"]:
            escaped = re.escape(skill_key)
            if re.search(rf'(?<![a-zA-Z0-9]){escaped}(?![a-zA-Z0-9])', lower_text):
                found_skills.add(normalized_name)
        else:
            escaped = re.escape(skill_key)
            if re.search(rf'\b{escaped}\b', lower_text):
                found_skills.add(normalized_name)

    return sorted(list(found_skills))


def extract_education_details(text: str) -> List[Dict[str, str]]:
    """Extract degrees, institutions, and graduation years."""
    education_list = []
    edu_keywords = [
        "Ph.D", "PhD", "Doctorate", "Master of Science", "M.Tech", "M.S.", "MS", "MCA", "MBA",
        "Bachelor of Science", "B.Tech", "B.E.", "B.S.", "BS", "BCA", "Bachelor", "Master",
        "Associate Degree", "Diploma"
    ]
    
    lines = text.split("\n")
    edu_section = False
    buffer = []

    for line in lines:
        l_upper = line.strip().upper()
        if any(h in l_upper for h in ["EDUCATION", "ACADEMIC BACKGROUND", "QUALIFICATIONS"]):
            edu_section = True
            continue
        if edu_section and any(h in l_upper for h in ["EXPERIENCE", "PROJECTS", "SKILLS", "CERTIFICATIONS"]):
            edu_section = False
            break
        if edu_section and line.strip():
            buffer.append(line.strip())

    edu_text = "\n".join(buffer) if buffer else text

    for kw in edu_keywords:
        match = re.search(rf'({re.escape(kw)}[^\n,;]*)', edu_text, re.IGNORECASE)
        if match:
            deg_line = match.group(0).strip()
            # Find year nearby
            year_match = re.search(r'\b(19\d{2}|20\d{2})\b', deg_line)
            year = year_match.group(0) if year_match else ""
            education_list.append({
                "degree": deg_line,
                "year": year,
                "institution": "Accredited University / Institution"
            })

    # Deduplicate by degree title prefix
    unique_edu = []
    seen = set()
    for e in education_list:
        norm = e["degree"].split()[0].lower()
        if norm not in seen:
            seen.add(norm)
            unique_edu.append(e)

    if not unique_edu and re.search(r'\b(B\.?Tech|Bachelor|B\.?E|B\.?S|M\.?S|Master)\b', text, re.IGNORECASE):
        unique_edu.append({
            "degree": "Bachelor of Technology / Computer Science or Related",
            "year": "2023",
            "institution": "University Graduate"
        })

    return unique_edu


def calculate_experience_intervals(text: str) -> Tuple[float, List[Dict[str, Any]], str]:
    """
    Extract work experiences, dates, calculate total non-overlapping experience years,
    and detect any gaps.
    """
    experience_list = []
    current_year = datetime.now().year

    # Search for explicit years mention e.g. "3+ years of experience"
    exp_mention = re.search(r'(\d+(?:\.\d+)?)\+?\s*(?:years?|yrs?)(?:\s+of)?\s+experience', text, re.IGNORECASE)
    explicit_years = float(exp_mention.group(1)) if exp_mention else None

    # Parse date intervals e.g. "Jan 2020 - Present", "2019 - 2022", "06/2021 to 08/2023"
    month_names = "jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec"
    date_regex = rf'(?:({month_names})[a-z]*\.?\s*)?(\d{{4}})\s*(?:-|–|—|to)\s*(?:(?:({month_names})[a-z]*\.?\s*)?(\d{{4}})|(present|current|ongoing))'
    
    intervals = []
    lines = text.split("\n")

    for i, line in enumerate(lines):
        matches = list(re.finditer(date_regex, line, re.IGNORECASE))
        for m in matches:
            sm, sy, em, ey, pres = m.groups()
            start_yr = int(sy)
            end_yr = current_year if pres else int(ey) if ey else start_yr

            # Sanity checks for year values
            if 1990 <= start_yr <= current_year + 1 and start_yr <= end_yr <= current_year + 5:
                # Approximate months
                month_map = {"jan": 1, "feb": 2, "mar": 3, "apr": 4, "may": 5, "jun": 6,
                             "jul": 7, "aug": 8, "sep": 9, "oct": 10, "nov": 11, "dec": 12}
                s_month = month_map.get((sm or "").lower()[:3], 1)
                e_month = month_map.get((em or "").lower()[:3], 12) if not pres else 12

                start_val = start_yr + (s_month - 1) / 12.0
                end_val = end_yr + (e_month) / 12.0
                duration_yrs = round(max(0.2, end_val - start_val), 1)

                # Context (role/company) from line or previous line
                role_snippet = line[:m.start()].strip()
                if not role_snippet and i > 0:
                    role_snippet = lines[i - 1].strip()
                if not role_snippet:
                    role_snippet = "Software / Engineering Professional"

                intervals.append((start_val, end_val))
                experience_list.append({
                    "role": role_snippet[:80],
                    "duration": f"{sy} - {ey if not pres else 'Present'}",
                    "years": duration_yrs,
                    "description": line.strip()
                })

    # Merge overlapping intervals to avoid double counting
    if intervals:
        intervals.sort(key=lambda x: x[0])
        merged = [intervals[0]]
        for current in intervals[1:]:
            prev_start, prev_end = merged[-1]
            if current[0] <= prev_end:
                merged[-1] = (prev_start, max(prev_end, current[1]))
            else:
                merged.append(current)

        total_experience = round(sum(end - start for start, end in merged), 1)
    elif explicit_years:
        total_experience = explicit_years
    else:
        # Fallback check for fresher vs experienced keywords
        if re.search(r'\b(fresher|entry level|graduate|intern)\b', text, re.IGNORECASE):
            total_experience = 0.5
        else:
            total_experience = 1.5

    # Check for gaps (> 6 months between merged intervals)
    gap_notes = []
    if len(intervals) > 1:
        for idx in range(len(intervals) - 1):
            gap = intervals[idx + 1][0] - intervals[idx][1]
            if gap > 0.5:
                gap_notes.append(f"Career gap of approx. {round(gap * 12)} months detected between roles.")

    summary = f"Total continuous relevant experience: {total_experience} years. " + " ".join(gap_notes)
    return total_experience, experience_list, summary


def extract_internships_and_projects(text: str) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
    """Parse distinct internships and technical projects."""
    internships = []
    projects = []
    lines = text.split("\n")

    current_section = None
    project_buffer = []

    for line in lines:
        clean = line.strip()
        upper = clean.upper()

        if any(h in upper for h in ["PROJECTS", "KEY PROJECTS", "ACADEMIC PROJECTS", "PERSONAL PROJECTS"]):
            current_section = "PROJECTS"
            continue
        elif any(h in upper for h in ["INTERNSHIP", "INTERNSHIPS"]):
            current_section = "INTERNSHIP"
            continue
        elif any(h in upper for h in ["EDUCATION", "CERTIFICATIONS", "SKILLS", "WORK EXPERIENCE"]):
            current_section = None

        if current_section == "PROJECTS" and clean:
            # Bullet or header line
            if clean.startswith(("-", "•", "*")) or len(clean.split()) <= 6:
                projects.append({
                    "title": clean.lstrip("-•* ").split(" - ")[0][:60],
                    "technologies": [s for s in KNOWN_SKILLS.values() if s.lower() in clean.lower()],
                    "description": clean
                })
        elif current_section == "INTERNSHIP" and clean:
            internships.append({
                "role": clean[:60],
                "duration": "Summer / Winter Term",
                "description": clean
            })

    # If no separate section, scan for intern mentions
    if not internships:
        intern_matches = re.finditer(r'([^\n.]*intern[^\n.]*)', text, re.IGNORECASE)
        for im in intern_matches:
            txt = im.group(0).strip()
            if len(txt) > 10:
                internships.append({
                    "role": txt[:60],
                    "duration": "Internship Program",
                    "description": txt
                })

    return internships[:5], projects[:8]


def extract_certifications(text: str) -> List[str]:
    cert_list = []
    cert_keywords = [
        "AWS Certified", "Azure", "Google Cloud Certified", "PMP", "CKA", "Kubernetes Certified",
        "Deep Learning Specialization", "TensorFlow Developer", "Scrum Master", "Oracle Certified",
        "CompTIA", "CISSP", "Hugging Face"
    ]
    for c in cert_keywords:
        if re.search(rf'\b{re.escape(c)}\b', text, re.IGNORECASE):
            cert_list.append(c)
    return cert_list


def parse_resume_content(raw_text: str, filename: str, file_type: str) -> Dict[str, Any]:
    """Full pipeline for parsing a candidate resume document."""
    name = extract_candidate_name(raw_text, filename)
    email = extract_email(raw_text)
    phone = extract_phone(raw_text)
    skills = extract_skills_from_text(raw_text)
    education = extract_education_details(raw_text)
    total_exp, work_exp, exp_summary = calculate_experience_intervals(raw_text)
    internships, projects = extract_internships_and_projects(raw_text)
    certifications = extract_certifications(raw_text)

    return {
        "filename": filename,
        "file_type": file_type,
        "raw_text": raw_text,
        "name": name,
        "email": email,
        "phone": phone,
        "education": education,
        "technical_skills": skills,
        "work_experience": work_exp,
        "internship_experience": internships,
        "projects": projects,
        "certifications": certifications,
        "total_experience_years": total_exp,
        "experience_summary": exp_summary
    }


def parse_job_description(raw_text: str, title: str = "") -> Dict[str, Any]:
    """Automatically extract structured requirements from a job description."""
    # Skills extraction
    skills = extract_skills_from_text(raw_text)

    # Classify required vs preferred skills
    required_skills = []
    preferred_skills = []

    lines = raw_text.split("\n")
    section = "REQUIRED"
    for line in lines:
        upper = line.upper()
        if any(w in upper for w in ["PREFERRED", "GOOD TO HAVE", "NICE TO HAVE", "BONUS", "PLUS"]):
            section = "PREFERRED"
        elif any(w in upper for w in ["REQUIRED", "MUST HAVE", "QUALIFICATIONS", "REQUIREMENTS"]):
            section = "REQUIRED"

        line_skills = [s for s in skills if s.lower() in line.lower()]
        if section == "PREFERRED":
            for s in line_skills:
                if s not in preferred_skills:
                    preferred_skills.append(s)
        else:
            for s in line_skills:
                if s not in required_skills:
                    required_skills.append(s)

    # If all ended up in one, balance intelligently
    if not required_skills and skills:
        required_skills = skills[:int(len(skills) * 0.75)] or skills
        preferred_skills = [s for s in skills if s not in required_skills]
    elif not preferred_skills and len(required_skills) > 4:
        preferred_skills = required_skills[int(len(required_skills) * 0.7):]
        required_skills = [s for s in required_skills if s not in preferred_skills]

    # Required experience extraction
    exp_match = re.search(r'(\d+(?:\.\d+)?)\+?\s*(?:to\s*\d+\s*)?(?:years?|yrs?)(?:\s+of)?(?:\s+relevant)?\s+experience', raw_text, re.IGNORECASE)
    req_exp = float(exp_match.group(1)) if exp_match else 2.0

    # Education requirements
    req_edu = []
    if re.search(r'\b(bachelor|b\.?tech|b\.?s|b\.?e)\b', raw_text, re.IGNORECASE):
        req_edu.append("Bachelor's Degree in Computer Science, Engineering, or related quantitative field")
    if re.search(r'\b(master|m\.?tech|m\.?s|phd|doctorate)\b', raw_text, re.IGNORECASE):
        req_edu.append("Master's or Ph.D. preferred")
    if not req_edu:
        req_edu.append("Bachelor's Degree in Computer Science or equivalent practical experience")

    # Responsibilities extraction (bullets)
    responsibilities = []
    resp_section = False
    for line in lines:
        upper = line.strip().upper()
        if any(h in upper for h in ["RESPONSIBILITIES", "WHAT YOU'LL DO", "DUTIES", "KEY ACCOUNTABILITIES"]):
            resp_section = True
            continue
        if resp_section and any(h in upper for h in ["REQUIREMENTS", "QUALIFICATIONS", "BENEFITS", "ABOUT US"]):
            resp_section = False
            break
        if resp_section and line.strip().startswith(("-", "•", "*", "1.", "2.", "3.", "4.")):
            responsibilities.append(line.strip().lstrip("-•* 0123456789."))

    if not responsibilities:
        responsibilities = [
            "Architect, build, and maintain production-grade AI and full-stack services.",
            "Collaborate with cross-functional product and engineering teams to deploy scalable features.",
            "Perform code reviews, optimize database queries, and ensure low-latency system reliability."
        ]

    # Job title detection if not supplied
    if not title or title.strip() == "Software Engineer":
        first_line = lines[0].strip() if lines else ""
        if len(first_line.split()) <= 6 and not any(ign in first_line.lower() for ign in ["company", "about", "welcome"]):
            title = first_line
        else:
            title = "Senior Full-Stack & AI Engineer"

    return {
        "title": title,
        "required_skills": required_skills,
        "preferred_skills": preferred_skills,
        "required_experience_years": req_exp,
        "required_education": req_edu,
        "responsibilities": responsibilities[:6],
        "tools_and_technologies": skills
    }
