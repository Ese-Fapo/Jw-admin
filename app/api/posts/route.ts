import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdminDb } from '@/lib/firebase-admin';
import { getSessionUser } from '@/lib/auth-guards';
import slugify from 'slugify';
import { uploadToFirebaseStorage } from '@/app/services/firebase-storage';
import { nowMs, postToApi } from '@/lib/firestore-data';

/**
 * POST /api/posts
 * Creates a new blog post with image upload
 * Requires authentication
 * @param request - The incoming HTTP request with FormData containing post details and cover image
 * @returns JSON response with created post data or error message
 */
export async function POST(request: NextRequest) {
  try {
    // Verify user authentication
    const sessionUser = await getSessionUser(request);
    
    if (!sessionUser) {
      return NextResponse.json(
        { error: 'Não autorizado' }, 
        { status: 401 }
      );
    }

    // Extract form data from request
    const formData = await request.formData();
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const excerpt = formData.get('excerpt') as string;
    const coverImage = formData.get('coverImage') as File;

    // Validate required fields
    if (!title || !content || !excerpt || !coverImage) {
      return NextResponse.json(
        { error: 'Campos obrigatórios faltando' }, 
        { status: 400 }
      );
    }

    // Generate slug from title
    let slug = slugify(title, { 
      lower: true, 
      strict: true, 
      trim: true 
    });

    // Ensure slug is unique by appending counter if necessary
    const baseSlug = slug;
    let counter = 1;
    const db = await getFirebaseAdminDb();

    while (!(await db.collection("posts").where("slug", "==", slug).limit(1).get()).empty) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Upload cover image to Firebase Storage
    const imageData = await uploadToFirebaseStorage(coverImage);

    // Create new post in database
    const postRef = db.collection("posts").doc();
    const newPost = {
      id: postRef.id,
      title,
      content,
      excerpt,
      slug,
      coverImageURL: imageData.secure_url,
      coverImagePublicId: imageData.public_id,
      authorId: sessionUser.id,
      authorName: sessionUser.name ?? null,
      authorImage: sessionUser.image ?? null,
      createdAt: nowMs(),
      updatedAt: nowMs(),
    };

    await postRef.set(newPost);

    return NextResponse.json(postToApi(newPost), { status: 201 });
  } catch (error) {
    console.error('Erro ao criar post:', error);
    return NextResponse.json(
      { error: 'Falha ao criar post' }, 
      { status: 500 }
    );
  }
}

/**
 * GET /api/posts
 * Retrieves blog posts with pagination support
 * Query params: page (default 1), limit (default 9)
 * @returns JSON response with posts array and pagination info
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "9");
    const skip = (page - 1) * limit;

    const db = await getFirebaseAdminDb();
    const allPosts = (await db.collection("posts").get()).docs
      .map((doc) => doc.data())
      .sort((a, b) => Number(b.createdAt ?? 0) - Number(a.createdAt ?? 0));

    const totalCount = allPosts.length;
    const posts = allPosts.slice(skip, skip + limit).map((row) => ({
      id: String(row.id),
      title: String(row.title),
      slug: String(row.slug),
      excerpt: (row.excerpt as string | null | undefined) ?? null,
      coverImageURL: (row.coverImageURL as string | null | undefined) ?? null,
      createdAt: new Date(Number(row.createdAt ?? 0)).toISOString(),
      author: {
        id: String(row.authorId ?? ""),
        name: (row.authorName as string | null | undefined) ?? null,
        image: (row.authorImage as string | null | undefined) ?? null,
      },
    }));

    const hasMore = skip + posts.length < totalCount;
    const nextPage = hasMore ? page + 1 : null;

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasMore,
        nextPage,
      },
    });
  } catch (error) {
    console.error("Erro ao buscar posts:", error);
    return NextResponse.json(
      { error: "Falha ao buscar posts" },
      { status: 500 }
    );
  }
}