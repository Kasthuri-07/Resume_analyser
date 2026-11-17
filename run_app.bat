@echo off
title AI Resume Matcher
echo =====================================================================
echo    AI Resume Matcher - Intelligent Candidate Ranking System
echo =====================================================================
echo.

cd /d "%~dp0ai-resume-matcher\backend"

echo [1/3] Activating virtual environment...
set PYTHON_EXE="%~dp0venv\Scripts\python.exe"

if not exist %PYTHON_EXE% (
    echo Error: Python virtual environment not found at %~dp0venv.
    pause
    exit /b
)

echo [2/3] Starting backend + frontend server on http://127.0.0.1:8000 ...
echo.
echo Application will be live at:
echo   --^> Web Dashboard:  http://127.0.0.1:8000
echo   --^> API Swagger Docs: http://127.0.0.1:8000/docs
echo.
echo Opening browser in 3 seconds...
start "" "http://127.0.0.1:8000"

%PYTHON_EXE% -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload

pause
