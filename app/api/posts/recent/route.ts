import { NextResponse, NextRequest } from "next/server";
import { getFirebaseAdminDb } from "@/lib/firebase-admin";

export async function GET(request: NextRequest) {
  try {
    // Get limit from query parameters, default to 6
    const searchParams = request.nextUrl.searchParams;
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? Math.min(parseInt(limitParam), 100) : 6;

    const db = await getFirebaseAdminDb();
    const recentPosts = (await db.collection("posts").get()).docs
      .map((doc) => doc.data())
      .sort((a, b) => Number(b.createdAt ?? 0) - Number(a.createdAt ?? 0))
      .slice(0, limit)
      .map((post) => ({
        id: String(post.id),
        title: String(post.title),
        slug: String(post.slug),
        excerpt: (post.excerpt as string | null | undefined) ?? null,
        coverImageURL: (post.coverImageURL as string | null | undefined) ?? null,
        createdAt: new Date(Number(post.createdAt ?? 0)).toISOString(),
      }));

    const response = NextResponse.json(recentPosts, { status: 200 });
    
    // Add CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
    
    return response;
  } catch (error) {
    console.error("FETCH_RECENT_POSTS_ERROR", error);

    return NextResponse.json(
      { error: "Falha ao buscar posts" },
      { status: 500 },
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
