# 🚀 Railway Deployment Checklist

## Pre-Deployment Setup

### 1. Install Railway CLI
```bash
npm install -g @railway/cli
```

### 2. Login to Railway
```bash
railway login
```

### 3. Generate Required Secrets
```bash
# Generate BETTER_AUTH_SECRET (copy this output)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Deployment Steps

### 1. Quick Deploy (Windows)
```bash
deploy.bat
```

### 2. Quick Deploy (Mac/Linux)
```bash
chmod +x deploy.sh
./deploy.sh
```

### 3. Manual Deploy
```bash
# Initialize Railway project
railway init

# Deploy the application
railway deploy

# Set up database after deployment
railway run node deploy-setup.mjs
```

## Required Environment Variables

Set these in Railway Dashboard → Your Service → Variables:

- [ ] `DATABASE_URL` - PostgreSQL connection string from Railway
- [ ] `BETTER_AUTH_SECRET` - 32+ character secret (generated above)
- [ ] `BETTER_AUTH_URL` - Your Railway app URL (e.g., https://tracelog-production.railway.app)
- [ ] `GEMINI_API_KEY` - Your Google Gemini API key
- [ ] `NODE_ENV` - Set to `production`

## Post-Deployment Verification

- [ ] App loads at Railway URL
- [ ] Admin login works (admin@tracelog.com / admin123)
- [ ] Dashboard displays properly
- [ ] File upload works
- [ ] Transcription works (requires GEMINI_API_KEY)
- [ ] Delete functionality works
- [ ] View transcript modal works
- [ ] Logout works

## Troubleshooting

### Common Issues:
1. **Build fails** → Check build logs in Railway Dashboard
2. **Database connection fails** → Verify DATABASE_URL is the public Railway URL
3. **Auth doesn't work** → Check BETTER_AUTH_SECRET and BETTER_AUTH_URL
4. **Transcription fails** → Verify GEMINI_API_KEY is valid

### Get Logs:
```bash
railway logs
```

### Access Database:
```bash
railway connect postgres
```

---

## 🎉 Success!

Once deployed, your TraceLog application will be available at:
`https://your-project-name.railway.app`

Login with:
- **Email:** admin@tracelog.com
- **Password:** admin123