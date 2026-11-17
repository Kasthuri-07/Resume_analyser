import os
try:
    import pymupdf as fitz
except ImportError:
    import fitz
from docx import Document
from docx.shared import Pt, Inches, RGBColor

os.makedirs("sample_resumes", exist_ok=True)

# Sample Job Description
SAMPLE_JD = {
    "title": "Senior AI & Full-Stack Engineer",
    "company": "Apex Global AI Solutions",
    "required_experience_years": 3.0,
    "required_skills": [
        "Python", "FastAPI", "Machine Learning", "PyTorch", "Natural Language Processing (NLP)",
        "React.js", "SQL", "Docker"
    ],
    "preferred_skills": [
        "Kubernetes", "AWS", "Transformers", "PostgreSQL", "CI/CD", "Redis"
    ],
    "required_education": [
        "Bachelor's or Master's degree in Computer Science, AI, Engineering, or related technical field"
    ],
    "responsibilities": [
        "Design and scale production-ready AI/NLP services and REST APIs with FastAPI.",
        "Implement modern frontend user interfaces with React and Tailwind CSS.",
        "Fine-tune deep learning and transformer models for enterprise intelligent document processing.",
        "Containerize microservices using Docker and orchestrate on cloud infrastructure.",
        "Collaborate with product managers and architects on high-performance database schema design."
    ],
    "raw_text": """JOB TITLE: Senior AI & Full-Stack Engineer
COMPANY: Apex Global AI Solutions
LOCATION: Remote / Hybrid

ABOUT THE ROLE:
Apex Global AI is looking for an exceptional Senior AI & Full-Stack Engineer to architect intelligent, data-driven applications. You will spearhead the development of our next-generation NLP platforms, combining state-of-the-art machine learning models with resilient microservice backends and responsive frontend interfaces.

KEY RESPONSIBILITIES:
- Design and scale production-ready AI/NLP services and REST APIs with FastAPI.
- Implement modern frontend user interfaces with React and Tailwind CSS.
- Fine-tune deep learning and transformer models for enterprise intelligent document processing.
- Containerize microservices using Docker and orchestrate on cloud infrastructure.
- Collaborate with product managers and architects on high-performance database schema design.
- Optimize model inference latency and ensure high availability across multi-tenant deployments.

REQUIRED QUALIFICATIONS & SKILLS:
- Bachelor's or Master's degree in Computer Science, Data Science, or related quantitative discipline.
- 3+ years of professional software engineering and AI/ML development experience.
- Deep proficiency in Python and modern backend frameworks (FastAPI or Flask).
- Strong foundation in Machine Learning, PyTorch, and Natural Language Processing (NLP).
- Hands-on experience developing web frontends with React.js and modern JavaScript/TypeScript.
- Solid experience with relational databases (SQL, PostgreSQL, MySQL) and database optimization.
- Proficiency in containerization with Docker and standard Git development workflows.

PREFERRED / GOOD TO HAVE:
- Experience with Transformers, Hugging Face, or LLM fine-tuning pipelines.
- Hands-on exposure to cloud deployments on AWS or GCP.
- Familiarity with Kubernetes, Redis caching, and CI/CD pipelines (GitHub Actions).
- Proven track record of delivering end-to-end AI applications into enterprise production."""
}

# 12 Diverse Synthetic Candidates
CANDIDATES = [
    {
        "filename": "Alex_Rivera_AI_FullStack.pdf",
        "format": "pdf",
        "name": "Alex Rivera",
        "email": "alex.rivera.dev@example.com",
        "phone": "+1 (555) 234-5678",
        "summary": "Senior AI & Full-Stack Engineer with 5.5 years of experience building high-throughput machine learning pipelines and reactive web applications. Proficient in Python, FastAPI, PyTorch, Docker, and React.",
        "skills": "Python, FastAPI, PyTorch, Machine Learning, Natural Language Processing (NLP), React.js, PostgreSQL, Docker, AWS, Git, Redis",
        "experience": [
            {
                "role": "Senior AI Engineer",
                "company": "NeuralStack Labs",
                "dates": "Jan 2022 - Present",
                "desc": "Architected low-latency NLP microservices using FastAPI and PyTorch. Containerized services using Docker and deployed on AWS ECS. Reduced inference latency by 42% through quantization."
            },
            {
                "role": "Full-Stack Software Engineer",
                "company": "DataVibe Systems",
                "dates": "Jun 2019 - Dec 2021",
                "desc": "Built responsive dashboard portals using React.js and integrated Python REST APIs. Managed PostgreSQL schema migrations and query indexing for multi-tenant analytical databases."
            }
        ],
        "education": "Master of Science in Computer Science, Stanford University, 2019\nBachelor of Science in Computer Engineering, UC Berkeley, 2017",
        "projects": [
            "DocuMatch AI: Intelligent resume parsing and semantic ranking tool using PyTorch and FastAPI.",
            "LiveMetrics React Portal: Real-time telemetry dashboard in React.js, Tailwind CSS, and WebSockets."
        ],
        "certifications": "AWS Certified Solutions Architect, Deep Learning Specialization (DeepLearning.AI)"
    },
    {
        "filename": "Tariq_Al_Mansoor_Lead_AI.docx",
        "format": "docx",
        "name": "Tariq Al-Mansoor",
        "email": "tariq.almansoor.tech@example.com",
        "phone": "+1 (555) 345-6789",
        "summary": "Lead AI Architect with 8.0 years of industry experience specializing in NLP, Large Language Models, FastAPI backends, and enterprise scalable systems.",
        "skills": "Python, FastAPI, Machine Learning, PyTorch, Natural Language Processing (NLP), Transformers, React.js, SQL, PostgreSQL, Docker, Kubernetes, AWS, Redis, Microservices",
        "experience": [
            {
                "role": "Lead Machine Learning Architect",
                "company": "Cognitive Enterprise Technologies",
                "dates": "Mar 2021 - Present",
                "desc": "Led an 8-person engineering squad building enterprise conversational AI and document intelligence pipelines. Authored high-concurrency FastAPI microservices handling 2M requests/day."
            },
            {
                "role": "Staff Software Engineer",
                "company": "HyperScale Cloud Inc",
                "dates": "Aug 2017 - Feb 2021",
                "desc": "Developed distributed model serving infrastructure on Kubernetes and AWS. Built interactive React.js management console for ML model lifecycle observability."
            }
        ],
        "education": "M.Tech in Artificial Intelligence, Carnegie Mellon University, 2017\nB.Tech in Computer Science, IIT Bombay, 2015",
        "projects": [
            "Enterprise Semantic Search Engine: Built using Transformers, PyTorch, PostgreSQL, and FastAPI.",
            "AutoML Orchestrator: Kubernetes-native distributed model training coordinator."
        ],
        "certifications": "AWS Certified Machine Learning - Specialty, CKA (Certified Kubernetes Administrator)"
    },
    {
        "filename": "Priya_Sharma_ML_Backend.pdf",
        "format": "pdf",
        "name": "Priya Sharma",
        "email": "priya.sharma.ml@example.com",
        "phone": "+1 (555) 456-7890",
        "summary": "Machine Learning & Backend Engineer with 4.0 years of experience. Strong background in Python, Scikit-Learn, NLP, Flask, MySQL, and cloud infrastructure.",
        "skills": "Python, Flask, Scikit-Learn, Machine Learning, Natural Language Processing (NLP), MySQL, SQL, AWS, Git, Docker, REST APIs, Pandas, NumPy",
        "experience": [
            {
                "role": "Machine Learning Engineer",
                "company": "InnoTech Analytics",
                "dates": "Jan 2021 - Present",
                "desc": "Created automated document extraction workflows using spaCy NLP and Scikit-Learn. Engineered robust Python Flask microservices and integrated MySQL relational databases."
            },
            {
                "role": "Associate Software Engineer",
                "company": "CloudWave Solutions",
                "dates": "Jan 2020 - Dec 2020",
                "desc": "Developed RESTful backend endpoints in Python. Assisted in Dockerizing backend services and automating unit testing via PyTest."
            }
        ],
        "education": "Bachelor of Technology in Computer Science, National Institute of Technology, 2019",
        "projects": [
            "Customer Sentiment Analyzer: Scikit-learn and NLTK pipeline processing live customer reviews.",
            "Predictive Sales Engine: Flask and MySQL prediction service with Docker deployment."
        ],
        "certifications": "AWS Certified Developer Associate"
    },
    {
        "filename": "Elena_Rostova_NLP_Specialist.docx",
        "format": "docx",
        "name": "Elena Rostova",
        "email": "elena.rostova.nlp@example.com",
        "phone": "+1 (555) 567-8901",
        "summary": "NLP & Deep Learning Specialist with 4.5 years of industry experience. Ph.D. in Computer Science with focus on transformer architectures, text summarization, and Python engineering.",
        "skills": "Python, PyTorch, Machine Learning, Natural Language Processing (NLP), Transformers, Hugging Face, FastAPI, SQL, Docker, Scikit-Learn, spaCy",
        "experience": [
            {
                "role": "Senior NLP Researcher & Engineer",
                "company": "LinguaAI Labs",
                "dates": "Aug 2021 - Present",
                "desc": "Trained domain-specific transformer models for multilingual legal documents. Deployed inference pipelines on FastAPI backend with Docker and CUDA GPU acceleration."
            },
            {
                "role": "Applied Scientist",
                "company": "Semantic Systems Corp",
                "dates": "Feb 2020 - Jul 2021",
                "desc": "Built semantic similarity search algorithms using BERT embeddings and cosine distance. Published 2 research papers on dense passage retrieval."
            }
        ],
        "education": "Ph.D. in Computer Science (NLP focus), University of Washington, 2020\nB.S. in Mathematics & CS, University of Michigan, 2016",
        "projects": [
            "Neural Query Engine: PyTorch transformer model serving real-time semantic query answering.",
            "Clinical Text Parser: spaCy NER pipeline extracting medical entities with 94% F1-score."
        ],
        "certifications": "TensorFlow Developer Certificate, Hugging Face NLP Specialist"
    },
    {
        "filename": "Marcus_Vance_FullStack_Python.pdf",
        "format": "pdf",
        "name": "Marcus Vance",
        "email": "marcus.vance.dev@example.com",
        "phone": "+1 (555) 678-9012",
        "summary": "Full-Stack Python & React Developer with 3.2 years of professional experience building web platforms, relational database models, and containerized backends.",
        "skills": "Python, Django, React.js, JavaScript, TypeScript, SQL, PostgreSQL, Docker, Git, REST APIs, HTML5, CSS3, Tailwind CSS",
        "experience": [
            {
                "role": "Full-Stack Developer",
                "company": "Vanguard Web Studios",
                "dates": "May 2021 - Present",
                "desc": "Developed modular client dashboards with React.js and Tailwind CSS. Implemented backend REST APIs and asynchronous task processing using Django and PostgreSQL."
            },
            {
                "role": "Junior Backend Developer",
                "company": "Apex Dynamics",
                "dates": "Sep 2020 - Apr 2021",
                "desc": "Maintained relational database queries, implemented JWT authentication, and assisted with Docker container setup."
            }
        ],
        "education": "Bachelor of Science in Software Engineering, Purdue University, 2020",
        "projects": [
            "E-Commerce SaaS Hub: React and Django platform with PostgreSQL and Stripe checkout.",
            "TaskFlow Kanban: Collaborative Kanban board built with React hooks and Python backend."
        ],
        "certifications": "Meta Certified Front-End Developer"
    },
    {
        "filename": "David_Kim_Backend_Dev.docx",
        "format": "docx",
        "name": "David Kim",
        "email": "david.kim.eng@example.com",
        "phone": "+1 (555) 789-0123",
        "summary": "Backend Software Developer with 2.5 years of experience specializing in Python, Flask, MongoDB, and Redis caching. Looking to transition into AI/ML engineering.",
        "skills": "Python, Flask, MongoDB, Redis, SQL, SQLite, Docker, Git, REST APIs, Linux, Unit Testing",
        "experience": [
            {
                "role": "Backend Engineer",
                "company": "Nexis Digital",
                "dates": "Nov 2021 - Present",
                "desc": "Engineered REST APIs with Flask and MongoDB. Integrated Redis caching layers to speed up API response times by 35%. Wrote comprehensive PyTest test suites."
            }
        ],
        "education": "Bachelor of Science in Electrical Engineering, Georgia Tech, 2021",
        "projects": [
            "Microservice Auth Hub: OAuth2 authentication microservice built in Python Flask.",
            "CacheFlow: Redis caching library wrapper for Python microservices."
        ],
        "certifications": "Python Institute Certified Associate Programmer"
    },
    {
        "filename": "Ananya_Patel_Fresher_AI.pdf",
        "format": "pdf",
        "name": "Ananya Patel",
        "email": "ananya.patel.ai@example.com",
        "phone": "+1 (555) 890-1234",
        "summary": "Aspiring AI/ML Engineer and recent Computer Science graduate with 1.2 years of combined academic internship experience in Python, Scikit-Learn, NLP, and FastAPI.",
        "skills": "Python, Machine Learning, Scikit-Learn, Natural Language Processing (NLP), FastAPI, SQL, Pandas, NumPy, HTML5, CSS3, Git",
        "experience": [
            {
                "role": "Machine Learning Engineering Intern",
                "company": "AlphaData Technologies",
                "dates": "Jan 2023 - Jul 2023",
                "desc": "Built text classification pipelines using Scikit-Learn and FastAPI. Preprocessed large tabular datasets using Pandas and NumPy."
            },
            {
                "role": "Software Developer Intern",
                "company": "Zeta Systems",
                "dates": "Jun 2022 - Dec 2022",
                "desc": "Assisted in writing SQL queries and implementing internal data visualization charts with HTML5 and CSS."
            }
        ],
        "education": "Bachelor of Technology in Computer Science, Delhi Technological University, 2023",
        "projects": [
            "Spam Message Detector: NLP classifier utilizing Scikit-learn TF-IDF and FastAPI serving.",
            "Stock Trend Predictor: Time-series forecasting model using Pandas and Matplotlib."
        ],
        "certifications": "Coursera Machine Learning Specialization (DeepLearning.AI)"
    },
    {
        "filename": "Jordan_Lee_Frontend_React.docx",
        "format": "docx",
        "name": "Jordan Lee",
        "email": "jordan.lee.ui@example.com",
        "phone": "+1 (555) 901-2345",
        "summary": "Senior Frontend Developer with 4.0 years of experience building modern React, TypeScript, and Next.js user interfaces with pixel-perfect design standards.",
        "skills": "React.js, Next.js, TypeScript, JavaScript, Tailwind CSS, Redux, HTML5, CSS3, Vue.js, Jest, Git",
        "experience": [
            {
                "role": "Senior Frontend Developer",
                "company": "PixelCraft Studios",
                "dates": "Mar 2021 - Present",
                "desc": "Spearheaded frontend architecture for enterprise SaaS application using React 18, TypeScript, and Tailwind CSS. Implemented Redux Toolkit state management."
            },
            {
                "role": "UI/UX Developer",
                "company": "BlueOcean Media",
                "dates": "Aug 2019 - Feb 2021",
                "desc": "Crafted interactive web landing pages and client dashboards using React.js and CSS modules."
            }
        ],
        "education": "Bachelor of Arts in Digital Media and Interactive Design, NYU, 2019",
        "projects": [
            "DesignSystem UI: Accessible, production-ready React component library with Storybook.",
            "CryptoTracker: Next.js and Tailwind CSS live cryptocurrency portfolio tracker."
        ],
        "certifications": "Certified ScrumMaster (CSM)"
    },
    {
        "filename": "Carlos_Mendoza_DevOps_Cloud.pdf",
        "format": "pdf",
        "name": "Carlos Mendoza",
        "email": "carlos.mendoza.ops@example.com",
        "phone": "+1 (555) 012-3456",
        "summary": "DevOps & Cloud Infrastructure Engineer with 5.0 years of experience specializing in Kubernetes, Docker, AWS, Terraform, and CI/CD pipelines.",
        "skills": "Docker, Kubernetes, AWS, Terraform, Linux, Bash/Shell, CI/CD, GitHub Actions, Jenkins, Nginx, Prometheus, Git",
        "experience": [
            {
                "role": "Senior Cloud Infrastructure Engineer",
                "company": "CloudForge Solutions",
                "dates": "Apr 2020 - Present",
                "desc": "Managed multi-region Kubernetes clusters on AWS EKS using Terraform. Automated end-to-end CI/CD delivery pipelines via GitHub Actions."
            },
            {
                "role": "DevOps Engineer",
                "company": "DataBridge Corp",
                "dates": "Jun 2018 - Mar 2020",
                "desc": "Standardized Docker container images for microservice applications. Monitored server uptime using Prometheus and Grafana."
            }
        ],
        "education": "Bachelor of Science in Information Systems, Texas A&M University, 2018",
        "projects": [
            "Infrastructure as Code Repo: Complete AWS VPC and EKS deployment orchestrated via Terraform.",
            "GitOps Pipeline: ArgoCD continuous delivery pipeline managing 50+ microservices."
        ],
        "certifications": "AWS Certified Solutions Architect Associate, CKA (Certified Kubernetes Administrator)"
    },
    {
        "filename": "Samantha_Brooks_Data_Analyst.docx",
        "format": "docx",
        "name": "Samantha Brooks",
        "email": "samantha.brooks.data@example.com",
        "phone": "+1 (555) 123-7890",
        "summary": "Business Intelligence & Data Analyst with 3.0 years of experience writing advanced SQL queries, building Tableau dashboards, and performing statistical analysis.",
        "skills": "SQL, PostgreSQL, MySQL, Python, Pandas, Tableau, Microsoft Power BI, Excel, Data Warehousing",
        "experience": [
            {
                "role": "Data Analyst",
                "company": "Insight Horizon Corp",
                "dates": "Jul 2021 - Present",
                "desc": "Wrote complex SQL queries to extract KPIs for executive leadership. Built automated business dashboards in Tableau and Power BI. Performed ad-hoc data cleansing using Python and Pandas."
            }
        ],
        "education": "Bachelor of Science in Applied Statistics, Ohio State University, 2021",
        "projects": [
            "Customer Churn Dashboard: Interactive Power BI reporting suite analyzing 100K+ user subscriptions.",
            "SQL Sales Data Mart: Star-schema data warehouse optimized in PostgreSQL."
        ],
        "certifications": "Tableau Desktop Certified Associate, Microsoft Certified: Power BI Data Analyst"
    },
    {
        "filename": "Jessica_Taylor_QA_Automation.pdf",
        "format": "pdf",
        "name": "Jessica Taylor",
        "email": "jessica.taylor.qa@example.com",
        "phone": "+1 (555) 234-8901",
        "summary": "QA Automation Engineer with 2.8 years of experience building Python test frameworks, API validation test suites, and CI/CD automated regression tests.",
        "skills": "Python, PyTest, Selenium, SQL, REST APIs, Git, Jira, CI/CD, Agile, Postman, Linux",
        "experience": [
            {
                "role": "QA Automation Engineer",
                "company": "QualitySoft Solutions",
                "dates": "Sep 2021 - Present",
                "desc": "Developed end-to-end regression test suites in Python and PyTest. Automated REST API validation using Postman and Python requests. Integrated tests into Jenkins pipelines."
            }
        ],
        "education": "Bachelor of Science in Computer Science, Arizona State University, 2021",
        "projects": [
            "PyTest Automation Suite: Distributed automated testing harness executing 500+ daily tests.",
            "API Load Tester: Python testing script benchmarking REST API latency under concurrency."
        ],
        "certifications": "ISTQB Certified Tester Foundation Level"
    },
    {
        "filename": "Liam_OConnor_Java_Backend.docx",
        "format": "docx",
        "name": "Liam O'Connor",
        "email": "liam.oconnor.java@example.com",
        "phone": "+1 (555) 345-9012",
        "summary": "Enterprise Java & Spring Boot Developer with 6.0 years of experience architecting distributed banking microservices, Oracle DB queries, and Apache Kafka messaging.",
        "skills": "Java, Spring Boot, Microservices, Oracle DB, SQL, Apache Kafka, REST APIs, Unit Testing, Docker, Git, Maven",
        "experience": [
            {
                "role": "Senior Java Developer",
                "company": "Global Financial Technologies",
                "dates": "Jan 2020 - Present",
                "desc": "Designed enterprise financial microservices using Spring Boot and Oracle DB. Implemented asynchronous event streaming with Apache Kafka."
            },
            {
                "role": "Java Software Engineer",
                "company": "Apex Enterprise Systems",
                "dates": "Jan 2018 - Dec 2019",
                "desc": "Developed modular REST endpoints in Java Spring. Optimized SQL queries across legacy enterprise databases."
            }
        ],
        "education": "Bachelor of Technology in Information Technology, University College Dublin, 2017",
        "projects": [
            "Payment Gateway Microservice: High-throughput Spring Boot transaction service with Kafka.",
            "Account Management Portal: Enterprise Spring MVC banking web application."
        ],
        "certifications": "Oracle Certified Professional: Java SE 11 Developer"
    }
]


def create_pdf_resume(cand, filepath):
    """Generate a clean, professional PDF resume using PyMuPDF."""
    doc = fitz.open()
    page = doc.new_page(width=595, height=842)  # A4 size

    # Formatting coordinates
    x = 50
    y = 55
    line_h = 14

    # Header / Name
    page.insert_text((x, y), cand["name"], fontsize=18, fontname="helv", color=(0.06, 0.15, 0.35))
    y += 20

    # Contact line
    contact = f"{cand['email']}  |  {cand['phone']}  |  LinkedIn: in/{cand['name'].lower().replace(' ', '')}"
    page.insert_text((x, y), contact, fontsize=9, fontname="helv", color=(0.3, 0.35, 0.4))
    y += 18

    # Separator line
    page.draw_line(fitz.Point(x, y), fitz.Point(545, y), color=(0.8, 0.85, 0.9), width=1)
    y += 18

    # Summary
    page.insert_text((x, y), "PROFESSIONAL SUMMARY", fontsize=11, fontname="helv", color=(0.1, 0.2, 0.4))
    y += 14
    # Wrap summary
    words = cand["summary"].split()
    line = ""
    for w in words:
        if len(line + " " + w) > 85:
            page.insert_text((x, y), line.strip(), fontsize=9, fontname="helv", color=(0.15, 0.15, 0.15))
            y += line_h
            line = w
        else:
            line += " " + w
    if line:
        page.insert_text((x, y), line.strip(), fontsize=9, fontname="helv", color=(0.15, 0.15, 0.15))
        y += 18

    # Technical Skills
    page.insert_text((x, y), "TECHNICAL SKILLS", fontsize=11, fontname="helv", color=(0.1, 0.2, 0.4))
    y += 14
    page.insert_text((x, y), cand["skills"], fontsize=9, fontname="helv", color=(0.15, 0.15, 0.15))
    y += 20

    # Work Experience
    page.insert_text((x, y), "PROFESSIONAL EXPERIENCE", fontsize=11, fontname="helv", color=(0.1, 0.2, 0.4))
    y += 14

    for exp in cand["experience"]:
        header = f"{exp['role']} – {exp['company']} ({exp['dates']})"
        page.insert_text((x, y), header, fontsize=10, fontname="helv", color=(0.05, 0.1, 0.2))
        y += line_h
        desc_words = exp["desc"].split()
        d_line = ""
        for dw in desc_words:
            if len(d_line + " " + dw) > 85:
                page.insert_text((x + 10, y), f"• {d_line.strip()}", fontsize=9, fontname="helv", color=(0.2, 0.2, 0.2))
                y += line_h
                d_line = dw
            else:
                d_line += " " + dw
        if d_line:
            page.insert_text((x + 10, y), f"• {d_line.strip()}", fontsize=9, fontname="helv", color=(0.2, 0.2, 0.2))
            y += 16

    # Education
    page.insert_text((x, y), "EDUCATION", fontsize=11, fontname="helv", color=(0.1, 0.2, 0.4))
    y += 14
    for edu_line in cand["education"].split("\n"):
        page.insert_text((x, y), edu_line, fontsize=9, fontname="helv", color=(0.15, 0.15, 0.15))
        y += line_h
    y += 6

    # Projects
    page.insert_text((x, y), "KEY PROJECTS", fontsize=11, fontname="helv", color=(0.1, 0.2, 0.4))
    y += 14
    for prj in cand.get("projects", []):
        page.insert_text((x + 5, y), f"• {prj}", fontsize=9, fontname="helv", color=(0.2, 0.2, 0.2))
        y += line_h
    y += 6

    # Certifications
    if cand.get("certifications"):
        page.insert_text((x, y), "CERTIFICATIONS", fontsize=11, fontname="helv", color=(0.1, 0.2, 0.4))
        y += 14
        page.insert_text((x, y), cand["certifications"], fontsize=9, fontname="helv", color=(0.15, 0.15, 0.15))

    doc.save(filepath)
    doc.close()


def create_docx_resume(cand, filepath):
    """Generate a clean, structured DOCX resume using python-docx."""
    doc = Document()

    # Title / Name
    title_p = doc.add_paragraph()
    run = title_p.add_run(cand["name"])
    run.font.size = Pt(20)
    run.font.bold = True
    run.font.color.rgb = RGBColor(15, 35, 75)

    # Contact Info
    contact_p = doc.add_paragraph(f"{cand['email']} | {cand['phone']} | LinkedIn: in/{cand['name'].lower().replace(' ', '')}")
    contact_p.runs[0].font.size = Pt(9.5)
    contact_p.runs[0].font.color.rgb = RGBColor(90, 100, 115)

    # Professional Summary
    h1 = doc.add_paragraph()
    r1 = h1.add_run("PROFESSIONAL SUMMARY")
    r1.font.bold = True
    r1.font.size = Pt(12)
    r1.font.color.rgb = RGBColor(25, 55, 110)
    doc.add_paragraph(cand["summary"])

    # Technical Skills
    h2 = doc.add_paragraph()
    r2 = h2.add_run("TECHNICAL SKILLS")
    r2.font.bold = True
    r2.font.size = Pt(12)
    r2.font.color.rgb = RGBColor(25, 55, 110)
    doc.add_paragraph(cand["skills"])

    # Work Experience
    h3 = doc.add_paragraph()
    r3 = h3.add_run("WORK EXPERIENCE")
    r3.font.bold = True
    r3.font.size = Pt(12)
    r3.font.color.rgb = RGBColor(25, 55, 110)

    for exp in cand["experience"]:
        p_role = doc.add_paragraph()
        r_role = p_role.add_run(f"{exp['role']} – {exp['company']} ({exp['dates']})")
        r_role.font.bold = True
        doc.add_paragraph(f"• {exp['desc']}")

    # Education
    h4 = doc.add_paragraph()
    r4 = h4.add_run("EDUCATION")
    r4.font.bold = True
    r4.font.size = Pt(12)
    r4.font.color.rgb = RGBColor(25, 55, 110)
    for edu_line in cand["education"].split("\n"):
        doc.add_paragraph(edu_line)

    # Key Projects
    h5 = doc.add_paragraph()
    r5 = h5.add_run("KEY PROJECTS")
    r5.font.bold = True
    r5.font.size = Pt(12)
    r5.font.color.rgb = RGBColor(25, 55, 110)
    for prj in cand.get("projects", []):
        doc.add_paragraph(f"• {prj}")

    # Certifications
    if cand.get("certifications"):
        h6 = doc.add_paragraph()
        r6 = h6.add_run("CERTIFICATIONS")
        r6.font.bold = True
        r6.font.size = Pt(12)
        r6.font.color.rgb = RGBColor(25, 55, 110)
        doc.add_paragraph(cand["certifications"])

    doc.save(filepath)


if __name__ == "__main__":
    print("Generating 12 synthetic resumes (PDF and DOCX)...")
    for cand in CANDIDATES:
        out_path = os.path.join("sample_resumes", cand["filename"])
        if cand["format"] == "pdf":
            create_pdf_resume(cand, out_path)
            print(f"  [PDF] Created {out_path}")
        else:
            create_docx_resume(cand, out_path)
            print(f"  [DOCX] Created {out_path}")

    # Save sample JD to a file
    import json
    with open("sample_resumes/sample_job_description.json", "w") as f:
        json.dump(SAMPLE_JD, f, indent=2)

    with open("sample_resumes/sample_job_description.txt", "w") as f:
        f.write(SAMPLE_JD["raw_text"])

    print("Sample resumes and Job Description generated successfully!")
