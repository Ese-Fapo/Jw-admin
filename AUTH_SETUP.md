# Google OAuth Authentication - Setup Guide

**Status:** Configuration Template

## Configuration Steps

### 1. Environment Variables
Create a `` file in the root directory (this file is gitignored and won't be tracked):

```env
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
BETTER_AUTH_URL="http://localhost:3000"
BETTER_AUTH_SECRET="your-secret-key"
DATABASE_URL="your-database-url"
```

**Note:** Replace with your actual credentials from [Google Cloud Console](https://console.cloud.google.com/).

### 2. Getting Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Navigate to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth 2.0 Client ID"
5. Configure OAuth consent screen if not already done
6. Select "Web application" as application type
7. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://yourdomain.com/api/auth/callback/google` (production)
8. Copy the Client ID and Client Secret to your `.env` file

### 3. Auth Configuration
**File:** `lib/auth.ts`
- Prisma adapter configured
- Google OAuth provider configured
- Email/password auth enabled
- Success and error callbacks added

### 4. Auth Client
**File:** `lib/auth-client.ts`
- Better Auth client created for client-side usage
- Properly exported for SignInModal component

## Testing

1. Start the development server: `npm run dev`
2. Navigate to the sign-in page
3. Click "Sign in with Google"
4. Authorize the application
5. Verify successful authentication and redirect

## Security Notes

⚠️ **IMPORTANT:**
- Never commit `.env` files to git
- Never share your OAuth credentials publicly
- Rotate credentials immediately if exposed
- Use different credentials for development and production
- Keep the `.gitignore` file updated
