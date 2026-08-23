@echo off
title SafeWay Web Server
echo ========================================================
echo   Starting SafeWay Local Server...
echo ========================================================
echo.

REM Open browser after a brief delay
start "" "http://localhost:3000"

REM Run Node server
node "%~dp0local_server.js"

pause
