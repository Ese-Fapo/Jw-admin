# Development Guide

## Database Setup

### Using Firebase + Firestore

This project uses Firebase Authentication and Firestore.

1. **Environment Variables:**
  ```env
  NEXT_PUBLIC_FIREBASE_API_KEY="..."
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="..."
  NEXT_PUBLIC_FIREBASE_PROJECT_ID="..."
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="..."
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="..."
  NEXT_PUBLIC_FIREBASE_APP_ID="..."
  NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="..."
  FIREBASE_SERVICE_ACCOUNT_KEY="{...json...}"
  FIREBASE_DATABASE_URL="https://your-project-id.firebaseio.com"
  NEXT_PUBLIC_ADMIN_EMAILS="admin@example.com"
  ```

2. **Database Workflow:**
  - Use Firebase Console for Firestore collections and indexes
  - Use Firebase Admin SDK from server routes for trusted writes
  - Use Firestore security rules for access control

## Project Structure Best Practices

### Components Organization

```
app/components/
├── general/      # Shared components (Navbar, Footer)
├── home/         # Home page specific components
├── modals/       # Modal components
└── ui/           # Reusable UI components (optional)
```

### API Routes

```
app/api/
└── posts/
    ├── route.ts           # GET, POST /api/posts
    └── [slug]/
        └── route.ts       # GET, PUT, DELETE /api/posts/:slug
```

### Database Access

Use the Firebase data helpers in `lib/firestore-data.ts` and server helpers in `lib/firebase-admin.ts`.

## Code Style

### TypeScript

- Use proper types from `types/index.ts`
- Enable strict mode in tsconfig.json
- Avoid `any` types

### React

- Use functional components with hooks
- Use `'use client'` directive for client components
- Server components by default

### CSS/Tailwind

- Use Tailwind utility classes
- Custom animations defined in globals.css
- Consistent spacing and color scheme

## State Management

### Zustand

```typescript
import { create } from 'zustand';

interface State {
  // state properties
}

export const useStore = create<State>((set) => ({
  // implementation
}));
```

## Error Handling

### API Routes

```typescript
try {
  // operation
  return NextResponse.json(data);
} catch (error) {
  console.error('Error:', error);
  return NextResponse.json(
    { error: 'Error message' },
    { status: 500 }
  );
}
```

## Performance Tips

1. **Images:** Use Next.js `Image` component with proper sizing
2. **Fonts:** Use next/font for optimized font loading
3. **Dynamic Imports:** Use for large components
4. **Database Queries:** Use proper indexes and limits

## Deployment Checklist

- [ ] Run `npm run build` to check for errors
- [ ] Set Firebase/Auth/Storage environment variables on your host
- [ ] Verify Firebase Authorized Domains include your deployment URL
- [ ] Set up environment variables on hosting platform
- [ ] Configure CORS if needed
- [ ] Test all API endpoints

## Common Issues

### Firebase Admin Initialization Fails

- Ensure `FIREBASE_SERVICE_ACCOUNT_KEY` is valid JSON or base64 JSON
- Ensure `FIREBASE_DATABASE_URL` is set

### Firestore Permission Issues

- Verify Firestore security rules
- Verify authenticated user token and claims

### Type Errors

```bash
npx tsc --noEmit
```

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Zustand](https://zustand-demo.pmnd.rs/)
