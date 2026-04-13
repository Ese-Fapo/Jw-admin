"use server";

import { getFirebaseAdminDb } from "@/lib/firebase-admin";

interface PostWithAuthor {
  id: string;
  title: string;
  excerpt: string | null;
  content: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
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

    const db = await getFirebaseAdminDb();
    const snap = await db.collection("posts").where("slug", "==", slug).limit(1).get();
    const post = snap.empty
      ? null
      : (() => {
          const row = snap.docs[0].data();
          return {
            id: String(row.id),
            title: String(row.title),
            excerpt: (row.excerpt as string | null | undefined) ?? null,
            content: String(row.content ?? ""),
            slug: String(row.slug),
            createdAt: new Date(Number(row.createdAt ?? 0)).toISOString(),
            updatedAt: new Date(Number(row.updatedAt ?? 0)).toISOString(),
            coverImageURL: (row.coverImageURL as string | null | undefined) ?? null,
            author: {
              id: String(row.authorId ?? ""),
              name: (row.authorName as string | null | undefined) ?? null,
              image: (row.authorImage as string | null | undefined) ?? null,
            },
          };
        })();

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
    const db = await getFirebaseAdminDb();
    const posts = (await db.collection("posts").get()).docs
      .map((doc) => doc.data())
      .sort((a, b) => Number(b.createdAt ?? 0) - Number(a.createdAt ?? 0))
      .map((row) => ({
        id: String(row.id),
        title: String(row.title),
        excerpt: (row.excerpt as string | null | undefined) ?? null,
        content: String(row.content ?? ""),
        slug: String(row.slug),
        createdAt: new Date(Number(row.createdAt ?? 0)).toISOString(),
        updatedAt: new Date(Number(row.updatedAt ?? 0)).toISOString(),
        coverImageURL: (row.coverImageURL as string | null | undefined) ?? null,
        author: {
          id: String(row.authorId ?? ""),
          name: (row.authorName as string | null | undefined) ?? null,
          image: (row.authorImage as string | null | undefined) ?? null,
        },
      }));

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

    const db = await getFirebaseAdminDb();
    const posts = (await db.collection("posts").get()).docs
      .map((doc) => doc.data())
      .sort((a, b) => Number(b.createdAt ?? 0) - Number(a.createdAt ?? 0))
      .slice(0, limit)
      .map((row) => ({
        id: String(row.id),
        title: String(row.title),
        excerpt: (row.excerpt as string | null | undefined) ?? null,
        content: String(row.content ?? ""),
        slug: String(row.slug),
        createdAt: new Date(Number(row.createdAt ?? 0)).toISOString(),
        updatedAt: new Date(Number(row.updatedAt ?? 0)).toISOString(),
        coverImageURL: (row.coverImageURL as string | null | undefined) ?? null,
        author: {
          id: String(row.authorId ?? ""),
          name: (row.authorName as string | null | undefined) ?? null,
          image: (row.authorImage as string | null | undefined) ?? null,
        },
      }));

    return posts;
  } catch (error) {
    console.error("Error fetching recent posts:", error);
    throw new Error("Failed to fetch recent posts. Please try again later.");
  }
}