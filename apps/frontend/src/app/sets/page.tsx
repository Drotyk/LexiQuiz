'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { WordSetDto, PaginatedWordSetsDto } from '@wordforge/shared-types';
import { Plus, Search, Layers, Lock, Globe, Link2, BookOpen, Trash2, Edit3 } from 'lucide-react';

export default function WordSetsListPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();

  const [setsData, setSetsData] = useState<PaginatedWordSetsDto | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push('/login');
    }
  }, [user, isAuthLoading, router]);

  useEffect(() => {
    const fetchSets = async () => {
      if (!user) return;
      setIsLoading(true);
      try {
        const response = await api.get('/word-sets', {
          params: { page, limit: 12, search: search || undefined },
        });
        setSetsData(response.data);
      } catch {
        // Error handling
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(() => {
      if (user) fetchSets();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, page, user]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this word set?')) return;

    try {
      await api.delete(`/word-sets/${id}`);
      setPage((prev) => (prev === 1 ? 1 : 1));
    } catch {
      alert('Failed to delete word set');
    }
  };

  if (isAuthLoading || !user) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-gray-400 font-mono animate-pulse">Loading sets...</div>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <Layers className="w-8 h-8 text-gray-400" />
            My Word Sets
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Organize your vocabulary collections and study material
          </p>
        </div>

        <Link
          href="/sets/new"
          className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-gray-500 hover:bg-gray-400 text-white font-semibold text-sm transition shadow-lg shadow-gray-500/20"
        >
          <Plus className="w-5 h-5" />
          <span>Create New Set</span>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="relative">
        <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search word sets by title or description..."
          className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-900 border border-gray-800 focus:border-gray-500 focus:ring-1 focus:ring-gray-500 text-white placeholder-gray-500 text-sm outline-none transition shadow-inner"
        />
      </div>

      {/* Grid of Word Sets */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="h-48 rounded-2xl bg-gray-900/60 border border-gray-800 animate-pulse p-6"
            />
          ))}
        </div>
      ) : setsData?.data.length === 0 ? (
        <div className="bg-gray-900/40 border border-gray-800/80 rounded-2xl p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-gray-800/80 text-gray-500 flex items-center justify-center mx-auto text-2xl">
            <BookOpen className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white">No word sets found</h3>
          <p className="text-gray-400 text-sm max-w-sm mx-auto">
            {search
              ? 'No word sets matched your search criteria. Try a different keyword.'
              : 'You haven\'t created any word sets yet. Create your first set to start adding words!'}
          </p>
          {!search && (
            <Link
              href="/sets/new"
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-gray-500/10 text-gray-400 border border-gray-500/20 font-medium text-sm hover:bg-gray-500/20 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Create Word Set</span>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {setsData?.data.map((set: WordSetDto) => (
            <Link
              key={set.id}
              href={`/sets/${set.id}`}
              className="group bg-gray-900 border border-gray-800 hover:border-gray-500/50 rounded-2xl p-6 flex flex-col justify-between transition-all duration-200 hover:shadow-xl hover:shadow-gray-500/5 relative overflow-hidden"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-800 text-gray-300 uppercase tracking-wider">
                    {set.sourceLanguage} → {set.targetLanguage}
                  </span>
                  <div className="flex items-center space-x-2 text-gray-400">
                    {set.visibility === 'private' && (
                      <span title="Private">
                        <Lock className="w-4 h-4" />
                      </span>
                    )}
                    {set.visibility === 'link' && (
                      <span title="Accessible via Link">
                        <Link2 className="w-4 h-4 text-gray-400" />
                      </span>
                    )}
                    {set.visibility === 'public' && (
                      <span title="Public">
                        <Globe className="w-4 h-4 text-gray-400" />
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-white group-hover:text-gray-400 transition-colors line-clamp-1">
                  {set.title}
                </h3>

                <p className="text-gray-400 text-sm line-clamp-2 min-h-[2.5rem]">
                  {set.description || 'No description provided.'}
                </p>
              </div>

              <div className="pt-6 border-t border-gray-800/80 flex items-center justify-between mt-4 text-xs text-gray-400">
                <span className="flex items-center gap-1 font-medium">
                  <BookOpen className="w-3.5 h-3.5 text-gray-400" />
                  {set.wordCount || 0} words
                </span>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      router.push(`/sets/${set.id}/edit`);
                    }}
                    className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition"
                    title="Edit Set"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => handleDelete(set.id, e)}
                    className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-gray-400 transition"
                    title="Delete Set"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {setsData && setsData.totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 pt-4">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-4 py-2 rounded-xl bg-gray-900 border border-gray-800 disabled:opacity-40 text-sm font-medium text-gray-300 hover:bg-gray-800 transition"
          >
            Previous
          </button>
          <span className="text-sm text-gray-400 font-mono">
            Page {setsData.page} of {setsData.totalPages}
          </span>
          <button
            disabled={page >= setsData.totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 rounded-xl bg-gray-900 border border-gray-800 disabled:opacity-40 text-sm font-medium text-gray-300 hover:bg-gray-800 transition"
          >
            Next
          </button>
        </div>
      )}
    </main>
  );
}
