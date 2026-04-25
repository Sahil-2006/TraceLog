#!/bin/bash

echo "🚀 TraceLog Railway Deployment Script"
echo "======================================"

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

# Check if logged in to Railway
if ! railway whoami &> /dev/null; then
    echo "🔐 Please login to Railway..."
    railway login
fi

# Initialize project if not already done
if [ ! -f "railway.toml" ]; then
    echo "📋 Initializing Railway project..."
    railway init
fi

echo "🔧 Building application..."
npm run build

echo "📦 Deploying to Railway..."
railway deploy

echo "🗄️  Setting up database..."
railway run node deploy-setup.mjs

echo ""
echo "🎉 Deployment completed!"
echo "📋 Next steps:"
echo "   1. Go to Railway Dashboard to get your app URL"
echo "   2. Set environment variables (DATABASE_URL, BETTER_AUTH_SECRET, etc.)"
echo "   3. Login with admin@tracelog.com / admin123"
echo ""
echo "🌐 Access Railway Dashboard: https://railway.app/dashboard"