import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdminDb } from '@/lib/firebase-admin';

/**
 * GET /api/posts/search
 * Search for blog posts by title, content, or excerpt
 * Query params: q (search query), limit (default 10)
 * @returns JSON response with matching posts array
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q") || "";
    const requestedLimit = Number.parseInt(searchParams.get("limit") || "10", 10);
    const limit = Number.isFinite(requestedLimit)
      ? Math.min(Math.max(requestedLimit, 1), 50)
      : 10;

    if (!query.trim() || query.trim().length < 2) {
      return NextResponse.json({ posts: [] });
    }

    const db = await getFirebaseAdminDb();
    const normalizedQuery = query.trim().toLowerCase();

    const posts = (await db.collection("posts").get()).docs
      .map((doc) => doc.data())
      .filter((post) => {
        const title = String(post.title ?? "").toLowerCase();
        const content = String(post.content ?? "").toLowerCase();
        const excerpt = String(post.excerpt ?? "").toLowerCase();
        return title.includes(normalizedQuery) || content.includes(normalizedQuery) || excerpt.includes(normalizedQuery);
      })
      .sort((a, b) => Number(b.createdAt ?? 0) - Number(a.createdAt ?? 0))
      .slice(0, limit)
      .map((post) => ({
        id: String(post.id),
        title: String(post.title),
        slug: String(post.slug),
        excerpt: (post.excerpt as string | null | undefined) ?? null,
        coverImageURL: (post.coverImageURL as string | null | undefined) ?? null,
        createdAt: new Date(Number(post.createdAt ?? 0)).toISOString(),
        author: {
          id: String(post.authorId ?? ""),
          name: (post.authorName as string | null | undefined) ?? null,
          image: (post.authorImage as string | null | undefined) ?? null,
        },
      }));

    return NextResponse.json({ posts, count: posts.length });
  } catch (error) {
    console.error('Error searching posts:', error);
    return NextResponse.json(
      { error: 'Failed to search posts' },
      { status: 500 }
    );
  }
}
