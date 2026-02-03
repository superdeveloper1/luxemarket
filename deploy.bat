@echo off
REM Manual GitHub Pages Deployment Script for Windows
echo 🚀 Starting manual GitHub Pages deployment...

REM Build the project
echo 📦 Building project...
call npm run build

if %ERRORLEVEL% neq 0 (
    echo ❌ Build failed!
    exit /b 1
)

REM Switch to gh-pages branch
echo 🌿 Switching to gh-pages branch...
git checkout gh-pages

if %ERRORLEVEL% neq 0 (
    echo ❌ Failed to checkout gh-pages branch!
    exit /b 1
)

REM Copy build files
echo 📋 Copying build files...
xcopy /E /I /Y docs\*.* .
rmdir /S /Q docs

REM Add .nojekyll file
echo. > .nojekyll

REM Commit and push
echo 📤 Committing and pushing...
git add .
git commit -m "Manual deployment - %date% %time%"
git push origin gh-pages --force

REM Switch back to main
echo 🔙 Switching back to main branch...
git checkout main

echo ✅ Deployment complete!
echo 🌐 Site should be live at: https://superdeveloper1.github.io/luxemarket/
