# Vercel Deployment Guide

## Prerequisites

1. **GitHub Account** - Connected to Vercel
2. **PostgreSQL Database** - (Prisma Postgres recommended)
3. **Firebase Project** - Auth + Firestore configured
4. **Environment Variables** - Firebase, database, and Cloudinary values

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

**Firebase Client:**
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`

**Firebase Server:**
- `FIREBASE_SERVICE_ACCOUNT_KEY` - JSON for Firebase Admin SDK
- `FIREBASE_DATABASE_URL` - Realtime DB URL / project URL used by admin SDK
- `NEXT_PUBLIC_ADMIN_EMAILS` - Optional comma-separated admin allowlist

**Cloudinary (if using image uploads):**
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` - Your Cloudinary account
- `CLOUDINARY_API_KEY` - Your Cloudinary API key
- `CLOUDINARY_API_SECRET` - Your Cloudinary API secret

### 3. Update Firebase Auth Settings

In Firebase Console:

1. Open **Authentication** → **Settings** → **Authorized domains**
2. Add your Vercel domain, for example:
   - `your-vercel-domain.vercel.app`
3. Make sure Google sign-in is enabled under **Authentication** → **Sign-in method**

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

### Firebase Sign-in Popup Fails
- **Solution:** Add your Vercel domain to Firebase Authorized Domains and verify Google auth is enabled

### Database Migrations Failed
- **Solution:** Run `npx prisma migrate deploy` after environment variables are set

## Security Checklist

✅ `.env` is in `.gitignore`
✅ `.env.local` is in `.gitignore`
✅ Credentials are only in Vercel environment variables
✅ Firebase authorized domains include your production domain
✅ `FIREBASE_SERVICE_ACCOUNT_KEY` is set only on the server
✅ Database URL uses SSL connection

## Monitoring

- Check Vercel deployment logs: https://vercel.com/dashboard
- View production logs: `vercel logs [project-name]`
- Monitor errors in your application dashboard

## Support Links

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/learn-pages-router/basics/deploying-nextjs-app)
- [Prisma Deployment](https://www.prisma.io/docs/orm/deploy)
