import Link from "next/link";
import { getRecentPosts } from "@/app/server-actions/getPosts";

export default async function Home() {
  const recentPosts = await getRecentPosts(3).catch(() => []);

  return (
    <section className="content-wrap py-12 sm:py-16">
      <div className="card p-8 sm:p-10">
        <p className="text-sm uppercase tracking-wide text-sky-400">Clean frontend reset</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Same backend. Fresh frontend.
        </h1>
        <p className="mt-4 max-w-2xl text-slate-300">
          This interface was rebuilt to be simple and maintainable while keeping your
          existing API routes, auth flow, Prisma schema, and server logic exactly in place.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/articles" className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500">
            Browse articles
          </Link>
          <Link href="/write" className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-100 hover:bg-slate-900">
            Create post
          </Link>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold text-white">Recent posts</h2>

        {recentPosts.length === 0 ? (
          <p className="mt-3 text-sm text-slate-400">No posts yet. Create one from the Write page.</p>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recentPosts.map((post) => (
              <article key={post.id} className="card p-4">
                <p className="text-xs text-slate-400">
                  {new Date(post.createdAt).toLocaleDateString("pt-BR")}
                </p>
                <h3 className="mt-2 line-clamp-2 text-lg font-semibold text-white">{post.title}</h3>
                <p className="mt-2 line-clamp-3 text-sm text-slate-300">{post.excerpt ?? "No excerpt"}</p>
                <Link href={`/articles/${post.slug}`} className="mt-4 inline-block text-sm text-sky-400 hover:text-sky-300">
                  Read post →
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
