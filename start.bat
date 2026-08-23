@echo off
title SafeWay Web Server [sev2]
echo ========================================================
echo   Starting SafeWay Server 2 (sev2)...
echo ========================================================
echo.

REM Open browser after a brief delay
start "" "http://localhost:3001"

REM Run Node server using agy-node
"C:\Users\vaibh\AppData\Roaming\Antigravity\bin\agy-node.cmd" "%~dp0server.js"

pause
