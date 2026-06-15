@echo off
cd /d "%~dp0"
set "NODE_EXE=node"
if exist "%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" set "NODE_EXE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"

if not exist "node_modules\vite\bin\vite.js" (
  echo ERROR: node_modules\vite is missing.
  pause
  exit /b 1
)

powershell -NoProfile -Command "try { $r=Invoke-WebRequest -UseBasicParsing 'http://127.0.0.1:4173' -TimeoutSec 1; if ($r.StatusCode -eq 200) { exit 0 } } catch {}; exit 1" >nul 2>&1
if not errorlevel 1 goto ready

echo Starting Sheng Chronicle...
start "Sheng Chronicle Server" /min "%NODE_EXE%" "node_modules\vite\bin\vite.js" --host 127.0.0.1 --port 4173

for /l %%i in (1,1,15) do (
  powershell -NoProfile -Command "try { $r=Invoke-WebRequest -UseBasicParsing 'http://127.0.0.1:4173' -TimeoutSec 1; if ($r.StatusCode -eq 200) { exit 0 } } catch {}; exit 1" >nul 2>&1
  if not errorlevel 1 goto ready
  timeout /t 1 /nobreak >nul
)

echo ERROR: Local server failed to start on port 4173.
pause
exit /b 1

:ready
start "" "http://127.0.0.1:4173"
echo Ready. The page is open in your browser.
exit /b 0
