@echo off
title MediBook AI Doctor Appointment System
echo ========================================================
echo Starting MediBook AI local server...
echo ========================================================
cd /d "%~dp0"
timeout /t 2 /nobreak >nul
start http://localhost:3000
npm run dev
