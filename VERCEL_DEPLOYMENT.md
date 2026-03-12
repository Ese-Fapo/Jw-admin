# Vercel Deployment Guide

## Prerequisites

1. **GitHub Account** - Connected to Vercel
2. **PostgreSQL Database** - (Prisma Postgres recommended)
3. **Environment Variables** - All OAuth credentials and database URL

## Deployment Steps

### 1. Create `.env.local` (Development Only)
```bash
# Copy from .env.example and fill with your values
cp .env.example .env.local
```

### 2. Vercel Environment Variables

Go to your Vercel project settings and add these environment variables:

**Database:**
- `DATABASE_URL` - Your PostgreSQL connection string with SSL enabled

**Authentication:**
- `BETTER_AUTH_SECRET` - Generate a random secure string (min 32 characters)
- `BETTER_AUTH_URL` - Leave blank (auto-detects from VERCEL_URL)

**Google OAuth:**
- `GOOGLE_CLIENT_ID` - From Google Cloud Console
- `GOOGLE_CLIENT_SECRET` - From Google Cloud Console

**GitHub OAuth:**
- `GITHUB_CLIENT_ID` - From GitHub Developer Settings
- `GITHUB_CLIENT_SECRET` - From GitHub Developer Settings

**Cloudinary (if using image uploads):**
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` - Your Cloudinary account
- `CLOUDINARY_API_KEY` - Your Cloudinary API key
- `CLOUDINARY_API_SECRET` - Your Cloudinary API secret

### 3. Update OAuth Redirect URIs

**Google OAuth:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your OAuth app
3. Update "Authorized redirect URIs":
   - Add: `https://your-vercel-domain.vercel.app/api/auth/callback/google`

**GitHub OAuth:**
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Edit your OAuth app
3. Update "Authorization callback URL":
   - Set to: `https://your-vercel-domain.vercel.app/api/auth/callback/github`

### 4. Build Command

The build command is already configured in `package.json`:
```json
"build": "prisma generate && next build"
```

This generates Prisma Client before building.

### 5. Prisma Migrations

Run migrations on your production database:

```bash
# Connect to your production database via Vercel CLI
vercel env pull .env.production.local

# Run migrations
npx prisma migrate deploy
```

### 6. Deploy

**Via GitHub:**
1. Push your code to GitHub
2. Vercel automatically deploys on push

**Via Vercel CLI:**
```bash
npm install -g vercel
vercel
```

## Troubleshooting

### Build Fails: "DATABASE_URL not found"
- **Solution:** Check that DATABASE_URL is set in Vercel environment variables

### Authentication Redirects to localhost:3000
- **Solution:** BETTER_AUTH_URL now auto-detects from VERCEL_URL. Make sure it's not explicitly set to localhost in Vercel env vars.

### OAuth Callback Fails
- **Solution:** Update redirect URIs in Google Cloud Console and GitHub Developer Settings to match your Vercel domain

### Database Migrations Failed
- **Solution:** Run `npx prisma migrate deploy` after environment variables are set

## Security Checklist

✅ `.env` is in `.gitignore`
✅ `.env.local` is in `.gitignore`
✅ Credentials are only in Vercel environment variables
✅ All OAuth redirect URIs are HTTPS (Vercel provides this)
✅ `BETTER_AUTH_SECRET` is set to a random secure string
✅ Database URL uses SSL connection

## Monitoring

- Check Vercel deployment logs: https://vercel.com/dashboard
- View production logs: `vercel logs [project-name]`
- Monitor errors in your application dashboard

## Support Links

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/learn-pages-router/basics/deploying-nextjs-app)
- [Prisma Deployment](https://www.prisma.io/docs/orm/deploy)
