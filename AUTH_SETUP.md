# Firebase Authentication Setup Guide

**Status:** Active setup for the current app

## Configuration Steps

### 1. Environment Variables
Create a `.env.local` file in the project root and add your Firebase values:

```env
NEXT_PUBLIC_FIREBASE_API_KEY="your-firebase-api-key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project.firebasestorage.app"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your-messaging-sender-id"
NEXT_PUBLIC_FIREBASE_APP_ID="your-app-id"
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="your-measurement-id"

FIREBASE_SERVICE_ACCOUNT_KEY="{...your-service-account-json...}"
FIREBASE_DATABASE_URL="https://your-project-id.firebaseio.com"

NEXT_PUBLIC_ADMIN_EMAILS="admin@example.com"
DATABASE_URL="your-postgresql-url"
```

### 2. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a project or select an existing one
3. Enable **Authentication** → **Google** provider
4. Enable **Firestore Database**
5. Open **Project settings** → **General** and copy your web app config
6. Open **Project settings** → **Service accounts** and generate an admin key for server-side verification

### 3. Current Auth Files

- `lib/firebase.ts` — Firebase client initialization
- `lib/firebase-auth.ts` — client auth helpers and compatibility API
- `lib/firebase-admin.ts` — server-side token verification
- `app/providers/AuthProvider.tsx` — React auth context provider

### 4. Testing

1. Start the development server with `npm run dev`
2. Open the login modal or `/auth`
3. Click **Continue with Google**
4. Complete the Firebase Google sign-in popup
5. Confirm the user appears as logged in

## Security Notes

⚠️ **Important:**
- Never commit `.env` or `.env.local`
- Keep `FIREBASE_SERVICE_ACCOUNT_KEY` server-only
- Rotate Firebase service account credentials if exposed
- Use separate Firebase projects for dev and production when possible
