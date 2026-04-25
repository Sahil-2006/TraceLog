#!/bin/bash
# TraceLog Database Setup Script
# This script helps you set up your PostgreSQL database for TraceLog

set -e

echo ""
echo "🚀 TraceLog Database Setup"
echo "=========================="
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
  echo "❌ .env.local not found!"
  echo "Please create .env.local based on .env.example"
  echo ""
  echo "Read DATABASE_QUICKSTART.md for detailed instructions."
  exit 1
fi

# Check if DATABASE_URL is set
if ! grep -q "DATABASE_URL=" .env.local; then
  echo "❌ DATABASE_URL not found in .env.local"
  echo "Please add your PostgreSQL connection string."
  echo ""
  echo "Read DATABASE_QUICKSTART.md for detailed instructions."
  exit 1
fi

# Extract DATABASE_URL and check if it's a placeholder
DB_URL=$(grep "DATABASE_URL=" .env.local | cut -d '=' -f 2)

if [[ $DB_URL == "postgresql://user:password@host:port/database" ]]; then
  echo "❌ DATABASE_URL is still a PLACEHOLDER!"
  echo ""
  echo "You need a real PostgreSQL connection string from Railway."
  echo ""
  echo "Steps:"
  echo "  1. Go to https://railway.app"
  echo "  2. Create a PostgreSQL database"
  echo "  3. Copy the connection string"
  echo "  4. Update DATABASE_URL in .env.local"
  echo ""
  echo "Read DATABASE_QUICKSTART.md for detailed step-by-step instructions."
  echo ""
  exit 1
fi

echo "✅ Found valid DATABASE_URL in .env.local"
echo ""
echo "📦 Running Prisma db push..."
echo ""

npx prisma db push

if [ $? -ne 0 ]; then
  echo ""
  echo "❌ Database setup failed!"
  echo ""
  echo "Please check:"
  echo "  1. DATABASE_URL is correct and copied exactly from Railway"
  echo "  2. PostgreSQL server is running in Railway"
  echo "  3. Your internet connection works"
  echo ""
  echo "Read DATABASE_QUICKSTART.md for troubleshooting."
  exit 1
fi

echo ""
echo "🌱 Creating admin user..."
npm run db:seed

if [ $? -ne 0 ]; then
  echo ""
  echo "❌ Seeding failed!"
  exit 1
fi

echo ""
echo "✅ Database setup complete!"
echo ""
echo "🚀 You can now run: npm run dev"
echo ""
