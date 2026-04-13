# Vercel Deployment Checklist ✓

## Pre-Deployment Verification

This checklist confirms that the project is ready for Vercel deployment.

### ✅ Build Configuration
- [x] **package.json build script** - Configured with `prisma generate && next build`
- [x] **next.config.ts** - Properly configured with:
  - Cloudinary remote image patterns
  - Google user avatar patterns
  - Turbopack configuration
- [x] **Production Build** - Builds successfully without errors
- [x] **TypeScript** - Strict mode enabled and compiles without errors

### ✅ Authentication Setup
- [x] **Firebase Client SDK** - Configured in `lib/firebase.ts`
- [x] **Firebase Auth Helpers** - Configured in `lib/firebase-auth.ts`
- [x] **Firebase Admin SDK** - Configured in `lib/firebase-admin.ts`
- [x] **Auth Client Compatibility Layer** - Exported at `lib/auth-client.ts`
- [x] **Auth Provider** - Configured in `app/providers/AuthProvider.tsx`

### ✅ Database Configuration
- [x] **Prisma Schema** - PostgreSQL provider configured
- [x] **Database Models** - Complete schema with:
  - User model with email uniqueness constraint
  - Post model with author relationship
  - Session model for authentication
  - Account model for OAuth providers
  - Verification model for email verification
  - Proper indexes and cascading deletes
- [x] **Connection String** - Uses `DATABASE_URL` environment variable

### ✅ Environment Variables Required for Vercel

Create these in Vercel project settings:

**Database:**
```
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require
```

**Firebase Client:**
```
NEXT_PUBLIC_FIREBASE_API_KEY=<your-firebase-api-key>
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=<your-project>.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=<your-project-id>
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=<your-project>.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=<firebase-sender-id>
NEXT_PUBLIC_FIREBASE_APP_ID=<firebase-app-id>
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=<firebase-measurement-id>
```

**Firebase Server:**
```
FIREBASE_SERVICE_ACCOUNT_KEY=<json-service-account>
FIREBASE_DATABASE_URL=https://<your-project>.firebaseio.com
NEXT_PUBLIC_ADMIN_EMAILS=<comma-separated-admin-emails>
```

**OAuth Providers:**
```
# Managed in Firebase Authentication console
# Example enabled provider: Google
```

**Image Storage - Cloudinary:**
```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=<your-cloudinary-cloud-name>
CLOUDINARY_API_KEY=<your-cloudinary-api-key>
CLOUDINARY_API_SECRET=<your-cloudinary-api-secret>
```

### ✅ File Structure
- [x] **.gitignore** - Properly configured to exclude:
  - `.env*` files (environment variables)
  - `node_modules`
  - `.next` build directory
  - `/prisma/migrations` (handled by Prisma)
- [x] **README.md** - Project documented
- [x] **package.json** - All dependencies listed
- [x] **tsconfig.json** - TypeScript configuration complete

### ✅ API Routes
- [x] **Posts API** - CRUD operations configured
- [x] **Search API** - Post search functionality
- [x] **Recent Posts API** - Latest posts endpoint

### ✅ Firebase Authorized Domains (To Configure)

Before deploying, update these in Firebase Console:

- Development: `localhost`
- Production: `your-vercel-domain.vercel.app`

### ✅ Prisma Migrations

After setting environment variables in Vercel:

```bash
# Pull production environment variables
vercel env pull .env.production.local

# Run migrations
npx prisma migrate deploy
```

## Deployment Steps

### 1. Push to GitHub
```bash
git add .
git commit -m "chore: ready for Vercel deployment"
git push origin main
```

### 2. Create Vercel Project
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import from GitHub repository
4. Configure project settings

### 3. Set Environment Variables
1. Go to project Settings > Environment Variables
2. Add all variables from the checklist above
3. Ensure they're set for Production environment

### 4. Configure Build Settings
- Framework: Next.js (auto-detected)
- Build Command: `npm run build` (uses prisma generate automatically)
- Output Directory: `.next` (auto-detected)
- Install Command: `npm ci` (auto-detected)

### 5. Deploy
1. Click "Deploy"
2. Wait for build to complete
3. Verify deployment at `https://your-project.vercel.app`

### 6. Post-Deployment Verification
- [ ] Site loads successfully
- [ ] Authentication works (Firebase Google sign-in)
- [ ] Post creation works
- [ ] Image uploads work via Cloudinary
- [ ] Environment variables are correctly set

## Troubleshooting

### "DATABASE_URL not found" Error
**Solution:** Check that `DATABASE_URL` is set in Vercel environment variables for the Production environment.

### Firebase Popup / Auth Fails (401/403)
**Solution:** 
1. Verify your Vercel domain is added to Firebase Authorized Domains
2. Ensure Firebase env vars are correct in Vercel
3. Ensure Google sign-in is enabled in Firebase Authentication

### Prisma Migration Fails
**Solution:**
```bash
vercel env pull .env.production.local
npx prisma migrate deploy
```

### Build Fails with TypeScript Errors
**Solution:**
```bash
npm run build  # Test locally first
npm run lint   # Check for linting issues (note: ESLint config issue is non-blocking)
```

## Post-Deployment

### Monitor Application
- Check Vercel Dashboard for errors
- Monitor database usage
- Review Firebase Authentication logs

### Security Checklist
- [x] `.env` files are git-ignored
- [x] Credentials never committed to GitHub
- [x] FIREBASE_SERVICE_ACCOUNT_KEY is server-only
- [x] Database connection uses SSL mode
- [x] Firebase project credentials are production secrets

### Maintenance
- Monitor database connections
- Update dependencies regularly
- Monitor Cloudinary usage
- Rotate OAuth credentials if needed

---

**Status:** ✅ **Ready for Deployment**

Generated: 2026-02-02
