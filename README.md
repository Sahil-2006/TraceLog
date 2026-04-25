# 🎙️ TraceLog

> AI-powered audio transcription platform with role-based access control

TraceLog lets admins upload audio files and get instant AI-generated transcripts powered by Google Gemini. Built with Next.js 16, PostgreSQL, and deployed on Railway.

---

## 🔑 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@tracelog.com` | `admin123` |

> Login at `/login` — only admin can access the dashboard and upload audio files.

---

## ✨ Features

- 🔐 **Authentication** — Secure login/signup with JWT-based sessions
- 👑 **Role-Based Access** — Admin-only dashboard, USER role for regular accounts
- 🎵 **Audio Upload** — Supports MP3, WAV, OGG, M4A (up to 10 MB)
- 🤖 **AI Transcription** — Powered by Google Gemini
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

- Node.js 18+
- PostgreSQL database
- Google Gemini API key

### 1. Clone the repo

```bash
git clone https://github.com/Sahil-2006/TraceLog.git
cd TraceLog
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file:

```env
DATABASE_URL=postgresql://user:password@host:port/railway
BETTER_AUTH_SECRET=your-32-char-secret-here
GEMINI_API_KEY=your-gemini-api-key
NODE_ENV=development
```

Generate a secure secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Push database schema

```bash
npx prisma db push
```

### 5. Create the admin user

```bash
node setup-admin.mjs
```

### 6. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and login with:

- **Email:** `admin@tracelog.com`
- **Password:** `admin123`

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
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `BETTER_AUTH_SECRET` | JWT signing secret (32+ chars) | ✅ |
| `GEMINI_API_KEY` | Google Gemini API key | ✅ |
| `NODE_ENV` | `development` or `production` | ✅ |

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

```bash
git add .
git commit -m "your message"
git push origin main
```

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
BETTER_AUTH_URL=https://your-app.railway.app
GEMINI_API_KEY=your-gemini-key
NODE_ENV=production
```

### 5. Initialize the database

```bash
railway run npx prisma db push
railway run node setup-admin.mjs
```

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