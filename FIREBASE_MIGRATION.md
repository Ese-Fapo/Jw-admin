# Firebase Migration Guide

This project has been migrated from NextAuth to Firebase Authentication and Firestore Database.

## What Changed

### Removed Files and Directories
- ✅ Deleted: `app/api/auth/[...nextauth]/route.ts` (NextAuth API route)
- ✅ Deleted: `types/next-auth.d.ts` (NextAuth type definitions)
- ✅ Updated: `lib/auth.ts` (deprecated, kept for compatibility)
- ✅ Updated: `lib/auth-client.ts` (now re-exports from firebase-auth.ts)

### New Firebase Files Created
- ✅ Created: `lib/firebase.ts` (Firebase client SDK initialization)
- ✅ Created: `lib/firebase-auth.ts` (Firebase authentication client utilities)
- ✅ Created: `lib/firebase-admin.ts` (Firebase Admin SDK for server-side operations)
- ✅ Created: `.env.example` (Firebase environment variables template)

### Updated Components
- ✅ Updated: `app/providers/AuthProvider.tsx` (switched to Firebase Context API)
- ✅ Updated: `app/components/modals/SignInModal.tsx` (uses Firebase auth client)
- ✅ Updated: `lib/auth-guards.ts` (updated to verify Firebase tokens)
- ✅ Updated: `.env` (now uses Firebase env variables)
- ✅ Removed: `next-auth` and `better-auth` dependencies

## Setup Instructions

### 1. Install Firebase Dependencies

```bash
npm install firebase firebase-admin
```

### 2. Set Up Firebase Project

Visit [Firebase Console](https://console.firebase.google.com/) and:

1. Create a new project or use existing one
2. Enable Google Sign-In authentication
3. Create a Firestore Database (in test mode for development)
4. Go to Project Settings > Service Accounts > Generate new private key (for admin SDK)
5. Go to Project Settings > General > Web apps > Copy config

### 3. Configure Environment Variables

Copy `.env.example` to `.env.local` and fill in your Firebase credentials:

```
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Firebase Admin SDK (server-side only)
FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account",...}'
FIREBASE_DATABASE_URL=https://your_project_id.firebaseio.com

# Admin Emails (comma-separated) - users with these emails will be admins
NEXT_PUBLIC_ADMIN_EMAILS=admin@example.com,admin2@example.com

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/jw_admin

# Other Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_name
```

### 4. Update Prisma Schema

Add the following users collection to Firestore (if using Prisma with Firebase):

```prisma
model User {
  id            String    @id
  name          String
  email         String    @unique
  emailVerified Boolean   @default(false)
  image         String?
  role          UserRole  @default(USER)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  posts                Post[]
  assignments          WorkbookAssignment[]
  serviceAssignments   ServiceAssignment[]

  @@map("user")
}
```

### 5. Cleanup Status

The old auth stack has already been removed from this repository:

- `next-auth` removed
- `better-auth` removed
- old auth route deleted
- old auth env vars removed from `.env`

## Usage Guide

### Client-Side Authentication

```typescript
"use client";

import { useAuth } from "@/app/providers/AuthProvider";

export default function MyComponent() {
  const { user, loading, signOut } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!user) {
    return <div>Not logged in</div>;
  }

  return (
    <div>
      <p>Welcome, {user.name}!</p>
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
}
```

### Server-Side Authentication

```typescript
import { getSessionUser, requireAdmin } from "@/lib/auth-guards";

export async function GET(req: Request) {
  // Extract token from Authorization header
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");

  // Get current user
  const user = await getSessionUser(token);
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Require admin
  const adminCheck = await requireAdmin(token);
  if (!adminCheck.ok) {
    return new Response(adminCheck.message, { status: adminCheck.status });
  }

  return new Response("OK");
}
```

### Sending Tokens from Client

For API requests that need authentication, send the Firebase ID token:

```typescript
"use client";

import { auth } from "@/lib/firebase";

export async function authenticatedFetch(url: string, options: RequestInit = {}) {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");

  const token = await user.getIdToken();

  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
}
```

## Database Migration

### From PostgreSQL to Firestore

If migrating data:

1. Export user data from PostgreSQL
2. Use Firebase Admin SDK to write data to Firestore
3. Ensure user IDs match Firebase UIDs

Example migration script:
```typescript
import { db } from "@/lib/firebase";
import { prisma } from "@/lib/prisma";

async function migrateUsers() {
  const users = await prisma.user.findMany();

  for (const user of users) {
    await db.collection("users").doc(user.id).set({
      email: user.email,
      name: user.name,
      image: user.image,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }
}
```

## Security Rules for Firestore

Add these rules to your Firestore security rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read their own document
    match /users/{userId} {
      allow read: if request.auth.uid == userId;
      allow write: if request.auth.uid == userId && request.auth.token.admin == true;
    }

    // Admins can read all users
    match /users/{document=**} {
      allow read, write: if request.auth.token.admin == true;
    }

    // Public collections
    match /posts/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## Troubleshooting

### Firebase not initializing
- Check that all `NEXT_PUBLIC_FIREBASE_*` variables are set in `.env.local`
- These must be public (start with `NEXT_PUBLIC_`)

### Token verification failing on server
- Ensure `FIREBASE_SERVICE_ACCOUNT_KEY` contains valid JSON
- Check that the service account has proper permissions in Firebase Console

### Admin check always fails
- Verify `NEXT_PUBLIC_ADMIN_EMAILS` is set correctly
- User must log in again after changing admin status

## References

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Firestore Database](https://firebase.google.com/docs/firestore)
