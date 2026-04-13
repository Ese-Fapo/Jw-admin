"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { authClient } from "@/lib/auth-client";
import { getAuthHeaders } from "@/lib/frontend-auth";

interface BlogViewProps {
  slug: string;
}

interface Post {
  id: string;
  title: string;
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

export default function BlogView({ slug }: BlogViewProps) {
  const router = useRouter();
  const { data: session } = authClient.useSession();

  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPost = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`/api/posts/${slug}`);
        if (!response.ok) {
          throw new Error(response.status === 404 ? "Post not found" : "Failed to load post");
        }

        const data = (await response.json()) as Post;
        setPost(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unexpected error");
      } finally {
        setIsLoading(false);
      }
    };

    loadPost();
  }, [slug]);

  const isAuthor = useMemo(() => {
    return Boolean(session?.user?.id && post?.author?.id && session.user.id === post.author.id);
  }, [session?.user?.id, post?.author?.id]);

  const handleDelete = async () => {
    if (!post) return;

    const confirmed = window.confirm("Delete this post permanently?");
    if (!confirmed) return;

    try {
      setIsDeleting(true);
      const response = await fetch(`/api/posts/${post.slug}`, {
        method: "DELETE",
        headers: await getAuthHeaders(),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to delete post");
      }

      toast.success("Post deleted successfully");
      router.push("/articles");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete post";
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <section className="content-wrap py-12">
        <p className="text-sm text-slate-400">Loading article...</p>
      </section>
    );
  }

  if (error || !post) {
    return (
      <section className="content-wrap py-12">
        <div className="card p-6">
          <h1 className="text-xl font-semibold text-white">Post unavailable</h1>
          <p className="mt-2 text-sm text-slate-400">{error ?? "This post could not be found."}</p>
          <Link href="/articles" className="mt-4 inline-block text-sm text-sky-400 hover:text-sky-300">
            ← Back to articles
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="content-wrap py-12">
      <article className="mx-auto max-w-4xl">
        <Link href="/articles" className="text-sm text-sky-400 hover:text-sky-300">
          ← Back to articles
        </Link>

        <header className="mt-4">
          <h1 className="text-3xl font-bold text-white sm:text-4xl">{post.title}</h1>
          <p className="mt-2 text-sm text-slate-400">
            By {post.author?.name ?? "Unknown"} • {new Date(post.createdAt).toLocaleDateString("pt-BR")}
          </p>
        </header>

        {post.coverImageURL && (
          <div className="card relative mt-6 h-64 overflow-hidden sm:h-80">
            <Image src={post.coverImageURL} alt={post.title} fill className="object-cover" priority />
          </div>
        )}

        <div className="prose mt-8 max-w-none">
          <div className="whitespace-pre-wrap text-slate-200">{post.content}</div>
        </div>

        {isAuthor && (
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={`/write/edit/${post.slug}`}
              className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500"
            >
              Edit post
            </Link>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-60"
            >
              {isDeleting ? "Deleting..." : "Delete post"}
            </button>
          </div>
        )}
      </article>
    </section>
  );
}
