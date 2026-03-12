"use client";

import React from "react";
import ContainerLay from "@/PageLayout/ContainerLay";
import Image from "next/image";
import Link from "next/link";
import { useInfiniteQuery } from "@tanstack/react-query";
import HomeButton from "@/app/components/general/HomeButton";

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImageURL: string | null;
  createdAt: string;
  author: {
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

// Dramatic Loading Skeleton
const SkeletonCard = ({ index }: { index: number }) => (
  <div
    className="group relative bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl overflow-hidden shadow-xl border border-gray-700 animate-pulse"
    style={{ animationDelay: `${index * 150}ms` }}
  >
    {/* Skeleton Badge */}
    <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
      <div className="bg-gray-700 h-6 w-12 rounded-full"></div>
      <div className="bg-gray-700 h-6 w-20 rounded-full"></div>
    </div>

    {/* Skeleton Image */}
    <div className="relative w-full h-56 sm:h-64 bg-linear-to-r from-gray-800 to-gray-700 animate-shimmer overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent animate-loading-shimmer"></div>
    </div>

    {/* Skeleton Content */}
    <div className="p-6 space-y-4">
      <div className="h-6 bg-gray-700 rounded-lg w-3/4 animate-pulse"></div>
      <div className="h-4 bg-gray-700 rounded-lg w-full animate-pulse animation-delay-100"></div>
      <div className="h-4 bg-gray-700 rounded-lg w-5/6 animate-pulse animation-delay-200"></div>
      <div className="h-8 bg-gray-700 rounded-lg w-40 mt-4 animate-pulse animation-delay-300"></div>
    </div>

    {/* Shimmer Effect */}
    <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/5 to-transparent animate-loading-shimmer"></div>
  </div>
);

// Loading State Component
const ArticlesLoading = () => (
  <ContainerLay>
    <div className="space-y-8 sm:space-y-10 md:space-y-12">
      {/* Header Skeleton */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-gray-800 via-gray-700 to-gray-800 p-8 sm:p-10 md:p-12 lg:p-16 mt-6">
        <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/5 to-transparent animate-loading-shimmer"></div>
        <div className="relative z-10 space-y-4">
          <div className="h-12 bg-gray-700 rounded-lg w-3/4 animate-pulse"></div>
          <div className="h-6 bg-gray-700 rounded-lg w-full animate-pulse animation-delay-100"></div>
          <div className="h-6 bg-gray-700 rounded-lg w-2/3 animate-pulse animation-delay-200"></div>
          <div className="flex flex-wrap gap-3 mt-6">
            <div className="h-10 bg-gray-700 rounded-full w-24 animate-pulse animation-delay-300"></div>
            <div className="h-10 bg-gray-700 rounded-full w-28 animate-pulse animation-delay-400"></div>
          </div>
        </div>
      </div>

      {/* Articles Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {[0, 1, 2].map((index) => (
          <SkeletonCard key={index} index={index} />
        ))}
      </div>

      {/* Dramatic Loading Text */}
      <div className="text-center py-12 animate-fade-in">
        <div className="flex items-center justify-center gap-2 text-lg sm:text-2xl font-bold text-transparent bg-clip-text bg-linear-to-r from-blue-400 via-purple-400 to-pink-400 animate-pulse">
          <span className="animate-bounce" style={{ animationDelay: "0s" }}>🚀</span>
          <span className="animate-bounce" style={{ animationDelay: "0.2s" }}>
            Carregando artigos épicos...
          </span>
          <span className="animate-bounce" style={{ animationDelay: "0.4s" }}>
            ⚡
          </span>
        </div>
      </div>
    </div>
  </ContainerLay>
);

const fetchPosts = async ({ pageParam = 1 }): Promise<PostsResponse> => {
  const response = await fetch(`/api/posts?page=${pageParam}&limit=9`);
  if (!response.ok) {
    throw new Error("Failed to fetch posts");
  }
  return response.json();
};

export default function ArticlesPage() {
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
    getNextPageParam: (lastPage) => lastPage.pagination.nextPage,
    initialPageParam: 1,
  });

  if (isLoading) {
    return <ArticlesLoading />;
  }

  if (isError) {
    return (
      <ContainerLay>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Erro ao carregar artigos</h2>
            <p className="text-gray-400">Por favor, tente novamente mais tarde.</p>
          </div>
        </div>
      </ContainerLay>
    );
  }

  const allPosts = data?.pages.flatMap((page) => page.posts) ?? [];
  const totalCount = data?.pages[0]?.pagination.totalCount ?? 0;

  return (
    <ContainerLay>
      <div className="space-y-8 sm:space-y-10 md:space-y-12">
        {/* Home Button - Top */}
        <div className='pt-6'>
          <HomeButton />
        </div>
        {/* Header Section */}
        <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-blue-600 via-purple-600 to-blue-600 p-8 sm:p-10 md:p-12 lg:p-16 mt-6 animate-fade-in">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/20 rounded-full blur-2xl"></div>
          <div className="relative z-10">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 animate-slide-down">
              📚 Escolha um assunto que você ache interessante
            </h1>
            <p className="text-gray-100 text-base sm:text-lg md:text-xl max-w-2xl animate-slide-up animation-delay-200">
              Se você está começando um novo negócio, construindo sua marca pessoal ou buscando aumentar suas vendas, nós ajudamos você a entender qual solução de site melhor se encaixa nos seus objetivos.
            </p>
            <div className="flex flex-wrap gap-3 mt-6">
              <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm font-semibold">
                {totalCount} Artigos
              </span>
              <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm font-semibold">
                ⚡ Sempre Atualizado
              </span>
            </div>
          </div>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 animate-fade-in-up animation-delay-300">
          {allPosts.map((post, index) => {
            const formattedDate = new Date(post.createdAt).toLocaleDateString(
              "pt-BR",
              {
                year: "numeric",
                month: "long",
                day: "numeric",
              }
            );

            return (
              <article
                key={`article-${post.id}`}
                className="group relative bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-blue-500/50 transition-all duration-500 hover:scale-[1.02] border border-gray-700 hover:border-blue-500/50 animate-scale-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Badge */}
                <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
                  <span className="bg-linear-to-r from-blue-500 to-purple-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm">
                    #{index + 1}
                  </span>
                </div>

                {/* Image */}
                <div className="relative w-full h-56 sm:h-64 overflow-hidden">
                  <Image
                    src={post.coverImageURL || "/default-post.jpg"}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-110 group-hover:rotate-1 transition-all duration-700"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-gray-900 via-gray-900/50 to-transparent opacity-80"></div>

                  {/* Date Badge on Image */}
                  <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-2 rounded-full border border-white/20">
                    <span className="text-xl">📅</span>
                    <span className="text-white text-xs font-semibold">
                      {formattedDate}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h2 className="text-xl sm:text-2xl font-bold leading-tight group-hover:text-blue-400 transition-colors text-gray-100 mb-3 line-clamp-2 min-h-14">
                    {post.title}
                  </h2>

                  <p className="text-gray-400 mb-4 text-sm sm:text-base leading-relaxed line-clamp-3">
                    {post.excerpt || "Sem descrição disponível"}
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-2 mb-4">
                    {post.author.image ? (
                      <Image
                        src={post.author.image}
                        alt={post.author.name || "Author"}
                        width={24}
                        height={24}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-linear-to-br from-blue-500 to-purple-500"></div>
                    )}
                    <span className="text-gray-400 text-xs">
                      Por {post.author.name || "Autor Desconhecido"}
                    </span>
                  </div>

                  {/* Read More Link */}
                  <Link
                    href={`/articles/${post.slug}`}
                    className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm font-semibold group/link transition-all"
                  >
                    <span>Ler Artigo Completo</span>
                    <svg
                      className="w-4 h-4 group-hover/link:translate-x-2 transition-transform"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </Link>
                </div>

                {/* Hover Effect Gradient */}
                <div className="absolute inset-0 bg-linear-to-tr from-blue-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-blue-500/5 group-hover:via-purple-500/5 group-hover:to-pink-500/5 transition-all duration-500 pointer-events-none"></div>
              </article>
            );
          })}

          {/* Loading skeletons while fetching next page */}
          {isFetchingNextPage &&
            [0, 1, 2].map((index) => (
              <SkeletonCard key={`loading-skeleton-${index}`} index={index} />
            ))}
        </div>

        {/**load more btn */}
        {hasNextPage && (
          <div className="flex justify-center mt-10">
            <button
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="relative px-8 py-4 bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-600 text-white font-bold rounded-full transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-purple-500/50 hover:scale-110 disabled:scale-100 disabled:cursor-not-allowed disabled:shadow-none text-lg"
            >
              {isFetchingNextPage ? (
                <span className="flex items-center gap-2">
                  <span className="inline-block animate-spin">⚙️</span>
                  Preparando para o grande reveal...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <span>🎬 Carregar Mais Artigos Épicos</span>
                  <span className="animate-bounce">✨</span>
                </span>
              )}
            </button>
          </div>
        )}

        {/* Newsletter Section */}
        <div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-gray-900 via-blue-900 to-purple-900 p-8 sm:p-10 md:p-12 border border-blue-500/30 animate-fade-in-up">
          <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="relative z-10 text-center max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
              🔔 Não Perca Nenhum Artigo!
            </h2>
            <p className="text-gray-300 text-sm sm:text-base mb-6">
              Inscreva-se para receber notificações sobre novos artigos e
              conteúdos exclusivos.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <input
                type="email"
                placeholder="seu@email.com"
                className="px-6 py-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1 max-w-md"
              />
              <button className="px-8 py-3 bg-linear-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-blue-600 text-white font-semibold rounded-full transition-all duration-300 shadow-lg hover:shadow-blue-500/50 hover:scale-105">
                Inscrever-se
              </button>
            </div>
          </div>
        </div>
        
        {/* Home Button - Bottom */}
        <div className='flex justify-center pb-6'>
          <HomeButton />
        </div>
      </div>
    </ContainerLay>
  );
}
