# 🚨 Railway Connection String Issue

## Problem
Your `.env.local` has an **internal** Railway domain:
```
DATABASE_URL=postgresql://postgres:...@postgres.railway.internal:5432/railway
```

The `postgres.railway.internal` domain only works **inside Railway's network**, not from your local computer.

## Solution: Get the Public Railway Connection String

### Step 1: Go to Railway Dashboard
- Visit [railway.app/dashboard](https://railway.app/dashboard)
- Click on your TraceLog project
- Click on the PostgreSQL service

### Step 2: Get Public Connection String
1. In the PostgreSQL service details, go to **Connect** tab
2. Look for different connection options:
   - ✅ **Postgres Connection URL** (this should have the public domain)
   - Or look in **Variables** tab for individual parts

3. Find the one with `containers.railway.app` (NOT `postgres.railway.internal`)
4. It should look like:
   ```
   postgresql://postgres:PASSWORD@containers.railway.app:PORT/railway
   ```

### Step 3: Update `.env.local`
Replace your current DATABASE_URL with the public one from Railway

### Step 4: Run Setup
```bash
node prisma/init-db.mjs
```

---

## If You Don't See Public URL in Railway

Railway might show multiple URLs. Try:
1. **Connect** tab - should show several connection options
2. **Variables** tab - shows components to build the URL manually:
   - PGHOST: Should have `containers.railway.app`
   - PGPORT: Usually `5432`
   - PGUSER: `postgres`
   - PGPASSWORD: Your actual password
   - PGDATABASE: `railway`

**Build the URL:**
```
postgresql://[PGUSER]:[PGPASSWORD]@[PGHOST]:[PGPORT]/[PGDATABASE]
```

---

## Quick Test
Once you have the public URL, test it:
```bash
# Replace with your actual URL
$env:DATABASE_URL='postgresql://postgres:password@containers.railway.app:port/railway'
node prisma/init-db.mjs
```

---

**Get your public Railway URL and paste it in `.env.local`, then run the command again!** 🚀
