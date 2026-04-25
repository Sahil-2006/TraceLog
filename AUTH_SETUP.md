# Authentication Setup Guide

This guide covers the enhanced authentication system with role-based access control and Google OAuth.

## Features

- ✅ Email/Password authentication
- ✅ Google OAuth integration
- ✅ Role-based access control (ADMIN/USER)
- ✅ Signup and Login pages
- ✅ Protected dashboard (admin-only)

## Setup Instructions

### 1. Database Migration

First, apply the database changes to add roles:

```bash
# Push schema changes to database
npm run db:push

# Or run migration if you prefer
npx prisma migrate dev --name add-roles
```

### 2. Environment Variables

Add these variables to your `.env` file:

```env
# Google OAuth Credentials (get from Google Cloud Console)
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# Better Auth Secret (generate a random 32+ character string)
BETTER_AUTH_SECRET=your_random_secret_key_here_at_least_32_characters
```

### 3. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Set application type to "Web application"
6. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://yourdomain.com/api/auth/callback/google` (production)
7. Copy Client ID and Client Secret to your `.env` file

### 4. Create Admin User

Run the setup script to create the admin user:

```bash
npm run setup:admin
```

This will create an admin user with:
- Email: `admin@tracelog.com`
- Password: `admin123` (change this in production!)
- Role: `ADMIN`

### 5. Test the System

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Visit `http://localhost:3000`
3. You'll be redirected to the login page
4. Try both login methods:
   - Email/Password with admin credentials
   - Google OAuth (if configured)

## User Roles

### ADMIN
- Can access the dashboard
- Can upload and transcribe audio files
- Can view all transcripts

### USER
- Can sign up and log in
- Cannot access dashboard (per assignment requirements)
- Future: Could have limited access to own transcripts

## API Routes

- `POST /api/auth/signin/email` - Email/password login
- `POST /api/auth/signup/email` - Email/password signup
- `GET /api/auth/signin/google` - Google OAuth login
- `POST /api/auth/signout` - Logout

## Security Features

- Password hashing with bcrypt
- Secure session management
- CSRF protection
- Role-based access control
- OAuth integration

## Troubleshooting

### Google OAuth Issues
- Verify redirect URIs match exactly
- Check that Google+ API is enabled
- Ensure credentials are correctly set in environment

### Database Issues
- Run `npx prisma db push` to sync schema
- Check database connection string
- Verify PostgreSQL is running

### Admin Access Issues
- Run `npm run setup:admin` to recreate admin user
- Check user role in database: `SELECT email, role FROM "User";`

## Production Deployment

1. Set production environment variables
2. Update Google OAuth redirect URIs for production domain
3. Change default admin password
4. Enable HTTPS for secure authentication
5. Set `NODE_ENV=production`

## Next Steps

- Implement password reset functionality
- Add email verification
- Create user management interface for admins
- Add audit logging for admin actions