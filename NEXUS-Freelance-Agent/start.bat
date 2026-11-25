@echo off
REM One-click launcher (Windows). First run creates a virtualenv and installs dependencies.
cd /d "%~dp0"
if not exist .venv (
  py -3 -m venv .venv || python -m venv .venv
  .venv\Scripts\pip install -q -r requirements.txt
)
.venv\Scripts\python -m nexus --open
pause
