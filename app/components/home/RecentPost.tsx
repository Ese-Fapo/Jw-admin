import Image from "next/image";
import Link from "next/link";
import { getRecentPosts } from "@/app/server-actions/getPosts";

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', { 
    day: '2-digit', 
    month: 'long', 
    year: 'numeric' 
  });
}

function calculateReadTime(excerpt: string | null): string {
  if (!excerpt) return "1 min de leitura";
  const wordsPerMinute = 200;
  const wordCount = excerpt.split(' ').length;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return `${minutes} min de leitura`;
}

export default async function RecentPost() {
  let posts = [] as Awaited<ReturnType<typeof getRecentPosts>>;
  try {
    posts = await getRecentPosts(3);
  } catch (error) {
    console.error("Failed to fetch recent posts:", error);
    posts = [];
  }
  return (
    <div className="space-y-4 sm:space-y-6 px-4 sm:px-6 lg:px-0">
      <h2 className="semi-bold text-gray-200 text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
        Publicações Recentes
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 lg:gap-6">
        {posts.map((post, index: number) => {
          return (
            <div
              key={post.id}
              className="group relative bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 rounded-lg sm:rounded-xl overflow-hidden shadow-lg sm:shadow-xl hover:shadow-2xl hover:shadow-blue-500/50 transition-all duration-500 md:hover:scale-105 border border-gray-700 hover:border-blue-500/50"
            >
              <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 bg-blue-500 text-white text-[10px] sm:text-xs font-bold px-2 py-0.5 sm:px-3 sm:py-1 rounded-full shadow-lg">
                #{index + 1}
              </div>
              <div className="relative w-full h-44 sm:h-48 md:h-52 lg:h-48 overflow-hidden">
                <Image
                  src={post.coverImageURL || "/default-post.jpg"}
                  alt={post.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-linear-to-t from-gray-900 via-transparent to-transparent opacity-60"></div>
              </div>
              <div className="p-4 sm:p-5 md:p-6">
                <div className="inline-block text-[10px] sm:text-xs text-blue-400 font-semibold mb-2 px-2 sm:px-3 py-0.5 sm:py-1 bg-blue-500/10 rounded-full border border-blue-500/30">
                  Tecnologia
                </div>
                <h3 className="text-base sm:text-lg font-bold leading-snug group-hover:text-blue-400 transition-colors text-gray-200 mb-2 sm:mb-3 line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-gray-400 mb-3 sm:mb-4 text-xs sm:text-sm leading-relaxed line-clamp-3">{post.excerpt}</p>
                <Link href={`/articles/${post.slug}`} className="text-blue-400 hover:text-blue-300 text-xs sm:text-sm font-semibold mb-3 sm:mb-4 inline-flex items-center gap-1 group/link">
                  Ler mais <span className="group-hover/link:translate-x-1 transition-transform">→</span>
                </Link>
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 sm:gap-0 text-[10px] sm:text-xs text-gray-500 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-700">
                  <span className="flex items-center gap-1">📅 {formatDate(post.createdAt.toString())}</span>
                  <span className="flex items-center gap-1">⏱️ {calculateReadTime(post.excerpt)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
