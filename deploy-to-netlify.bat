@echo off
title Deploy to Netlify
echo ========================================================
echo Deploying MediBook AI to Netlify Live Web...
echo ========================================================
cd /d "%~dp0"
echo.
echo Step 1: Netlify Login (Browser will open to authorize)...
call npx netlify login
echo.
echo Step 2: Deploying to production on Netlify...
call npx netlify deploy --prod
echo.
pause
