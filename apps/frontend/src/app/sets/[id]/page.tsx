'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { WordSetDto } from '@wordforge/shared-types';
import { ArrowLeft, BookOpen, Edit3, Trash2, Layers, Plus, Play, Lock, Globe, Link2 } from 'lucide-react';

export default function WordSetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { user, isLoading: isAuthLoading } = useAuth();

  const [set, setSet] = useState<WordSetDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push('/login');
    }
  }, [user, isAuthLoading, router]);

  useEffect(() => {
    const fetchSet = async () => {
      if (!id || !user) return;
      setIsLoading(true);
      try {
        const response = await api.get(`/word-sets/${id}`);
        setSet(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Word set not found or access forbidden.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSet();
  }, [id, user]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this word set?')) return;
    try {
      await api.delete(`/word-sets/${id}`);
      router.push('/sets');
    } catch {
      alert('Failed to delete word set');
    }
  };

  if (isAuthLoading || isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-slate-400 font-mono animate-pulse">Loading set details...</div>
      </div>
    );
  }

  if (error || !set) {
    return (
      <main className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <Link
          href="/sets"
          className="inline-flex items-center space-x-2 text-sm font-medium text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Word Sets</span>
        </Link>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-4">
          <div className="text-rose-400 font-bold text-lg">Error loading set</div>
          <p className="text-slate-400 text-sm">{error}</p>
        </div>
      </main>
    );
  }

  const isOwner = user?.id === set.userId;

  return (
    <main className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      <Link
        href="/sets"
        className="inline-flex items-center space-x-2 text-sm font-medium text-slate-400 hover:text-white transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Word Sets</span>
      </Link>

      {/* Hero card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20 uppercase tracking-wider">
                {set.sourceLanguage} → {set.targetLanguage}
              </span>
              <div className="flex items-center space-x-1.5 text-slate-400 text-xs font-medium">
                {set.visibility === 'private' && (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>Private</span>
                  </>
                )}
                {set.visibility === 'link' && (
                  <>
                    <Link2 className="w-3.5 h-3.5 text-sky-400" />
                    <span>Link Access</span>
                  </>
                )}
                {set.visibility === 'public' && (
                  <>
                    <Globe className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Public</span>
                  </>
                )}
              </div>
            </div>

            <h1 className="text-3xl font-extrabold text-white tracking-tight">{set.title}</h1>
            {set.description && (
              <p className="text-slate-300 text-base leading-relaxed">{set.description}</p>
            )}
          </div>

          {isOwner && (
            <div className="flex items-center space-x-2">
              <Link
                href={`/sets/${set.id}/edit`}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-sm transition border border-slate-700"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit Set</span>
              </Link>
              <button
                onClick={handleDelete}
                className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 font-medium text-sm transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Study actions & Stats */}
        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-6 text-sm text-slate-400 w-full sm:w-auto">
            <span className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-sky-400" />
              <strong className="text-white font-semibold">{set.wordCount || 0}</strong> Words
            </span>
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <Link
              href={`/study/${set.id}`}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-semibold text-sm transition shadow-lg shadow-sky-500/20"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Study Cards</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Words Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-sky-400" />
            Words in this set ({set.wordCount || 0})
          </h2>

          {isOwner && (
            <button
              onClick={() => router.push(`/sets/${set.id}/edit`)}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 font-medium text-sm transition border border-slate-700"
            >
              <Plus className="w-4 h-4" />
              <span>Add Words</span>
            </button>
          )}
        </div>

        <div className="p-8 text-center bg-slate-950/60 border border-slate-800/80 rounded-xl space-y-3">
          <p className="text-slate-400 text-sm">
            Words module and bulk import will be available in <strong>Phase 4</strong>.
          </p>
        </div>
      </div>
    </main>
  );
}
