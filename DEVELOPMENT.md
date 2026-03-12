# Development Guide

## Database Setup

### Using Prisma 7

This project uses Prisma 7, which has a new configuration approach:

1. **Database Configuration:**
   - Database URL is configured in `prisma.config.ts`, not in `schema.prisma`
   - The `datasource` block in `schema.prisma` only specifies the provider

2. **Environment Variables:**
   ```env
   DATABASE_URL="postgres://username:password@host:port/database?sslmode=require"
   ```

3. **Database Commands:**
   ```bash
   # Push schema changes to database
   npx prisma db push

   # Generate Prisma Client
   npx prisma generate

   # Open Prisma Studio (database GUI)
   npx prisma studio

   # Create a migration
   npx prisma migrate dev --name migration_name

   # Check migration status
   npx prisma migrate status
   ```

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

### Database Client

Use the centralized Prisma client from `lib/prisma.ts`:

```typescript
import { prisma } from '@/lib/prisma';

// Example usage
const posts = await prisma.post.findMany();
```

This prevents multiple Prisma client instances in development.

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

- [ ] Update DATABASE_URL for production
- [ ] Run `npm run build` to check for errors
- [ ] Push database schema: `npx prisma db push`
- [ ] Generate Prisma Client: `npx prisma generate`
- [ ] Set up environment variables on hosting platform
- [ ] Configure CORS if needed
- [ ] Test all API endpoints

## Common Issues

### Prisma Client Not Found

```bash
npx prisma generate
```

### Database Connection Issues

- Check DATABASE_URL format
- Verify database is accessible
- Check firewall/security group settings

### Type Errors

```bash
npx tsc --noEmit
```

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Zustand](https://zustand-demo.pmnd.rs/)
