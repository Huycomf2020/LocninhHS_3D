@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Can Node.js de chay LN3d.
  pause
  exit /b 1
)
if not exist dist\index.html (
  echo Chua co ban build. Chay npm ci va npm run build truoc.
  pause
  exit /b 1
)
set "HOST=127.0.0.1"
set "PORT=0"
node server.mjs --open
pause
