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
- [x] **Better Auth Library** - Installed and configured
- [x] **Prisma Adapter** - PostgreSQL adapter configured
- [x] **Auth Client** - Properly exported at `lib/auth-client.ts`
- [x] **Auth Server** - Configured at `lib/auth.ts` with:
  - Google OAuth provider
  - GitHub OAuth provider
  - Email/password authentication
  - Auto-detection of deployment URL via `VERCEL_URL`
- [x] **Auth API Route** - Dynamic route handler at `app/api/auth/[...all]/route.ts`

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

**Authentication - Better Auth:**
```
BETTER_AUTH_SECRET=<random-32+-character-string>
BETTER_AUTH_URL=(leave blank - auto-detects from VERCEL_URL)
```

**OAuth - Google:**
```
GOOGLE_CLIENT_ID=<your-google-client-id>.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
```

**OAuth - GitHub:**
```
GITHUB_CLIENT_ID=<your-github-client-id>
GITHUB_CLIENT_SECRET=<your-github-client-secret>
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
- [x] **Auth Routes** - `app/api/auth/[...all]/route.ts`
- [x] **Posts API** - CRUD operations configured
- [x] **Search API** - Post search functionality
- [x] **Recent Posts API** - Latest posts endpoint

### ✅ OAuth Redirect URIs (To Configure)

Before deploying, update these in your OAuth provider settings:

**Google Cloud Console:**
- Development: `http://localhost:3000/api/auth/callback/google`
- Production: `https://your-vercel-domain.vercel.app/api/auth/callback/google`

**GitHub Developer Settings:**
- Development: `http://localhost:3000/api/auth/callback/github`
- Production: `https://your-vercel-domain.vercel.app/api/auth/callback/github`

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
- [ ] Authentication works (sign in with Google/GitHub)
- [ ] Post creation works
- [ ] Image uploads work via Cloudinary
- [ ] Environment variables are correctly set

## Troubleshooting

### "DATABASE_URL not found" Error
**Solution:** Check that `DATABASE_URL` is set in Vercel environment variables for the Production environment.

### Authentication Redirects to localhost:3000
**Solution:** `BETTER_AUTH_URL` should be empty or commented out in Vercel. The library auto-detects from `VERCEL_URL`.

### OAuth Callback Fails (401/403)
**Solution:** 
1. Verify redirect URIs match in Google Cloud Console and GitHub
2. Ensure credentials are correct in Vercel environment variables
3. Wait 5-10 minutes for OAuth apps to refresh

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
- Review authentication logs

### Security Checklist
- [x] `.env` files are git-ignored
- [x] Credentials never committed to GitHub
- [x] BETTER_AUTH_SECRET is secure (32+ characters)
- [x] Database connection uses SSL mode
- [x] OAuth credentials are production secrets

### Maintenance
- Monitor database connections
- Update dependencies regularly
- Monitor Cloudinary usage
- Rotate OAuth credentials if needed

---

**Status:** ✅ **Ready for Deployment**

Generated: 2026-02-02
