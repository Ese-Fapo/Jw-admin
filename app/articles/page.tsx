"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ChangeEvent } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImageURL: string | null;
  createdAt: string;
  author?: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

interface PostsResponse {
  posts: Post[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasMore: boolean;
    nextPage: number | null;
  };
}

const fetchPosts = async ({ pageParam = 1 }): Promise<PostsResponse> => {
  const response = await fetch(`/api/posts?page=${pageParam}&limit=9`);
  if (!response.ok) throw new Error("Failed to fetch posts");
  return response.json();
};

const searchPosts = async (query: string): Promise<{ posts: Post[] }> => {
  const response = await fetch(`/api/posts/search?q=${encodeURIComponent(query)}&limit=20`);
  if (!response.ok) throw new Error("Failed to search posts");
  return response.json();
};

export default function ArticlesPage() {
  const [query, setQuery] = useState("");

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ["posts"],
    queryFn: fetchPosts,
    getNextPageParam: (lastPage: PostsResponse) => lastPage.pagination.nextPage,
    initialPageParam: 1,
  });

  const {
    data: searchData,
    isFetching: isSearching,
    isError: isSearchError,
  } = useQuery({
    queryKey: ["search-posts", query],
    queryFn: () => searchPosts(query),
    enabled: query.trim().length >= 2,
  });

  const paginatedPosts = useMemo(
    () => data?.pages.flatMap((page: PostsResponse) => page.posts) ?? [],
    [data]
  );
  const displayedPosts = query.trim().length >= 2 ? searchData?.posts ?? [] : paginatedPosts;

  return (
    <section className="content-wrap py-10 sm:py-14">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white sm:text-4xl">Articles</h1>
        <p className="mt-2 text-sm text-slate-400">Clean listing UI using your existing backend endpoints.</p>
      </div>

      <div className="mb-6">
        <input
          value={query}
          onChange={(event: ChangeEvent<HTMLInputElement>) => setQuery(event.target.value)}
          placeholder="Search by title, content, or excerpt"
          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none"
        />
      </div>

      {(isLoading || (query.trim().length >= 2 && isSearching)) && (
        <p className="text-sm text-slate-400">Loading posts...</p>
      )}

      {(isError || isSearchError) && (
        <p className="text-sm text-red-400">Could not load posts. Please try again.</p>
      )}

      {!isLoading && displayedPosts.length === 0 && (
        <p className="text-sm text-slate-400">No posts found.</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {displayedPosts.map((post) => (
          <article key={post.id} className="card p-4">
            <p className="text-xs text-slate-400">{new Date(post.createdAt).toLocaleDateString("pt-BR")}</p>
            <h2 className="mt-2 line-clamp-2 text-lg font-semibold text-white">{post.title}</h2>
            <p className="mt-2 line-clamp-3 text-sm text-slate-300">{post.excerpt ?? "No excerpt"}</p>
            {post.author?.name && <p className="mt-2 text-xs text-slate-500">By {post.author.name}</p>}
            <Link href={`/articles/${post.slug}`} className="mt-3 inline-block text-sm text-sky-400 hover:text-sky-300">
              Read article →
            </Link>
          </article>
        ))}
      </div>

      {query.trim().length < 2 && hasNextPage && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500 disabled:opacity-60"
          >
            {isFetchingNextPage ? "Loading..." : "Load more"}
          </button>
        </div>
      )}
    </section>
  );
}
