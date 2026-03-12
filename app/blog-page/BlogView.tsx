"use client";

import Image from "next/image";
import Link from "next/link";
import { FaPen, FaArrowLeft } from "react-icons/fa";
import { LuTrash } from "react-icons/lu";
import { useEffect, useState } from "react";
import { notFound, useRouter } from "next/navigation";
import { getPostsBySlug } from "@/app/server-actions/getPosts";
import HomeButton from "@/app/components/general/HomeButton";
import axios from 'axios';
import toast from 'react-hot-toast';
import { authClient } from '@/lib/auth-client';

interface BlogViewProps {
  slug: string;
}

interface Post {
  id: string;
  title: string;
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

export default function BlogView({ slug }: BlogViewProps) {
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const { data: session } = authClient.useSession();

  // Check if current user is the author
  const isAuthor = session?.user?.id === post?.author.id;

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getPostsBySlug(slug);
        
        if (!data) {
          setError("Post not found");
          return;
        }
        
        setPost(data);
      } catch (err) {
        console.error("Error fetching post:", err);
        setError("Failed to load post. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  const handleDelete = async () => {
    if (!post) return;
    
    const confirmed = window.confirm(
      "Tem certeza que deseja excluir este artigo? Esta ação não pode ser desfeita."
    );
    
    if (!confirmed) return;

    try {
      setIsDeleting(true);
      
      await axios.delete(`/api/posts/${post.slug}`);
      
      toast.success('Artigo excluído com sucesso!', {
        duration: 3000,
        style: {
          background: '#10b981',
          color: '#fff',
        },
      });
      
      setTimeout(() => {
        router.push("/articles");
      }, 1000);
    } catch (err) {
      console.error("Error deleting post:", err);
      toast.error('Falha ao excluir artigo. Por favor, tente novamente.', {
        duration: 4000,
        style: {
          background: '#ef4444',
          color: '#fff',
        },
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin mb-4">
            <div className="w-12 h-12 border-4 border-gray-700 border-t-blue-500 rounded-full mx-auto"></div>
          </div>
          <p className="text-gray-400">Carregando artigo...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Post Não Encontrado</h2>
          <p className="text-gray-400 mb-6">{error || "O artigo que você está procurando não existe."}</p>
          <Link
            href="/articles"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full transition-all"
          >
            <FaArrowLeft size={16} />
            Voltar aos Artigos
          </Link>
        </div>
      </div>
    );
  }

  const formattedDate = post.createdAt
    ? new Date(post.createdAt).toLocaleDateString("pt-BR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Data desconhecida";

  return (
    <div>
      <article className="max-w-4xl mx-auto py-12 md:py-20 px-4 sm:px-6">
        {/* Home Button - Top */}
        <div className='mb-8'>
          <HomeButton />
        </div>
        {/* Back Button */}
        <div className="mb-8">
          <Link
            href="/articles"
            className="group inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors duration-300"
          >
            <FaArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform duration-300" />
            <span className="font-medium">Voltar aos Artigos</span>
          </Link>
        </div>

        {/* Header Section */}
        <header className="mb-12 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight mb-6">
            {post.title}
          </h1>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-sm sm:text-base text-gray-400">
            <span className="font-semibold text-gray-300">Por {post.author.name || "Autor Desconhecido"}</span>
            <span className="hidden sm:inline">•</span>
            <span>{formattedDate}</span>
          </div>
        </header>

        {/* Featured Image */}
        {post.coverImageURL && (
          <div className="relative w-full h-64 sm:h-80 lg:h-105 mb-12 rounded-2xl overflow-hidden shadow-xl border border-gray-700">
            <Image
              src={post.coverImageURL}
              alt={post.title}
              fill
              priority
              sizes="(min-width: 1024px) 900px, (min-width: 640px) 90vw, 100vw"
              className="object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>
        )}

        {/* Article Content */}
        <div className="prose prose-invert max-w-none mb-12">
          <div className="text-gray-300 leading-8 whitespace-pre-wrap">
            {post.content}
          </div>
        </div>

        {/* Author Section */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-linear-to-r from-gray-900/50 to-blue-900/20 rounded-xl border border-gray-700 mt-12">
          <div className="flex items-center gap-3">
            {post.author.image ? (
              <Image
                src={post.author.image}
                alt={post.author.name || "Author"}
                width={48}
                height={48}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-linear-to-br from-blue-500 to-purple-500"></div>
            )}
            <div>
              <p className="text-white font-semibold">{post.author.name || "Autor Desconhecido"}</p>
              <p className="text-gray-400 text-sm">Desenvolvedor Full Stack</p>
            </div>
          </div>
                <Link href={`https://www.instagram.com/easy_ese_1/${post.author.name?.replace(" ", "") || "author"}`} target="_blank" rel="noopener noreferrer">
          <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full transition-all duration-300 hover:scale-105">
            Seguir Autor
          </button>
          </Link>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8">
          <Link
            href="/articles"
            className="group inline-flex items-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-full transition-all duration-300 shadow-lg hover:shadow-gray-500/50 hover:scale-105 border border-gray-600"
          >
            <FaArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform duration-300" />
            <span>Voltar aos Artigos</span>
          </Link>

          {isAuthor && (
            <div className="flex gap-3">
              <Link
                href={`/write/edit/${post.slug}`}
                className="group inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-full transition-all duration-300 shadow-lg hover:shadow-blue-500/50 hover:scale-105"
              >
                <FaPen size={16} className="group-hover:rotate-12 transition-transform duration-300" />
                <span>Editar Artigo</span>
              </Link>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="group inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-600 text-white font-semibold rounded-full transition-all duration-300 shadow-lg hover:shadow-red-500/50 hover:scale-105 disabled:scale-100"
              >
                <LuTrash size={16} className="group-hover:rotate-12 transition-transform duration-300" />
                <span>{isDeleting ? "Excluindo..." : "Excluir"}</span>
              </button>
            </div>
          )}
        </div>
        
        {/* Home Button - Bottom */}
        <div className='mt-12 flex justify-center'>
          <HomeButton />
        </div>
      </article>
    </div>
  );
}
