# GitHub OAuth Authentication - Setup Guide

**Status:** Configuration Template

## Configuration Steps

### 1. Environment Variables
Create a `.env` file in the root directory (this file is gitignored and won't be tracked):

```env
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

**Note:** Get these from [GitHub Developer Settings](https://github.com/settings/developers) > OAuth Apps.

### 2. Getting GitHub OAuth Credentials

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the application details:
   - **Application name:** Your App Name
   - **Homepage URL:** `http://localhost:3000` (development) or your production URL
   - **Authorization callback URL:** 
     - `http://localhost:3000/api/auth/callback/github` (development)
     - `https://yourdomain.com/api/auth/callback/github` (production)
4. Click "Register application"
5. Copy the Client ID
6. Generate a new Client Secret and copy it
7. Add both to your `.env` file

### 3. Auth Configuration
**File:** `lib/auth.ts`
- GitHub provider configured with clientId and clientSecret
- Email/password authentication enabled
- Success and error callbacks implemented

### 4. Auth Client
**File:** `lib/auth-client.ts`
- Better Auth client initialized for client-side usage

### 5. API Route Handler
**File:** `app/api/auth/[...all]/route.ts`
- Handles all authentication routes including GitHub OAuth

## Testing

1. Start the development server: `npm run dev`
2. Navigate to the sign-in page
3. Click "Sign in with GitHub"
4. Authorize the application
5. Verify successful authentication and redirect

## Security Notes

⚠️ **IMPORTANT:**
- Never commit `.env` files to git
- Never share your OAuth credentials publicly
- Rotate credentials immediately if exposed
- Use different credentials for development and production
- Keep the `.gitignore` file updated

## Troubleshooting

**Issue:** Callback URL mismatch
- **Solution:** Ensure the callback URL in GitHub OAuth app settings matches exactly with your application URL

**Issue:** Invalid client
- **Solution:** Verify that CLIENT_ID and CLIENT_SECRET are correctly set in `.env`

**Issue:** CORS errors
- **Solution:** Check that your domain is properly configured in GitHub OAuth app settings
