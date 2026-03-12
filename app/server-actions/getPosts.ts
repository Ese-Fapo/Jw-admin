"use server";

import { prisma } from "@/lib/prisma";

interface PostWithAuthor {
  id: string;
  title: string;
  excerpt: string | null;
  content: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
  coverImageURL: string | null;
  author: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

export async function getPostsBySlug(slug: string): Promise<PostWithAuthor | null> {
  try {
    if (!slug || typeof slug !== "string") {
      throw new Error("Valid slug is required");
    }

    const post = await prisma.post.findUnique({
      where: { slug },
      select: {
        id: true,
        title: true,
        excerpt: true,
        content: true,
        slug: true,
        createdAt: true,
        updatedAt: true,
        coverImageURL: true,
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    if (!post) {
      return null;
    }

    return post;
  } catch (error) {
    console.error("Error fetching post by slug:", error);
    throw new Error("Failed to fetch post. Please try again later.");
  }
}

export async function getAllPosts(): Promise<PostWithAuthor[]> {
  try {
    const posts = await prisma.post.findMany({
      select: {
        id: true,
        title: true,
        excerpt: true,
        content: true,
        slug: true,
        createdAt: true,
        updatedAt: true,
        coverImageURL: true,
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return posts;
  } catch (error) {
    console.error("Error fetching all posts:", error);
    throw new Error("Failed to fetch posts. Please try again later.");
  }
}

export async function getRecentPosts(limit: number = 5): Promise<PostWithAuthor[]> {
  try {
    if (limit < 1) {
      throw new Error("Limit must be greater than 0");
    }

    const posts = await prisma.post.findMany({
      select: {
        id: true,
        title: true,
        excerpt: true,
        content: true,
        slug: true,
        createdAt: true,
        updatedAt: true,
        coverImageURL: true,
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    });

    return posts;
  } catch (error) {
    console.error("Error fetching recent posts:", error);
    throw new Error("Failed to fetch recent posts. Please try again later.");
  }
}