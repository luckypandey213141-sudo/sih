@echo off
title Deploy SafeWay V3 to Vercel
echo ========================================================
echo   SafeWay V3 — Live Vercel Deployment
echo ========================================================
echo.
echo Deploying production build to Vercel...
echo.
call npx vercel --prod
echo.
echo ========================================================
echo   Deployment command finished.
echo ========================================================
pause
