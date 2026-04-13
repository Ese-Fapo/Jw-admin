"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { authClient } from "@/lib/auth-client";
import { getAuthHeaders } from "@/lib/frontend-auth";

interface PostResponse {
  title: string;
  excerpt: string;
  content: string;
  coverImageURL: string | null;
}

export default function EditPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params.postId as string;

  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState<File | null>(null);

  const [initialTitle, setInitialTitle] = useState("");
  const [initialExcerpt, setInitialExcerpt] = useState("");
  const [initialContent, setInitialContent] = useState("");
  const [currentCoverImageURL, setCurrentCoverImageURL] = useState<string | null>(null);

  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let active = true;

    const loadPage = async () => {
      try {
        const session = await authClient.getSession();
        if (!active) return;

        const isLoggedIn = Boolean(session.data?.user);
        setIsAuthenticated(isLoggedIn);

        if (!isLoggedIn) return;

        const response = await fetch(`/api/posts/${postId}`);
        if (!response.ok) throw new Error("Could not load post");

        const post = (await response.json()) as PostResponse;
        if (!active) return;

        setTitle(post.title ?? "");
        setExcerpt(post.excerpt ?? "");
        setContent(post.content ?? "");

        setInitialTitle(post.title ?? "");
        setInitialExcerpt(post.excerpt ?? "");
        setInitialContent(post.content ?? "");
        setCurrentCoverImageURL(post.coverImageURL ?? null);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load post";
        toast.error(message);
      } finally {
        if (active) {
          setIsCheckingSession(false);
          setIsLoading(false);
        }
      }
    };

    loadPage();
    return () => {
      active = false;
    };
  }, [postId]);

  const hasChanges = useMemo(() => {
    return (
      title !== initialTitle ||
      excerpt !== initialExcerpt ||
      content !== initialContent ||
      Boolean(coverImage)
    );
  }, [title, excerpt, content, initialTitle, initialExcerpt, initialContent, coverImage]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!hasChanges) {
      toast("No changes to save.");
      return;
    }

    try {
      setIsSubmitting(true);

      const formData = new FormData();
      if (title !== initialTitle) formData.append("title", title);
      if (excerpt !== initialExcerpt) formData.append("excerpt", excerpt);
      if (content !== initialContent) formData.append("content", content);
      if (coverImage) formData.append("coverImage", coverImage);

      const response = await fetch(`/api/posts/${postId}`, {
        method: "PUT",
        headers: await getAuthHeaders(),
        body: formData,
      });

      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "Failed to update post");

      toast.success("Post updated successfully");
      router.push(`/articles/${body.slug}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update post";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="content-wrap py-10 sm:py-14">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white sm:text-4xl">Edit post</h1>
        <p className="mt-2 text-sm text-slate-400">Uses your existing authenticated PUT /api/posts/[slug] endpoint.</p>
      </div>

      {isCheckingSession || isLoading ? (
        <p className="text-sm text-slate-400">Loading editor...</p>
      ) : !isAuthenticated ? (
        <div className="card p-5">
          <p className="text-sm text-slate-300">You need to be logged in to edit this post.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="card space-y-5 p-6">
          <div>
            <label htmlFor="title" className="mb-1 block text-sm text-slate-300">Title</label>
            <input
              id="title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="excerpt" className="mb-1 block text-sm text-slate-300">Excerpt</label>
            <textarea
              id="excerpt"
              rows={3}
              value={excerpt}
              onChange={(event) => setExcerpt(event.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="coverImage" className="mb-1 block text-sm text-slate-300">Replace cover image (optional)</label>
            {currentCoverImageURL && !coverImage && (
              <p className="mb-2 text-xs text-slate-500">Current cover image is set.</p>
            )}
            <input
              id="coverImage"
              type="file"
              accept="image/*"
              onChange={(event) => setCoverImage(event.target.files?.[0] ?? null)}
              className="w-full text-sm text-slate-300 file:mr-3 file:rounded-md file:border-0 file:bg-sky-600 file:px-3 file:py-2 file:text-white hover:file:bg-sky-500"
            />
          </div>

          <div>
            <label htmlFor="content" className="mb-1 block text-sm text-slate-300">Content</label>
            <textarea
              id="content"
              rows={14}
              value={content}
              onChange={(event) => setContent(event.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:bg-slate-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500 disabled:opacity-60"
            >
              {isSubmitting ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
