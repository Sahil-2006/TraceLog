# 🎙️ TraceLog

> AI-powered audio transcription platform with role-based access control

TraceLog lets admins upload audio files and get instant AI-generated transcripts powered by Google Gemini. Built with Next.js 16, PostgreSQL, and deployed on Railway.

🌐 **Live:** [https://tracelog-production.up.railway.app](https://tracelog-production.up.railway.app)

---

## Local offline demo

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@tracelog.com` | `admin123` |

These credentials work only with `TRACELOG_DEMO_MODE=true` in local development, with no `DATABASE_URL` and outside Vercel. Demo data is in memory and resets when the server restarts. If Gemini is not configured, the app displays a clearly labelled sample that is not derived from the uploaded audio. Before deployment, reset any existing administrator account that may have used these public demo credentials.

---

## ✨ Features

- 🔐 **Authentication** — Secure login/signup with JWT-based sessions
- 👑 **Role-Based Access** — Admin-only dashboard, USER role for regular accounts
- 🎵 **Audio Upload** — Supports MP3, WAV, OGG, M4A (up to 10 MB)
- 🤖 **AI Transcription** — Powered by Google Gemini; local demo mode labels its sample output and never presents it as a transcript of the uploaded file
- 📋 **Transcript History** — Admin can view all transcripts from all users
- 🔍 **Zoom View** — Click any transcript to open it full-screen with a smooth zoom animation
- 🗑️ **Delete** — Remove transcripts with a clean confirmation modal
- 📋 **Copy** — One-click copy with visual feedback

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Database | PostgreSQL (Railway) |
| ORM | Prisma 7 |
| Auth | Custom JWT + bcrypt |
| AI | Google Gemini API |
| Deployment | Railway |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20.9 or newer
- PostgreSQL and a Gemini API key for database-backed transcription; neither is needed for the local offline demo

### 1. Clone the repo

```bash
git clone https://github.com/Sahil-2006/TraceLog.git
cd TraceLog
```

### 2. Install dependencies

```bash
npm ci
```

### 3. Start the local offline demo

Copy the example configuration, then start the app:

```powershell
Copy-Item .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and use the local demo credentials above. The demo has no persistent database and does not transcribe the uploaded audio.

### 4. Run with PostgreSQL and Gemini

Set `TRACELOG_DEMO_MODE=false`, configure a real `DATABASE_URL`, set a unique `BETTER_AUTH_SECRET` of at least 32 characters, and add `GEMINI_API_KEY` for actual transcription. Do not commit these values. Generate an auth secret with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Apply the Prisma schema and create an administrator using credentials supplied only through environment variables:

```bash
npx prisma db push
npm run setup:admin
```

Set `TRACELOG_ADMIN_EMAIL` and a unique `TRACELOG_ADMIN_PASSWORD` (12 or more characters) in the process environment before running the setup command. The bootstrap never prints or resets an existing account's password; promoting an existing account requires `TRACELOG_PROMOTE_EXISTING=true` after verifying its owner.

---

## 📁 Project Structure

```
TraceLog/
├── app/
│   ├── (auth)/
│   │   ├── login/          # Login page
│   │   └── signup/         # Signup page
│   ├── api/
│   │   ├── auth/           # Auth endpoints (signin, signup, signout)
│   │   ├── transcribe/     # Audio transcription endpoint
│   │   └── transcripts/    # Transcript CRUD endpoints
│   └── dashboard/          # Admin dashboard page
├── components/
│   └── DashboardClient.tsx # Main dashboard UI
├── lib/
│   ├── auth.ts             # Auth configuration
│   ├── db.ts               # Prisma database client
│   ├── gemini.ts           # Google Gemini integration
│   ├── rbac.ts             # Role-based access control
│   └── session.ts          # Session management
└── prisma/
    └── schema.prisma       # Database schema
```

---

## 🔑 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Required for database-backed mode |
| `BETTER_AUTH_SECRET` | JWT signing secret (32+ chars) | Required for database-backed mode |
| `GEMINI_API_KEY` | Google Gemini API key | Required for actual transcription |
| `NODE_ENV` | `development` or `production` | Set by the runtime |
| `TRACELOG_DEMO_MODE` | `true` only for local development with no database; must be `false` in deployed environments | Optional |

---

## 🗄️ Database Schema

```prisma
model User {
  id          String       @id @default(cuid())
  email       String       @unique
  name        String?
  password    String?
  role        Role         @default(USER)
  transcripts Transcript[]
}

model Transcript {
  id        String   @id @default(cuid())
  text      String
  fileName  String?
  userId    String
  user      User     @relation(...)
  createdAt DateTime @default(now())
}

enum Role {
  ADMIN
  USER
}
```

---

## 🚢 Deploy to Railway

### 1. Push to GitHub

Commit only reviewed source files and push the release branch selected for deployment. Keep `.env.local` and all production secrets out of Git.

### 2. Connect Railway to GitHub

- Go to [railway.app](https://railway.app)
- Create a new project → Deploy from GitHub repo
- Select `TraceLog`

### 3. Add PostgreSQL

- In your Railway project, click **Add Service** → **Database** → **PostgreSQL**
- Railway will auto-inject `DATABASE_URL` into your app

### 4. Set environment variables

In Railway Dashboard → your service → **Variables**:

```
BETTER_AUTH_SECRET=your-secret
NEXTAUTH_URL=https://your-app.railway.app
GEMINI_API_KEY=your-gemini-key
NODE_ENV=production
```

### 5. Initialize the database

```bash
railway run npx prisma db push
railway run node setup-admin.mjs
```

Set `TRACELOG_ADMIN_EMAIL` and a unique `TRACELOG_ADMIN_PASSWORD` (12 or more characters) in the one-time Railway command environment. The setup command refuses hard-coded defaults, does not print the password, and does not create demo transcripts.

---

## 🔒 Access Control

| Route | Access |
|-------|--------|
| `/` | Public |
| `/login` | Public |
| `/signup` | Public |
| `/dashboard` | Admin only |
| `POST /api/transcribe` | Admin only |
| `GET /api/transcripts` | Admin only |
| `DELETE /api/transcripts/:id` | Admin only |

---

## 📸 Screenshots

### Login Page
> Clean, minimal login form with email/password authentication

### Admin Dashboard
> Upload audio files, view all transcripts, delete with confirmation modal

### Transcript Viewer
> Click any transcript to open it full-screen with a smooth zoom-in animation

---

## 📄 License

MIT — feel free to use and modify.

---

Built with ❤️ by [Sahil](https://github.com/Sahil-2006)
