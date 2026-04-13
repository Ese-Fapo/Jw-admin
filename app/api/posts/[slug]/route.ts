import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdminDb } from '@/lib/firebase-admin';
import { uploadToFirebaseStorage } from '@/app/services/firebase-storage';
import { getSessionUser } from '@/lib/auth-guards';
import { nowMs, postToApi } from '@/lib/firestore-data';
import type { PostRecord } from '@/lib/firestore-data';

/**
 * GET /api/posts/[slug]
 * Retrieves a single blog post by its unique slug identifier
 * @param request - The incoming HTTP request
 * @param params - Dynamic route parameters containing the post slug
 * @returns JSON response with post data or error message
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    // Extract the slug from the dynamic route parameters
    const { slug } = await params;

    // Query the database for a post with the matching slug
    const db = await getFirebaseAdminDb();
    const snap = await db.collection("posts").where("slug", "==", slug).limit(1).get();
    const post = snap.empty ? null : snap.docs[0].data();

    // Return 404 if the post doesn't exist
    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Return the post data as JSON
    return NextResponse.json(postToApi(post as PostRecord));
  } catch (error) {
    // Log the error for debugging purposes
    console.error('Error fetching post:', error);
    // Return a generic error response
    return NextResponse.json(
      { error: 'Failed to fetch post' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/posts/[slug]
 * Updates an existing blog post with new data
 * @param request - The incoming HTTP request with updated post data in body
 * @param params - Dynamic route parameters containing the post slug
 * @returns JSON response with updated post data or error message
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    // Verify user authentication
    const sessionUser = await getSessionUser(request);
    
    if (!sessionUser) {
      return NextResponse.json(
        { error: 'Não autorizado' }, 
        { status: 401 }
      );
    }

    // Extract the slug from the dynamic route parameters
    const { slug } = await params;

    // Check if post exists and verify ownership
    const db = await getFirebaseAdminDb();
    const existingPostSnap = await db.collection("posts").where("slug", "==", slug).limit(1).get();
    const existingPost = existingPostSnap.empty ? null : existingPostSnap.docs[0];

    if (!existingPost) {
      return NextResponse.json(
        { error: 'Post não encontrado' },
        { status: 404 }
      );
    }

    if (existingPost.data().authorId !== sessionUser.id) {
      return NextResponse.json(
        { error: 'Você não tem permissão para editar este artigo' },
        { status: 403 }
      );
    }

    const contentType = request.headers.get('content-type') || '';

    let title: string | null = null;
    let content: string | null = null;
    let excerpt: string | null = null;
    let coverImageURL: string | null = null;
    let coverImagePublicId: string | null = null;
    let coverImage: File | null = null;

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      if (formData.has('title')) title = (formData.get('title') as string) ?? '';
      if (formData.has('content')) content = (formData.get('content') as string) ?? '';
      if (formData.has('excerpt')) excerpt = (formData.get('excerpt') as string) ?? '';
      if (formData.has('coverImageURL')) coverImageURL = (formData.get('coverImageURL') as string) ?? null;
      if (formData.has('coverImagePublicId')) coverImagePublicId = (formData.get('coverImagePublicId') as string) ?? null;
      const file = formData.get('coverImage');
      if (file instanceof File) {
        coverImage = file;
      }
    } else {
      const body = await request.json();
      title = body.title ?? null;
      content = body.content ?? null;
      excerpt = body.excerpt ?? null;
      coverImageURL = body.coverImageURL ?? null;
      coverImagePublicId = body.coverImagePublicId ?? null;
    }

    const updateData: Record<string, unknown> = {};
    if (title !== null) updateData.title = title;
    if (content !== null) updateData.content = content;
    if (excerpt !== null) updateData.excerpt = excerpt;

    if (coverImage) {
      const imageData = await uploadToFirebaseStorage(coverImage);
      updateData.coverImageURL = imageData.secure_url;
      updateData.coverImagePublicId = imageData.public_id;
    } else {
      if (coverImageURL !== null) updateData.coverImageURL = coverImageURL;
      if (coverImagePublicId !== null) updateData.coverImagePublicId = coverImagePublicId;
    }

    // Update the post in the database with new data
    updateData.updatedAt = nowMs();

    await existingPost.ref.set(updateData, { merge: true });
    const post = { ...existingPost.data(), ...updateData };

    // Return the updated post data
    return NextResponse.json(postToApi(post as Parameters<typeof postToApi>[0]));
  } catch (error) {
    // Log the error for debugging purposes
    console.error('Error updating post:', error);
    // Return a generic error response
    return NextResponse.json(
      { error: 'Failed to update post' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/posts/[slug]
 * Permanently removes a blog post from the database
 * @param request - The incoming HTTP request
 * @param params - Dynamic route parameters containing the post slug
 * @returns JSON response with success message or error message
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    // Verify user authentication
    const sessionUser = await getSessionUser(request);
    
    if (!sessionUser) {
      return NextResponse.json(
        { error: 'Não autorizado' }, 
        { status: 401 }
      );
    }

    // Extract the slug from the dynamic route parameters
    const { slug } = await params;

    // Check if post exists and verify ownership
    const db = await getFirebaseAdminDb();
    const existingPostSnap = await db.collection("posts").where("slug", "==", slug).limit(1).get();
    const existingPost = existingPostSnap.empty ? null : existingPostSnap.docs[0];

    if (!existingPost) {
      return NextResponse.json(
        { error: 'Post não encontrado' },
        { status: 404 }
      );
    }

    if (existingPost.data().authorId !== sessionUser.id) {
      return NextResponse.json(
        { error: 'Você não tem permissão para excluir este artigo' },
        { status: 403 }
      );
    }

    // Delete the post from the database
    await existingPost.ref.delete();

    // Return success message
    return NextResponse.json({ message: 'Post deleted successfully' });
  } catch (error) {
    // Log the error for debugging purposes
    console.error('Error deleting post:', error);
    // Return a generic error response
    return NextResponse.json(
      { error: 'Failed to delete post' },
      { status: 500 }
    );
  }
}
