# 🚀 Railway Deployment Guide for TraceLog

## Prerequisites
- Railway account (sign up at [railway.app](https://railway.app))
- Git repository with your TraceLog code

## Step 1: Create Railway Project

1. **Login to Railway**
   ```bash
   npm install -g @railway/cli
   railway login
   ```

2. **Initialize Railway Project**
   ```bash
   railway init
   ```

3. **Or deploy from GitHub**
   - Go to [railway.app/new](https://railway.app/new)
   - Connect your GitHub repository
   - Select the TraceLog repository

## Step 2: Add PostgreSQL Database

1. **In Railway Dashboard:**
   - Click "Add Service" → "Database" → "PostgreSQL"
   - Railway will automatically create a PostgreSQL instance

2. **Get Database URL:**
   - Click on the PostgreSQL service
   - Go to "Connect" tab
   - Copy the "Postgres Connection URL"

## Step 3: Set Environment Variables

In Railway Dashboard, go to your app service → Variables tab and add:

```env
# Database
DATABASE_URL=postgresql://postgres:password@host:port/railway

# Authentication (generate secure secrets)
BETTER_AUTH_SECRET=your-super-secret-key-here-32-chars-min
BETTER_AUTH_URL=https://your-app-name.railway.app

# Gemini AI (for transcription)
GEMINI_API_KEY=your-gemini-api-key

# Node Environment
NODE_ENV=production
```

### Generate Secure Secrets:
```bash
# Generate BETTER_AUTH_SECRET (32+ characters)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Step 4: Deploy

### Option A: Automatic Deployment (GitHub)
- Push your code to GitHub
- Railway will automatically deploy on every push

### Option B: CLI Deployment
```bash
railway deploy
```

## Step 5: Initialize Database

After deployment, run the setup script:

```bash
railway run node deploy-setup.mjs
```

Or in Railway Dashboard:
- Go to your service → Deployments
- Click on latest deployment → View Logs
- The setup should run automatically after build

## Step 6: Access Your Application

1. **Get your Railway URL:**
   - In Railway Dashboard → Your service → Settings → Domains
   - Copy the generated URL (e.g., `https://tracelog-production.railway.app`)

2. **Login as Admin:**
   - Email: `admin@tracelog.com`
   - Password: `admin123`

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:...@containers.railway.app:5432/railway` |
| `BETTER_AUTH_SECRET` | Secret for JWT tokens (32+ chars) | `a1b2c3d4e5f6...` |
| `BETTER_AUTH_URL` | Your app's public URL | `https://your-app.railway.app` |
| `GEMINI_API_KEY` | Google Gemini API key | `AIza...` |
| `NODE_ENV` | Environment | `production` |

## Troubleshooting

### Database Connection Issues
- Ensure `DATABASE_URL` uses the **public** Railway URL (not `postgres.railway.internal`)
- Check that PostgreSQL service is running

### Build Failures
- Check build logs in Railway Dashboard
- Ensure all dependencies are in `package.json`
- Verify environment variables are set

### Authentication Issues
- Verify `BETTER_AUTH_SECRET` is set and 32+ characters
- Check `BETTER_AUTH_URL` matches your Railway domain

### Transcription Not Working
- Verify `GEMINI_API_KEY` is valid
- Check API quota and billing in Google Cloud Console

## Post-Deployment

1. **Test the application:**
   - Login as admin
   - Upload a sample audio file
   - Verify transcription works
   - Test delete functionality

2. **Monitor logs:**
   ```bash
   railway logs
   ```

3. **Scale if needed:**
   - Railway automatically scales based on usage
   - Monitor performance in Railway Dashboard

## Custom Domain (Optional)

1. In Railway Dashboard → Your service → Settings → Domains
2. Click "Custom Domain"
3. Add your domain and configure DNS

---

🎉 **Your TraceLog application is now live on Railway!**

Access it at your Railway URL and start transcribing audio files with AI-powered accuracy.