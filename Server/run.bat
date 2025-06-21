@echo off
echo Activating virtual environment...
call venv\Scripts\activate

echo Running FastAPI server...
uvicorn server:app --reload

pause