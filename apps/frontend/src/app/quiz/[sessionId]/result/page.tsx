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
        <div className="text-gray-400 font-mono animate-pulse">Compiling quiz results...</div>
      </div>
    );
  }

  if (!result) {
    return (
      <main className="max-w-xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center text-gray-400">
          Quiz result not found.
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Top Banner */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sm:p-8 text-center space-y-6 shadow-2xl">
        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-gray-500 to-gray-500 text-white flex items-center justify-center mx-auto text-3xl shadow-lg shadow-gray-500/20 font-extrabold">
          {result.accuracyPercent}%
        </div>

        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-white">Quiz Completed!</h1>
          <p className="text-gray-400 text-sm">
            Score: <strong className="text-white">{result.session.correctAnswers}</strong> out of{' '}
            <strong className="text-white">{result.session.totalQuestions}</strong> correct
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
          <Link
            href="/quiz/setup"
            className="inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-gray-600 hover:bg-gray-500 text-white font-semibold text-sm transition shadow-lg shadow-gray-500/20"
          >
            <RotateCw className="w-4 h-4" />
            <span>Take Another Quiz</span>
          </Link>
          <Link
            href="/sets"
            className="inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold text-sm transition border border-gray-700"
          >
            <Layers className="w-4 h-4" />
            <span>Back to Word Sets</span>
          </Link>
        </div>
      </div>

      {/* Answer Detail Breakdowns */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Award className="w-5 h-5 text-gray-400" />
          Answer Breakdown
        </h2>

        <div className="space-y-3">
          {result.answers.map((ans, idx) => (
            <div
              key={ans.id || idx}
              className={`p-4 rounded-xl border ${
                ans.isCorrect
                  ? 'bg-gray-500/5 border-gray-500/20'
                  : 'bg-gray-500/5 border-gray-500/20'
              } flex items-center justify-between gap-4`}
            >
              <div className="flex items-center space-x-3">
                {ans.isCorrect ? (
                  <CheckCircle2 className="w-5 h-5 text-gray-400 flex-shrink-0" />
                ) : (
                  <XCircle className="w-5 h-5 text-gray-400 flex-shrink-0" />
                )}
                <div>
                  <div className="font-bold text-white text-base">
                    {ans.term || `Question #${idx + 1}`}
                  </div>
                  <div className="text-xs text-gray-400">
                    Your answer: <span className="font-semibold text-gray-200">{ans.userAnswer || '(blank)'}</span>
                  </div>
                </div>
              </div>

              {!ans.isCorrect && (
                <div className="text-right text-xs">
                  <span className="text-gray-400 block">Correct answer:</span>
                  <span className="font-bold text-gray-400 font-mono">{ans.correctAnswer}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
