@echo off
cd /d "%~dp0"
where py >nul 2>nul
if %errorlevel%==0 (
 py -3 serve.py
 exit /b
)
where python >nul 2>nul
if %errorlevel%==0 (
 python serve.py
 exit /b
)
echo Python 3 is required for PWA installation.
echo You can use Launch_App_Windows.bat without Python.
pause
