# Provider Setup Note

This project no longer uses direct GitHub OAuth setup files or NextAuth/Better Auth callback routes.

## Current State

- Authentication is now managed through Firebase
- The current UI and auth helpers are built around Firebase Google sign-in
- There is no active GitHub OAuth route in this repository

## If you want GitHub sign-in later

Add GitHub as a provider in **Firebase Authentication** instead of creating a custom `/api/auth/callback/github` route.

General steps:

1. Open [Firebase Console](https://console.firebase.google.com/)
2. Go to **Authentication** → **Sign-in method**
3. Enable **GitHub**
4. Add your GitHub OAuth app credentials there
5. Add your production domain to Firebase **Authorized domains**

## Important

Do not add old-style env vars like these back into the project:

```env
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
```

If GitHub auth is needed in the future, it should be wired through Firebase and then integrated into `lib/firebase-auth.ts`.
