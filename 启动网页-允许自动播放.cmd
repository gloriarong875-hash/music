@echo off
setlocal

set "ROOT=%~dp0"
set "URL=file:///%ROOT:\=/%index.html"
set "PROFILE=%TEMP%\jsyz-autoplay-edge-profile"

start "" msedge --user-data-dir="%PROFILE%" --autoplay-policy=no-user-gesture-required "%URL%"
