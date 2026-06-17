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

netstat -ano | findstr /r /c:":8765 .*LISTENING" >nul
if errorlevel 1 (
  start "JSYZ Static" /min cmd.exe /c "cd /d \"%~dp0\" && node scripts\\serve-project-root.cjs"
  timeout /t 2 /nobreak >nul
)

netstat -ano | findstr /r /c:":4173 .*LISTENING" >nul
if errorlevel 1 (
  echo Starting Xun visualization...
  start "Xun Visualization" /min cmd.exe /c "npm.cmd run dev -- --host 127.0.0.1 --port 4173"
  timeout /t 3 /nobreak >nul
)

start "" "http://127.0.0.1:4173/?instrument=xun"
echo Opened Xun visualization.
timeout /t 2 /nobreak >nul
