@echo off
echo [SETUP] Setting up the client...

REM Step 1: Check if Python is installed
python --version >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Python is not installed. Please install Python 3.8+ and rerun this script.
    pause
    exit /b
)

REM Step 2: Create virtual environment
python -m venv venv
IF EXIST venv (
    echo [OK] Virtual environment created.
) ELSE (
    echo [ERROR] Failed to create virtual environment.
    pause
    exit /b
)

REM Step 3: Activate and install dependencies
call venv\Scripts\activate
pip install -r requirements.txt

echo [DONE] Installation complete.
echo [INFO] You can now run the app using: run.bat
pause
