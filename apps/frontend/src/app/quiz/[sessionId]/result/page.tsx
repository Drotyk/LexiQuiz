'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { QuizSessionResultDto } from '@wordforge/shared-types';
import { Award, CheckCircle2, XCircle, RotateCw, Layers } from 'lucide-react';

export default function QuizResultPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params?.sessionId as string;
  const { user, isLoading: isAuthLoading } = useAuth();

  const [result, setResult] = useState<QuizSessionResultDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push('/login');
    }
  }, [user, isAuthLoading, router]);

  useEffect(() => {
    const fetchResult = async () => {
      if (!sessionId || !user) return;
      setIsLoading(true);
      try {
        const response = await api.get(`/quizzes/${sessionId}/result`);
        setResult(response.data);
      } catch {
        // Handled
      } finally {
        setIsLoading(false);
      }
    };

    fetchResult();
  }, [sessionId, user]);

  if (isAuthLoading || isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-slate-400 font-mono animate-pulse">Compiling quiz results...</div>
      </div>
    );
  }

  if (!result) {
    return (
      <main className="max-w-xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
          Quiz result not found.
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 text-center space-y-6 shadow-2xl">
        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-500 to-sky-500 text-white flex items-center justify-center mx-auto text-3xl shadow-lg shadow-indigo-500/20 font-extrabold">
          {result.accuracyPercent}%
        </div>

        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-white">Quiz Completed!</h1>
          <p className="text-slate-400 text-sm">
            Score: <strong className="text-white">{result.session.correctAnswers}</strong> out of{' '}
            <strong className="text-white">{result.session.totalQuestions}</strong> correct
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
          <Link
            href="/quiz/setup"
            className="inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition shadow-lg shadow-indigo-500/20"
          >
            <RotateCw className="w-4 h-4" />
            <span>Take Another Quiz</span>
          </Link>
          <Link
            href="/sets"
            className="inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm transition border border-slate-700"
          >
            <Layers className="w-4 h-4" />
            <span>Back to Word Sets</span>
          </Link>
        </div>
      </div>

      {/* Answer Detail Breakdowns */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Award className="w-5 h-5 text-indigo-400" />
          Answer Breakdown
        </h2>

        <div className="space-y-3">
          {result.answers.map((ans, idx) => (
            <div
              key={ans.id || idx}
              className={`p-4 rounded-xl border ${
                ans.isCorrect
                  ? 'bg-emerald-500/5 border-emerald-500/20'
                  : 'bg-rose-500/5 border-rose-500/20'
              } flex items-center justify-between gap-4`}
            >
              <div className="flex items-center space-x-3">
                {ans.isCorrect ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                )}
                <div>
                  <div className="font-bold text-white text-base">
                    {ans.term || `Question #${idx + 1}`}
                  </div>
                  <div className="text-xs text-slate-400">
                    Your answer: <span className="font-semibold text-slate-200">{ans.userAnswer || '(blank)'}</span>
                  </div>
                </div>
              </div>

              {!ans.isCorrect && (
                <div className="text-right text-xs">
                  <span className="text-slate-400 block">Correct answer:</span>
                  <span className="font-bold text-emerald-400 font-mono">{ans.correctAnswer}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
