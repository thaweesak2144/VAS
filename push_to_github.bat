@echo off
title Push to GitHub - VAS Project

echo ============================================
echo   Backup / Push to GitHub - VAS Project
echo ============================================
echo.

:: Set git path
set PATH=C:\Program Files\Git\cmd;%PATH%

:: Move to project folder
cd /d "c:\Users\ASUS\Desktop\อบรมai\ทำแอป\Vss"

:: Check git status
echo [1] Checking Git status...
git status --short
echo.

:: Get date/time safely
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set DT=%%I
set AUTO_MSG=Auto backup %DT:~0,4%-%DT:~4,2%-%DT:~6,2% %DT:~8,2%:%DT:~10,2%

:: Ask for commit message
set MSG=
set /p MSG="[2] Enter commit message (Press Enter for Auto Date): "

:: Use date/time if no message entered
if "%MSG%"=="" set MSG=%AUTO_MSG%

echo.
echo [3] Adding files...
git add .

echo.
echo [4] Committing: "%MSG%"
git commit -m "%MSG%"

echo.
echo [5] Pushing to GitHub...
git push origin main

echo.
if %ERRORLEVEL%==0 (
    echo ============================================
    echo   SUCCESS! Pushed to GitHub.
    echo   https://github.com/thaweesak2144/VAS
    echo ============================================
) else (
    echo ============================================
    echo   ERROR! Please check the output above.
    echo ============================================
)

echo.
pause
