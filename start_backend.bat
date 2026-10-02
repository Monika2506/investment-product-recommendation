@echo off
echo ========================================================
echo   INVESTIQ - Starting Backend Flask Server (Port 5000)
echo ========================================================
cd /d "%~dp0"
python backend\run.py
pause
