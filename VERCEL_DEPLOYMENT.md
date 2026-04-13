# Vercel Deployment Guide

## Prerequisites

1. **GitHub Account** - Connected to Vercel
2. **Firebase Project** - Auth + Firestore configured
3. **Environment Variables** - Firebase values (Auth, Firestore, Storage)

## Deployment Steps

### 1. Create `.env.local` (Development Only)
```bash
# Copy from .env.example and fill with your values
cp .env.example .env.local
```

### 2. Vercel Environment Variables

Go to your Vercel project settings and add these environment variables:

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

**Firebase Storage:**
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` - Firebase storage bucket
- `FIREBASE_STORAGE_BUCKET` - Optional server-side override

### 3. Update Firebase Auth Settings

In Firebase Console:

1. Open **Authentication** → **Settings** → **Authorized domains**
2. Add your Vercel domain, for example:
   - `your-vercel-domain.vercel.app`
3. Make sure Google sign-in is enabled under **Authentication** → **Sign-in method**

### 4. Build Command

The build command is already configured in `package.json`:
```json
"build": "next build"
```

No ORM generation step is required.

### 5. Firestore Readiness

Ensure required Firestore collections and indexes are in place before first production traffic.

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

### Firebase Sign-in Popup Fails
- **Solution:** Add your Vercel domain to Firebase Authorized Domains and verify Google auth is enabled

## Security Checklist

✅ `.env` is in `.gitignore`
✅ `.env.local` is in `.gitignore`
✅ Credentials are only in Vercel environment variables
✅ Firebase authorized domains include your production domain
✅ `FIREBASE_SERVICE_ACCOUNT_KEY` is set only on the server

## Monitoring

- Check Vercel deployment logs: https://vercel.com/dashboard
- View production logs: `vercel logs [project-name]`
- Monitor errors in your application dashboard

## Support Links

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/learn-pages-router/basics/deploying-nextjs-app)
- [Firebase Deployment Guide](https://firebase.google.com/docs)
