@echo off
cd /d "%~dp0"

if not exist "node_modules\.bin\vite.cmd" (
  echo Installing project dependencies...
  call npm.cmd install
  if errorlevel 1 pause & exit /b 1
)

echo Starting Sheng visualization...
start "Sheng Vite" /min cmd.exe /c npm.cmd run dev -- --host 127.0.0.1 --port 4173
timeout /t 3 /nobreak >nul
start "" "http://127.0.0.1:4173/"

echo Opened http://127.0.0.1:4173/
timeout /t 2 /nobreak >nul
