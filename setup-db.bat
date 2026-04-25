@echo off
REM TraceLog Database Setup Script (Windows)
REM This script helps you set up your PostgreSQL database for TraceLog

setlocal enabledelayedexpansion

echo.
echo 🚀 TraceLog Database Setup
echo ==========================
echo.

REM Check if .env.local exists
if not exist ".env.local" (
    echo ❌ .env.local not found!
    echo Please create .env.local based on .env.example
    echo.
    echo Read DATABASE_QUICKSTART.md for detailed instructions.
    pause
    exit /b 1
)

REM Check if DATABASE_URL is set
findstr /M "DATABASE_URL=" .env.local >nul
if errorlevel 1 (
    echo ❌ DATABASE_URL not found in .env.local
    echo Please add your PostgreSQL connection string.
    echo.
    echo Read DATABASE_QUICKSTART.md for detailed instructions.
    pause
    exit /b 1
)

REM Extract DATABASE_URL and check if it's a placeholder
for /f "tokens=2 delims==" %%A in ('findstr "DATABASE_URL=" .env.local') do set DB_URL=%%A

if "!DB_URL!"=="postgresql://user:password@host:port/database" (
    echo ❌ DATABASE_URL is still a PLACEHOLDER!
    echo.
    echo You need a real PostgreSQL connection string from Railway.
    echo.
    echo Steps:
    echo   1. Go to https://railway.app
    echo   2. Create a PostgreSQL database
    echo   3. Copy the connection string
    echo   4. Update DATABASE_URL in .env.local
    echo.
    echo Read DATABASE_QUICKSTART.md for detailed step-by-step instructions.
    echo.
    pause
    exit /b 1
)

echo ✅ Found DATABASE_URL in .env.local
echo.
echo 📦 Running Prisma migrations...
echo.

call npx prisma db push

if errorlevel 1 (
    echo.
    echo ❌ Database setup failed!
    echo.
    echo Please check:
    echo   1. DATABASE_URL is correct and copied exactly from Railway
    echo   2. PostgreSQL server is running in Railway
    echo   3. Your internet connection works
    echo.
    echo Read DATABASE_QUICKSTART.md for troubleshooting.
    pause
    exit /b 1
)

echo.
echo 🌱 Creating admin user...
call npm run db:seed

if errorlevel 1 (
    echo.
    echo ❌ Seeding failed!
    echo.
    pause
    exit /b 1
)

echo.
echo ✅ Database setup complete!
echo.
echo 🚀 You can now run: npm run dev
echo.
pause
