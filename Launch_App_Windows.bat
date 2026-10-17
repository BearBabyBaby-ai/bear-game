@echo off
setlocal
set "BEAR_APP_URL=file:///%~dp0index.html"
if exist "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" (
 start "" "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" --app="%BEAR_APP_URL%"
 exit /b
)
if exist "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" (
 start "" "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" --app="%BEAR_APP_URL%"
 exit /b
)
if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" (
 start "" "%ProgramFiles%\Google\Chrome\Application\chrome.exe" --app="%BEAR_APP_URL%"
 exit /b
)
start "" "%~dp0index.html"
