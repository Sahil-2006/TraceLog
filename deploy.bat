@echo off
echo 🚀 TraceLog Railway Deployment Script
echo ======================================

REM Check if Railway CLI is installed
railway --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Railway CLI not found. Installing...
    npm install -g @railway/cli
)

REM Check if logged in to Railway
railway whoami >nul 2>&1
if %errorlevel% neq 0 (
    echo 🔐 Please login to Railway...
    railway login
)

echo 🔧 Building application...
npm run build

echo 📦 Deploying to Railway...
railway deploy

echo 🗄️  Setting up database...
railway run node deploy-setup.mjs

echo.
echo 🎉 Deployment completed!
echo 📋 Next steps:
echo    1. Go to Railway Dashboard to get your app URL
echo    2. Set environment variables (DATABASE_URL, BETTER_AUTH_SECRET, etc.)
echo    3. Login with admin@tracelog.com / admin123
echo.
echo 🌐 Access Railway Dashboard: https://railway.app/dashboard
pause