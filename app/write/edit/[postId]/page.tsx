


"use client";
import React, { useState, useEffect } from 'react'
import ContainerLay from '@/PageLayout/ContainerLay'
import axios from 'axios';
import toast from 'react-hot-toast';
import { authClient } from '@/lib/auth-client';
import HomeButton from '@/app/components/general/HomeButton';
import { useParams, useRouter } from 'next/navigation';

export default function EditPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params.postId as string;
  
  const [content, setContent] = useState('')
  const [title, setTitle] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [initialContent, setInitialContent] = useState('')
  const [initialTitle, setInitialTitle] = useState('')
  const [initialExcerpt, setInitialExcerpt] = useState('')
  const [coverImage, setCoverImage] = useState<File | null>(null)
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null)
  const [currentCoverImageURL, setCurrentCoverImageURL] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load session and post data
  useEffect(() => {
    let isActive = true;

    const loadData = async () => {
      try {
        // Check session
        const session = await authClient.getSession();
        if (!isActive) return;
        setIsAuthenticated(!!session.data?.user);

        // Fetch post data if authenticated
        if (session.data?.user) {
          const response = await axios.get(`/api/posts/${postId}`);
          if (!isActive) return;
          
          const post = response.data;
          setTitle(post.title || '');
          setContent(post.content || '');
          setExcerpt(post.excerpt || '');
          setInitialTitle(post.title || '');
          setInitialContent(post.content || '');
          setInitialExcerpt(post.excerpt || '');
          setCurrentCoverImageURL(post.coverImageURL || null);
        }
      } catch (error) {
        if (!isActive) return;
        console.error('Erro ao carregar dados:', error);
        toast.error('Erro ao carregar artigo');
        setIsAuthenticated(false);
      } finally {
        if (!isActive) return;
        setIsCheckingSession(false);
        setIsLoading(false);
      }
    };

    loadData();
    return () => {
      isActive = false;
    };
  }, [postId]);

  useEffect(() => {
    if (!coverImage) {
      if (coverImagePreview) {
        URL.revokeObjectURL(coverImagePreview);
      }
      setCoverImagePreview(null);
      return;
    }

    const objectUrl = URL.createObjectURL(coverImage);
    setCoverImagePreview(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [coverImage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const hasTitleChange = title !== initialTitle;
    const hasContentChange = content !== initialContent;
    const hasExcerptChange = excerpt !== initialExcerpt;
    const hasImageChange = !!coverImage;

    if (!hasTitleChange && !hasContentChange && !hasExcerptChange && !hasImageChange) {
      toast('Nada para atualizar.', { duration: 3000 });
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      if (hasTitleChange) formData.append('title', title);
      if (hasContentChange) formData.append('content', content);
      if (hasExcerptChange) formData.append('excerpt', excerpt);
      if (hasImageChange && coverImage) formData.append('coverImage', coverImage);

      const response = await axios.put(`/api/posts/${postId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Show success message
      toast.success('Artigo atualizado com sucesso!', {
        duration: 5000,
        style: {
          background: '#10b981',
          color: '#fff',
        },
      });

      // Redirect to the updated post
      setTimeout(() => {
        router.push(`/articles/${response.data.slug}`);
      }, 1000);

    } catch (error) {
      console.error('Erro ao atualizar artigo:', error);
      
      if (axios.isAxiosError(error)) {
        toast.error(
          `Erro ao atualizar o artigo: ${error.response?.data?.error || error.message}`, 
          { 
            duration: 8000,
            style: {
              background: '#ef4444',
              color: '#fff',
            },
          }
        );
      } else {
        toast.error('Erro desconhecido ao atualizar o artigo', {
          duration: 5000,
          style: {
            background: '#ef4444',
            color: '#fff',
          },
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  }
     
  return (
    <ContainerLay>
      <section className='max-w-4xl mx-auto py-12 sm:py-16 lg:py-20 px-4 sm:px-6'>
        {/* Home Button - Top */}
        <div className='mb-8'>
          <HomeButton />
        </div>
        {/* Header */}
        <div className='mb-12 animate-fade-in'>
          <h1 className='text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4'>
            Editar  <span className='text-blue-500'>artigo</span>
          </h1>
          <p className='text-lg text-gray-400'>
            Compartilhe seus conhecimentos e inspire nossa comunidade
          </p>
        </div>

        {isCheckingSession || isLoading ? (
          <div className='flex items-center justify-center py-16'>
            <div className='w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin' />
            <span className='ml-3 text-gray-400'>Carregando artigo...</span>
          </div>
        ) : !isAuthenticated ? (
          <div className='bg-gray-900/50 border border-gray-700 rounded-lg p-6 text-center'>
            <h2 className='text-xl font-semibold text-white mb-2'>Acesso restrito</h2>
            <p className='text-gray-400'>
              Você precisa estar logado para editar um artigo.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className='space-y-8'>
          {/* Title Input */}
          <div className='space-y-3'>
            <label htmlFor='title' className='block text-sm sm:text-base font-semibold text-gray-200'>
              Título do Artigo
            </label>
            <input
              type='text'
              id='title'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className='w-full px-4 sm:px-6 py-3 border border-gray-700 rounded-lg bg-gray-900/50 text-white text-sm sm:text-base placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200'
              placeholder='Digite o título do seu artigo...'
              disabled={isSubmitting}
            />
          </div>

          {/* Excerpt Input */}
          <div className='space-y-3'>
            <label htmlFor='excerpt' className='block text-sm sm:text-base font-semibold text-gray-200'>
              Resumo do Artigo
            </label>
            <textarea
              id='excerpt'
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              className='w-full px-4 sm:px-6 py-3 border border-gray-700 rounded-lg bg-gray-900/50 text-white text-sm sm:text-base placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none'
              placeholder='Digite um breve resumo do seu artigo...'
              rows={3}
              disabled={isSubmitting}
            />
          </div>

          {/* Image Upload */}
          <div className='space-y-3'>
            <label htmlFor='coverImage' className='block text-sm sm:text-base font-semibold text-gray-200'>
              Imagem de Capa {currentCoverImageURL && '(Opcional - deixe em branco para manter a atual)'}
            </label>
            {currentCoverImageURL && !coverImage && (
              <div className='mb-3'>
                <img 
                  src={currentCoverImageURL} 
                  alt="Current cover" 
                  className='w-full sm:max-w-md h-40 sm:h-48 object-cover rounded-lg border border-gray-700'
                />
                <p className='text-xs text-gray-400 mt-2'>Imagem atual</p>
              </div>
            )}
            {coverImagePreview && (
              <div className='mb-3'>
                <img
                  src={coverImagePreview}
                  alt="New cover preview"
                  className='w-full sm:max-w-md h-40 sm:h-48 object-cover rounded-lg border border-blue-500/60 shadow-lg'
                />
                <p className='text-xs text-blue-400 mt-2'>Pré-visualização da nova imagem</p>
              </div>
            )}
            <div className='relative'>
              <input
                type='file'
                accept='image/*'
                id='coverImage'
                onChange={(e) => setCoverImage(e.target.files?.[0] || null)}
                className='block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 transition-colors duration-200'
                disabled={isSubmitting}
              />
              {coverImage && (
                <p className='mt-2 text-sm text-gray-400'>
                  Nova imagem selecionada: <span className='text-blue-400'>{coverImage.name}</span>
                </p>
              )}
            </div>
          </div>

          {/* Rich Text Editor */}
          <div className='space-y-3'>
            <label className='block text-sm sm:text-base font-semibold text-gray-200'>
              Conteúdo do Artigo
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className='w-full px-4 sm:px-6 py-4 border border-gray-700 rounded-lg bg-gray-900/50 text-white text-sm sm:text-base placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 font-mono resize-none'
              placeholder='Digite o conteúdo do seu artigo aqui...'
              rows={15}
              disabled={isSubmitting}
            />
          </div>

          {/* Submit Button */}
          <div className='flex flex-col sm:flex-row gap-4 pt-6 justify-end'>
            <button
              type='button'
              onClick={() => router.back()}
              className='w-full sm:w-auto bg-gray-700 hover:bg-gray-600 text-white font-semibold px-8 py-3 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type='submit'
              className='w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold px-8 py-3 rounded-lg transition-all duration-200 transform sm:hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none'
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Atualizando...' : 'Atualizar Artigo'}
            </button>
          </div>
        </form>
        )}
        
        {/* Home Button - Bottom */}
        <div className='mt-12 flex justify-center'>
          <HomeButton />
        </div>
      </section>
    </ContainerLay>
  )
}

