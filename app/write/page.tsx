"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { authClient } from "@/lib/auth-client";

export default function WritePage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    let active = true;

    const loadSession = async () => {
      try {
        const session = await authClient.getSession();
        if (!active) return;
        setIsAuthenticated(Boolean(session.data?.user));
      } catch {
        if (!active) return;
        setIsAuthenticated(false);
      } finally {
        if (active) setIsCheckingSession(false);
      }
    };

    loadSession();
    return () => {
      active = false;
    };
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!title || !excerpt || !content || !coverImage) {
      toast.error("Please fill all fields including the cover image.");
      return;
    }

    try {
      setIsSubmitting(true);

      const formData = new FormData();
      formData.append("title", title);
      formData.append("excerpt", excerpt);
      formData.append("content", content);
      formData.append("coverImage", coverImage);

      const response = await fetch("/api/posts", {
        method: "POST",
        body: formData,
      });

      const body = await response.json();
      if (!response.ok) {
        throw new Error(body.error ?? "Failed to create post");
      }

      toast.success("Post published successfully");
      router.push(`/articles/${body.slug}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to publish post";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="content-wrap py-10 sm:py-14">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white sm:text-4xl">Write post</h1>
        <p className="mt-2 text-sm text-slate-400">Uses your existing authenticated POST /api/posts endpoint.</p>
      </div>

      {isCheckingSession ? (
        <p className="text-sm text-slate-400">Checking session...</p>
      ) : !isAuthenticated ? (
        <div className="card p-5">
          <p className="text-sm text-slate-300">You need to be logged in to create a post.</p>
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
              placeholder="Post title"
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
              placeholder="Short summary"
            />
          </div>

          <div>
            <label htmlFor="coverImage" className="mb-1 block text-sm text-slate-300">Cover image</label>
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
              placeholder="Write the full article content"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                setTitle("");
                setExcerpt("");
                setContent("");
                setCoverImage(null);
              }}
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:bg-slate-900"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500 disabled:opacity-60"
            >
              {isSubmitting ? "Publishing..." : "Publish post"}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
