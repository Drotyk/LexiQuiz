'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { StudyCardDto, LearningRating } from '@wordforge/shared-types';
import { ArrowLeft, RotateCw, Eye, Award, Clock } from 'lucide-react';

export default function ReviewDueWordsPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();

  const [cards, setCards] = useState<StudyCardDto[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push('/login');
    }
  }, [user, isAuthLoading, router]);

  const fetchDueWords = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const response = await api.get('/learning/due');
      setCards(response.data);
    } catch {
      // Error handling
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchDueWords();
  }, [fetchDueWords]);

  const currentCard = cards[currentIndex];

  const handleReview = async (rating: LearningRating) => {
    if (!currentCard) return;

    try {
      await api.post(`/learning/words/${currentCard.word.id}/review`, {
        rating,
      });

      if (currentIndex + 1 < cards.length) {
        setIsFlipped(false);
        setCurrentIndex((prev) => prev + 1);
      } else {
        setIsCompleted(true);
      }
    } catch {
      alert('Failed to submit review');
    }
  };

  if (isAuthLoading || isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-slate-400 font-mono animate-pulse">Checking due words...</div>
      </div>
    );
  }

  if (cards.length === 0 || isCompleted) {
    return (
      <main className="max-w-xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-6 shadow-2xl">
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto text-4xl">
            <Award className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-extrabold text-white">All Caught Up!</h2>
            <p className="text-slate-400 text-sm">
              You have no words due for repetition right now. Great job keeping your memory sharp!
            </p>
          </div>

          <div className="pt-4">
            <Link
              href="/sets"
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-semibold text-sm transition shadow-lg shadow-sky-500/20"
            >
              <span>Back to Word Sets</span>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 flex flex-col min-h-[calc(100vh-5rem)]">
      <div className="flex items-center justify-between">
        <Link
          href="/sets"
          className="inline-flex items-center space-x-2 text-sm font-medium text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Review</span>
        </Link>
        <span className="text-xs font-mono font-semibold text-amber-400 flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" /> Due Word {currentIndex + 1} of {cards.length}
        </span>
      </div>

      {/* Main Interactive Flip Card Container */}
      <div className="flex-1 flex flex-col justify-center my-4">
        <div
          onClick={() => setIsFlipped((prev) => !prev)}
          className={`w-full min-h-[320px] sm:min-h-[380px] bg-slate-900 border ${
            isFlipped ? 'border-sky-500/50 shadow-sky-500/10' : 'border-slate-800'
          } rounded-3xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 transform shadow-2xl relative select-none group hover:scale-[1.01]`}
        >
          {!isFlipped ? (
            <div className="space-y-4 my-auto">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Due Word
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
            <div className="space-y-6 my-auto max-w-md w-full">
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
            <span className="text-[10px] opacity-75 font-normal">Again</span>
          </button>

          <button
            onClick={() => handleReview(LearningRating.HARD)}
            className="py-3 px-2 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 font-bold text-sm transition flex flex-col items-center justify-center space-y-0.5 active:scale-95"
          >
            <span>Важко</span>
            <span className="text-[10px] opacity-75 font-normal">Hard</span>
          </button>

          <button
            onClick={() => handleReview(LearningRating.GOOD)}
            className="py-3 px-2 rounded-2xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/20 font-bold text-sm transition flex flex-col items-center justify-center space-y-0.5 active:scale-95"
          >
            <span>Знаю</span>
            <span className="text-[10px] opacity-75 font-normal">Good</span>
          </button>

          <button
            onClick={() => handleReview(LearningRating.EASY)}
            className="py-3 px-2 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 font-bold text-sm transition flex flex-col items-center justify-center space-y-0.5 active:scale-95"
          >
            <span>Легко</span>
            <span className="text-[10px] opacity-75 font-normal">Easy</span>
          </button>
        </div>
      )}
    </main>
  );
}
