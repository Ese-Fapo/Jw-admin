import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import slugify from 'slugify';
import { uploadToCloudinary } from '@/app/services/cloudinary';

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
    const session = await auth.api.getSession({
      headers: await headers()
    });
    
    if (!session || !session.user) {
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
    let baseSlug = slug;
    let counter = 1;
    while (await prisma.post.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Upload cover image to Cloudinary
    const imageData = await uploadToCloudinary(coverImage);

    // Create new post in database
    const newPost = await prisma.post.create({
      data: {
        title,
        content,
        excerpt,
        slug,
        coverImageURL: imageData.secure_url,
        coverImagePublicId: imageData.public_id,
        authorId: session.user.id,
      },
    });

    return NextResponse.json(newPost, { status: 201 });
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

    // Fetch posts with pagination
    const [posts, totalCount] = await Promise.all([
      prisma.post.findMany({
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          coverImageURL: true,
          createdAt: true,
          author: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
        skip,
        take: limit,
      }),
      prisma.post.count(),
    ]);

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