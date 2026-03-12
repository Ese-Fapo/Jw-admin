'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useModalStore } from '@/app/store/useModalStore';
import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import axios from 'axios';

interface SearchResult {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImageURL: string | null;
}

export default function Navbar() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { openSignIn } = useModalStore();

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Articles', href: '/articles' },
    { name: 'About', href: '/about' },
    { name: 'Write', href: '/write' },
  ];
  const { data: session } = authClient.useSession();

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        setIsSearching(true);
        try {
          const response = await axios.get(`/api/posts/search?q=${encodeURIComponent(searchQuery)}&limit=5`);
          setSearchResults(response.data.posts || []);
        } catch (error) {
          console.error('Search error:', error);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchResultClick = (slug: string) => {
    setSearchQuery('');
    setSearchResults([]);
    router.push(`/articles/${slug}`);
  };

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/articles?q=${encodeURIComponent(searchQuery.trim())}`);
    setSearchResults([]);
    setSearchQuery('');
  };
       
  return (
    <nav className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur">
      <div className="content-wrap">
        <div className="flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-lg font-semibold tracking-tight text-white">
              Tech Blog
            </Link>

            <div className="hidden md:flex items-center gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-sm text-slate-300 transition hover:text-white"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search posts..."
                className="w-56 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none"
              />
            </form>
            <button
              onClick={openSignIn}
              className="rounded-lg bg-sky-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-sky-500"
            >
              {session?.user ? 'Account' : 'Login'}
            </button>
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-200"
              aria-label="Alternar menu"
            >
              Menu
            </button>
          </div>
        </div>
      </div>

      <div
        className={`md:hidden overflow-hidden border-t border-slate-800 transition-all ${
          isMenuOpen ? 'max-h-96' : 'max-h-0'
        }`}
      >
        <div className="content-wrap py-4 space-y-3">
          <form onSubmit={handleSearchSubmit}>
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search posts..."
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none"
            />
          </form>

          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setIsMenuOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-slate-900 hover:text-white"
            >
              {link.name}
            </Link>
          ))}

          <button
            onClick={() => {
              openSignIn();
              setIsMenuOpen(false);
            }}
            className="w-full rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500"
          >
            {session?.user ? 'Account' : 'Login'}
          </button>
        </div>
      </div>

      {searchQuery.trim().length >= 2 && (
        <div className="border-t border-slate-800 bg-slate-950">
          <div className="content-wrap py-3">
            {isSearching ? (
              <p className="text-sm text-slate-400">Searching...</p>
            ) : searchResults.length > 0 ? (
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {searchResults.map((result) => (
                  <button
                    key={result.id}
                    onClick={() => handleSearchResultClick(result.slug)}
                    className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-left hover:border-slate-700"
                  >
                    <p className="line-clamp-1 text-sm font-medium text-slate-100">{result.title}</p>
                    <p className="line-clamp-1 text-xs text-slate-400">{result.excerpt ?? 'No excerpt'}</p>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400">No posts found.</p>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}