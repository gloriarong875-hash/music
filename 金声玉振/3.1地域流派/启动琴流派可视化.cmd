@echo off
cd /d "%~dp0"

if not exist "node_modules\.bin\vite.cmd" (
  echo Installing project dependencies...
  call npm.cmd install
  if errorlevel 1 (
    echo Installation failed. Please install Node.js first.
    pause
    exit /b 1
  )
)

netstat -ano | findstr /r /c:":4173 .*LISTENING" >nul
if errorlevel 1 (
  echo Starting Qin visualization...
  start "Qin Visualization" /min cmd.exe /c "npm.cmd run dev -- --host 127.0.0.1 --port 4173"
  timeout /t 3 /nobreak >nul
)

start "" "http://127.0.0.1:4173/?site=qin"
echo Opened Qin visualization.
timeout /t 2 /nobreak >nul
