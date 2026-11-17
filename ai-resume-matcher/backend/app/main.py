import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.database import Base, engine
from app.routes import jobs, resumes, matching, analysis
from app.services.matcher import get_sentence_transformer

# Initialize database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI Resume Matcher – Intelligent Candidate Ranking System API",
    description="Enterprise HR AI Recruitment & Candidate Ranking Engine powered by Sentence Transformers, spaCy, and Scikit-learn.",
    version="1.0.0"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(jobs.router)
app.include_router(resumes.router)
app.include_router(matching.router)
app.include_router(analysis.router)


@app.on_event("startup")
def startup_event():
    # Warm up SentenceTransformer model asynchronously
    try:
        get_sentence_transformer()
    except Exception as e:
        print(f"Startup model warming warning: {e}")


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "AI Resume Matcher API",
        "version": "1.0.0",
        "ai_model": "all-MiniLM-L6-v2"
    }


# Mount built React frontend if available
frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist"))
if os.path.exists(frontend_dist):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dist, "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        # Don't intercept API routes
        if full_path.startswith("api"):
            return None
        file_path = os.path.join(frontend_dist, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(frontend_dist, "index.html"))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
