import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { uploadToCloudinary } from '@/app/services/cloudinary';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

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
    const post = await prisma.post.findUnique({
      where: { slug },
    });

    // Return 404 if the post doesn't exist
    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Return the post data as JSON
    return NextResponse.json(post);
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
    const session = await auth.api.getSession({
      headers: await headers()
    });
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Não autorizado' }, 
        { status: 401 }
      );
    }

    // Extract the slug from the dynamic route parameters
    const { slug } = await params;

    // Check if post exists and verify ownership
    const existingPost = await prisma.post.findUnique({
      where: { slug },
      select: { authorId: true },
    });

    if (!existingPost) {
      return NextResponse.json(
        { error: 'Post não encontrado' },
        { status: 404 }
      );
    }

    if (existingPost.authorId !== session.user.id) {
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
      const imageData = await uploadToCloudinary(coverImage);
      updateData.coverImageURL = imageData.secure_url;
      updateData.coverImagePublicId = imageData.public_id;
    } else {
      if (coverImageURL !== null) updateData.coverImageURL = coverImageURL;
      if (coverImagePublicId !== null) updateData.coverImagePublicId = coverImagePublicId;
    }

    // Update the post in the database with new data
    const post = await prisma.post.update({
      where: { slug },
      data: updateData,
    });

    // Return the updated post data
    return NextResponse.json(post);
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
    const session = await auth.api.getSession({
      headers: await headers()
    });
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Não autorizado' }, 
        { status: 401 }
      );
    }

    // Extract the slug from the dynamic route parameters
    const { slug } = await params;

    // Check if post exists and verify ownership
    const existingPost = await prisma.post.findUnique({
      where: { slug },
      select: { authorId: true },
    });

    if (!existingPost) {
      return NextResponse.json(
        { error: 'Post não encontrado' },
        { status: 404 }
      );
    }

    if (existingPost.authorId !== session.user.id) {
      return NextResponse.json(
        { error: 'Você não tem permissão para excluir este artigo' },
        { status: 403 }
      );
    }

    // Delete the post from the database
    await prisma.post.delete({
      where: { slug },
    });

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
