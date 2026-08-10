'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { WordSetDto } from '@wordforge/shared-types';
import { ArrowLeft, HelpCircle, Play, Layers } from 'lucide-react';

export default function QuizSetupPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();

  const [sets, setSets] = useState<WordSetDto[]>([]);
  const [selectedSetId, setSelectedSetId] = useState('');
  const [questionCount, setQuestionCount] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);

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
        const response = await api.get('/word-sets', { params: { limit: 100 } });
        setSets(response.data.data);
        if (response.data.data.length > 0) {
          setSelectedSetId(response.data.data[0].id);
        }
      } catch {
        // Handled
      } finally {
        setIsLoading(false);
      }
    };

    fetchSets();
  }, [user]);

  const handleStartQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSetId) return;
    setIsStarting(true);

    try {
      const response = await api.post('/quizzes', {
        setId: selectedSetId,
        questionCount,
      });

      router.push(`/quiz/${response.data.id}`);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to start quiz session');
    } finally {
      setIsStarting(false);
    }
  };

  if (isAuthLoading || isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-gray-400 font-mono animate-pulse">Loading quiz setup...</div>
      </div>
    );
  }

  return (
    <main className="max-w-xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <Link
        href="/sets"
        className="inline-flex items-center space-x-2 text-sm font-medium text-gray-400 hover:text-white transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Word Sets</span>
      </Link>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex items-center space-x-3 border-b border-gray-800 pb-4">
          <div className="p-3 rounded-xl bg-gray-500/10 text-gray-400">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Interactive Quiz</h1>
            <p className="text-gray-400 text-sm">Test your vocabulary with 4 question modes</p>
          </div>
        </div>

        {sets.length === 0 ? (
          <div className="text-center py-6 text-gray-400 text-sm space-y-3">
            <p>You need at least one word set with words to start a quiz.</p>
            <Link
              href="/sets/new"
              className="inline-block px-4 py-2 rounded-xl bg-gray-500 text-white font-semibold"
            >
              Create Word Set
            </Link>
          </div>
        ) : (
          <form onSubmit={handleStartQuiz} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-2">
                <Layers className="w-4 h-4 text-gray-400" />
                Select Word Set
              </label>
              <select
                value={selectedSetId}
                onChange={(e) => setSelectedSetId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 focus:border-gray-500 focus:ring-1 focus:ring-gray-500 text-white text-sm outline-none transition"
              >
                {sets.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title} ({s.sourceLanguage} → {s.targetLanguage})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Number of Questions
              </label>
              <select
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 focus:border-gray-500 focus:ring-1 focus:ring-gray-500 text-white text-sm outline-none transition"
              >
                <option value={5}>5 Questions (Quick Test)</option>
                <option value={10}>10 Questions (Standard)</option>
                <option value={20}>20 Questions (Deep Review)</option>
              </select>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isStarting}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-gray-500 to-gray-500 hover:from-gray-400 hover:to-gray-400 text-white font-bold text-sm transition shadow-lg shadow-gray-500/20 flex items-center justify-center space-x-2"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>{isStarting ? 'Starting Quiz...' : 'Start Quiz Now'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
