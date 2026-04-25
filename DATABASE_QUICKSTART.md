# 🚨 Database Connection Setup - Step by Step

## Current Issue

Your `DATABASE_URL` in `.env.local` is still a **placeholder**:
```env
DATABASE_URL=postgresql://user:password@host:port/database
```

This won't work! You need a **real PostgreSQL connection string from Railway**.

---

## ✅ Step 1: Get Railway PostgreSQL Connection String

### 1a. Create Railway Account
- Go to [railway.app](https://railway.app)
- Click **Sign Up** (use GitHub for quick setup)
- Verify your email

### 1b. Create a New PostgreSQL Database
1. In Railway dashboard, click **+ New Project**
2. Click **Provision PostgreSQL**
3. Wait 30-60 seconds for the database to initialize
4. You should see a "PostgreSQL" card in your project

### 1c. Copy Your Connection String

**Option A: From Railway UI (Easiest)**
1. Click on the PostgreSQL service card
2. Go to the **Connect** tab
3. Under "Postgres Connection URL", you'll see your full connection string
4. It looks like:
   ```
   postgresql://postgres:AbCdEf1234@containers.railway.app:5432/railway
   ```
5. **Click the copy button** to copy it exactly

**Option B: From Environment Variables**
1. In the same Railway service, go to **Variables** tab
2. You'll see:
   - `PGHOST`: containers.railway.app
   - `PGPORT`: 5432
   - `PGUSER`: postgres
   - `PGPASSWORD`: random-password-here
   - `PGDATABASE`: railway
3. Combine them: `postgresql://postgres:PASSWORD@HOST:PORT/DBNAME`

---

## ✅ Step 2: Update Your Local .env.local

1. Open `d:\TraceLog\.env.local` in your editor
2. Replace the placeholder DATABASE_URL:

**Before:**
```env
DATABASE_URL=postgresql://user:password@host:port/database
```

**After (example):**
```env
DATABASE_URL=postgresql://postgres:AbCdEf1234567890@containers.railway.app:5432/railway
```

3. Make sure:
   - ✅ You removed `user:password` part
   - ✅ You removed `host:port`
   - ✅ You removed `/database` at the end
   - ✅ You pasted the ENTIRE Railway connection string
   - ✅ No extra spaces

4. **Save the file**

---

## ✅ Step 3: Generate BETTER_AUTH_SECRET

You also need a random secret. Open PowerShell and run:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

This outputs something like: `a1b2c3d4e5f6...`

Copy that and update `.env.local`:
```env
BETTER_AUTH_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

---

## ✅ Step 4: Get Gemini API Key (Optional for Testing)

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click **Get API key**
3. Copy the key
4. Update `.env.local`:
```env
GEMINI_API_KEY=AIzaSyD... (your actual key)
```

If you skip this, you'll get an error when uploading audio. But you can add it later.

---

## ✅ Final .env.local Should Look Like

```env
# PostgreSQL from Railway
DATABASE_URL=postgresql://postgres:yourPasswordHere@containers.railway.app:5432/railway

# Random 32-char secret
BETTER_AUTH_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q

# Google Gemini (optional)
GEMINI_API_KEY=AIzaSyD... (get from Google AI Studio)

# Dev URLs (leave as-is for local testing)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=dev-secret-key-123456789012345
```

---

## ✅ Step 5: Test Database Connection

Once you've updated `.env.local`, run:

```bash
cd d:\TraceLog
npx prisma db push
```

**If successful, you'll see:**
```
✓ Executed successfully
The database has been successfully synchronized with the schema "prisma/schema.prisma".
```

**If it fails, check:**
1. ✅ DATABASE_URL is copied exactly from Railway
2. ✅ No typos or extra spaces
3. ✅ Railway PostgreSQL service is running (green status)
4. ✅ Your internet connection works

---

## ✅ Step 6: Create Admin User

```bash
npm run db:seed
```

**Expected output:**
```
✅ Admin user created successfully!
📧 Email: admin@tracelog.com
🔑 Password: admin123
```

---

## ✅ Step 7: Start Development Server

```bash
npm run dev
```

Visit: **http://localhost:3000/login**

Login with:
- Email: `admin@tracelog.com`
- Password: `admin123`

---

## 🆘 Troubleshooting

### "Error: The datasource.url property is required"
- ✅ Your DATABASE_URL is still a placeholder
- ✅ Copy the **exact** connection string from Railway
- ✅ Update `.env.local` and save
- ✅ Run `npx prisma db push` again

### "connect ECONNREFUSED"
- ✅ DATABASE_URL is incorrect
- ✅ Railway service is not running
- ✅ Check your internet connection

### "permission denied for schema public"
- ✅ Railway permissions issue
- ✅ Create a new PostgreSQL service in Railway
- ✅ Use the new connection string

### "database \"railway\" does not exist"
- ✅ Wrong database name in connection string
- ✅ Should be: `postgresql://user:pass@host:port/railway`
- ✅ Railway defaults to `railway` as database name

---

## ✅ Quick Copy-Paste Template

1. Get your Railway connection string
2. Replace the example in the template below:

```env
DATABASE_URL=PASTE_YOUR_RAILWAY_URL_HERE
BETTER_AUTH_SECRET=GENERATE_WITH_NODE_COMMAND_ABOVE
GEMINI_API_KEY=OPTIONAL_GET_FROM_GOOGLE
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=dev-secret-key-12345678901234567890
```

---

## ⏰ Estimated Time

- Get Railway account: 5 min
- Create PostgreSQL: 2 min
- Copy connection string: 1 min
- Update .env.local: 2 min
- Run migrations: 1 min
- **Total: ~15 minutes**

---

## 📞 Need Help?

- 🚂 [Railway Documentation](https://railway.app/docs)
- 🔐 [Prisma PostgreSQL Setup](https://www.prisma.io/docs/getting-started/setup-prisma/add-to-existing-project/postgresql)
- 🤖 [Google Gemini API](https://ai.google.dev/)

---

**Once you've updated .env.local with your real DATABASE_URL, run:**
```bash
npx prisma db push
npm run db:seed
npm run dev
```

You'll be up and running! 🚀
