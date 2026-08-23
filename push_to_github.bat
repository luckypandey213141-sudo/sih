@echo off
title Push SafeWay to GitHub (Repo: sih)
echo ========================================================
echo   SafeWay - Push Source Code to GitHub [Repo: sih]
echo ========================================================
echo.
echo To link your GitHub account and upload the code:
echo 1. Go to https://github.com/settings/tokens
echo 2. Click "Generate new token (classic)"
echo 3. Check the "repo" checkbox and click "Generate token"
echo.
set /p GITHUB_TOKEN="Paste your GitHub Token (ghp_...): "
echo.
echo Connecting to GitHub and uploading repository 'sih'...
echo.
"C:\Users\vaibh\AppData\Roaming\Antigravity\bin\agy-node.cmd" "%~dp0upload_to_github.js" %GITHUB_TOKEN%
echo.
pause
