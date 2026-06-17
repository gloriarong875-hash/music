@echo off
cd /d "%~dp0"

if not exist "node_modules\.bin\vite.cmd" (
  echo Installing project dependencies...
  call npm.cmd install
  if errorlevel 1 pause & exit /b 1
)

netstat -ano | findstr /r /c:":8765 .*LISTENING" >nul
if errorlevel 1 (
  start "JSYZ Static" /min cmd.exe /c "cd /d \"%~dp0\" && node scripts\\serve-project-root.cjs"
  timeout /t 2 /nobreak >nul
)

echo Starting regional schools visualization...
start "Sheng Vite" /min cmd.exe /c npm.cmd run dev -- --host 127.0.0.1 --port 4173
timeout /t 3 /nobreak >nul
start "" "http://127.0.0.1:4173/?instrument=sheng"

echo Opened http://127.0.0.1:4173/?instrument=sheng
timeout /t 2 /nobreak >nul
