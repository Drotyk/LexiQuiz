'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { StudyCardDto, LearningRating } from '@wordforge/shared-types';
import {
  ArrowLeft,
  RotateCw,
  Eye,
  CheckCircle,
  Award,
  Sparkles,
  Volume2,
  BookOpen,
} from 'lucide-react';

export default function StudyCardsPage() {
  const params = useParams();
  const router = useRouter();
  const setId = params?.setId as string;
  const { user, isLoading: isAuthLoading } = useAuth();

  const [cards, setCards] = useState<StudyCardDto[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [reviewedCount, setReviewedCount] = useState(0);

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push('/login');
    }
  }, [user, isAuthLoading, router]);

  const fetchCards = useCallback(async () => {
    if (!setId || !user) return;
    setIsLoading(true);
    try {
      const response = await api.get(`/learning/sets/${setId}/cards`);
      setCards(response.data);
    } catch {
      // Error handling
    } finally {
      setIsLoading(false);
    }
  }, [setId, user]);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  const currentCard = cards[currentIndex];

  const handleReview = useCallback(
    async (rating: LearningRating) => {
      if (!currentCard) return;

      try {
        await api.post(`/learning/words/${currentCard.word.id}/review`, {
          rating,
        });
        setReviewedCount((prev) => prev + 1);

        if (currentIndex + 1 < cards.length) {
          setIsFlipped(false);
          setCurrentIndex((prev) => prev + 1);
        } else {
          setIsCompleted(true);
        }
      } catch {
        alert('Failed to submit review');
      }
    },
    [currentCard, currentIndex, cards.length],
  );

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isCompleted || cards.length === 0) return;

      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (isFlipped) {
        if (e.key === '1') handleReview(LearningRating.AGAIN);
        if (e.key === '2') handleReview(LearningRating.HARD);
        if (e.key === '3') handleReview(LearningRating.GOOD);
        if (e.key === '4') handleReview(LearningRating.EASY);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFlipped, isCompleted, cards.length, currentIndex, handleReview]);

  if (isAuthLoading || isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-slate-400 font-mono animate-pulse">Preparing flashcards...</div>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <main className="max-w-xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <Link
          href={`/sets/${setId}`}
          className="inline-flex items-center space-x-2 text-sm font-medium text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Word Set</span>
        </Link>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-4">
          <BookOpen className="w-12 h-12 text-slate-500 mx-auto" />
          <h2 className="text-xl font-bold text-white">No words in this set</h2>
          <p className="text-slate-400 text-sm">
            Add words to this set before starting flashcard study session.
          </p>
          <Link
            href={`/sets/${setId}`}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-sky-500 text-white font-semibold text-sm hover:bg-sky-400 transition"
          >
            Go Add Words
          </Link>
        </div>
      </main>
    );
  }

  if (isCompleted) {
    return (
      <main className="max-w-xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-6 shadow-2xl">
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto text-4xl">
            <Award className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-extrabold text-white">Session Completed!</h2>
            <p className="text-slate-400 text-sm">
              You reviewed <strong className="text-white">{reviewedCount}</strong> words in this session.
            </p>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row justify-center gap-3">
            <button
              onClick={() => {
                setCurrentIndex(0);
                setIsFlipped(false);
                setIsCompleted(false);
                setReviewedCount(0);
              }}
              className="inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm transition border border-slate-700"
            >
              <RotateCw className="w-4 h-4" />
              <span>Study Again</span>
            </button>
            <Link
              href={`/sets/${setId}`}
              className="inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-semibold text-sm transition shadow-lg shadow-sky-500/20"
            >
              <span>Back to Set</span>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const progressPercent = Math.round(((currentIndex + 1) / cards.length) * 100);

  return (
    <main className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 flex flex-col min-h-[calc(100vh-5rem)]">
      {/* Top Header & Progress */}
      <div className="flex items-center justify-between">
        <Link
          href={`/sets/${setId}`}
          className="inline-flex items-center space-x-2 text-sm font-medium text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Study</span>
        </Link>
        <span className="text-xs font-mono font-semibold text-slate-400">
          Card {currentIndex + 1} of {cards.length}
        </span>
      </div>

      <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
        <div
          className="bg-gradient-to-r from-sky-500 to-indigo-500 h-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Main Interactive Flip Card Container */}
      <div className="flex-1 flex flex-col justify-center my-4">
        <div
          onClick={() => setIsFlipped((prev) => !prev)}
          className={`w-full min-h-[320px] sm:min-h-[380px] bg-slate-900 border ${
            isFlipped ? 'border-sky-500/50 shadow-sky-500/10' : 'border-slate-800'
          } rounded-3xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 transform shadow-2xl relative select-none group hover:scale-[1.01]`}
        >
          <span className="absolute top-4 right-4 text-xs font-mono text-slate-500 group-hover:text-slate-400">
            Click or Space to flip ↵
          </span>

          {!isFlipped ? (
            /* FRONT SIDE OF CARD */
            <div className="space-y-4 my-auto">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                Term
              </span>
              <h2 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
                {currentCard.word.term}
              </h2>
              {currentCard.word.transcription && (
                <p className="text-lg text-sky-300/80 font-mono">
                  {currentCard.word.transcription}
                </p>
              )}
            </div>
          ) : (
            /* BACK SIDE OF CARD */
            <div className="space-y-6 my-auto max-w-md w-full animate-fadeIn">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Translation
              </span>
              <h3 className="text-3xl sm:text-4xl font-extrabold text-emerald-400">
                {currentCard.word.translation}
              </h3>

              {currentCard.word.example && (
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-slate-300 text-sm italic">
                  &quot;{currentCard.word.example}&quot;
                </div>
              )}

              {currentCard.word.note && (
                <div className="text-xs text-slate-400 bg-slate-800/40 p-2.5 rounded-xl border border-slate-800">
                  Note: {currentCard.word.note}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Control Buttons */}
      {!isFlipped ? (
        <button
          onClick={() => setIsFlipped(true)}
          className="w-full py-4 rounded-2xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-base transition shadow-xl shadow-sky-500/20 flex items-center justify-center space-x-2"
        >
          <Eye className="w-5 h-5" />
          <span>Показати відповідь (Show Answer)</span>
        </button>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => handleReview(LearningRating.AGAIN)}
            className="py-3 px-2 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 font-bold text-sm transition flex flex-col items-center justify-center space-y-0.5 active:scale-95"
          >
            <span>Не знаю</span>
            <span className="text-[10px] opacity-75 font-normal">Again [1]</span>
          </button>

          <button
            onClick={() => handleReview(LearningRating.HARD)}
            className="py-3 px-2 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 font-bold text-sm transition flex flex-col items-center justify-center space-y-0.5 active:scale-95"
          >
            <span>Важко</span>
            <span className="text-[10px] opacity-75 font-normal">Hard [2]</span>
          </button>

          <button
            onClick={() => handleReview(LearningRating.GOOD)}
            className="py-3 px-2 rounded-2xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/20 font-bold text-sm transition flex flex-col items-center justify-center space-y-0.5 active:scale-95"
          >
            <span>Знаю</span>
            <span className="text-[10px] opacity-75 font-normal">Good [3]</span>
          </button>

          <button
            onClick={() => handleReview(LearningRating.EASY)}
            className="py-3 px-2 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 font-bold text-sm transition flex flex-col items-center justify-center space-y-0.5 active:scale-95"
          >
            <span>Легко</span>
            <span className="text-[10px] opacity-75 font-normal">Easy [4]</span>
          </button>
        </div>
      )}
    </main>
  );
}
