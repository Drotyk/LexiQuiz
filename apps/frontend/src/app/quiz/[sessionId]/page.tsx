'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { QuizQuestionDto, QuizAnswerResultDto, QuestionType } from '@wordforge/shared-types';
import { ArrowLeft, CheckCircle2, XCircle, Send, HelpCircle } from 'lucide-react';

export default function ActiveQuizPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params?.sessionId as string;
  const { user, isLoading: isAuthLoading } = useAuth();

  const [question, setQuestion] = useState<QuizQuestionDto | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [answerResult, setAnswerResult] = useState<QuizAnswerResultDto | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [startTime, setStartTime] = useState<number>(Date.now());

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push('/login');
    }
  }, [user, isAuthLoading, router]);

  const fetchCurrentQuestion = useCallback(async () => {
    if (!sessionId || !user) return;
    setIsLoading(true);
    setAnswerResult(null);
    setUserAnswer('');
    setSelectedOption(null);
    setStartTime(Date.now());

    try {
      const response = await api.get(`/quizzes/${sessionId}/question`);
      setQuestion(response.data);
    } catch {
      // Session finished or error -> redirect to results
      router.push(`/quiz/${sessionId}/result`);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, user, router]);

  useEffect(() => {
    fetchCurrentQuestion();
  }, [fetchCurrentQuestion]);

  const handleSubmitAnswer = async (answerValue: string) => {
    if (!question || answerResult || isSubmitting) return;
    setIsSubmitting(true);
    const responseTimeMs = Date.now() - startTime;

    try {
      const response = await api.post(`/quizzes/${sessionId}/answer`, {
        wordId: question.wordId,
        userAnswer: answerValue,
        responseTimeMs,
      });

      setAnswerResult(response.data);
    } catch {
      alert('Failed to submit answer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextQuestion = () => {
    fetchCurrentQuestion();
  };

  if (isAuthLoading || isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-slate-400 font-mono animate-pulse">Loading question...</div>
      </div>
    );
  }

  if (!question) {
    return null;
  }

  const progressPercent = Math.round(
    ((question.questionIndex + 1) / question.totalQuestions) * 100,
  );

  return (
    <main className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 flex flex-col min-h-[calc(100vh-5rem)]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/sets"
          className="inline-flex items-center space-x-2 text-sm font-medium text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Quiz</span>
        </Link>
        <span className="text-xs font-mono font-semibold text-indigo-400">
          Question {question.questionIndex + 1} of {question.totalQuestions}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
        <div
          className="bg-gradient-to-r from-indigo-500 to-sky-500 h-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Main Question Card */}
      <div className="flex-1 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 flex flex-col justify-between">
        <div className="space-y-4 text-center my-auto">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase tracking-wider">
            {question.questionType.replace('_', ' ')}
          </span>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            {question.prompt}
          </h2>

          {question.questionType === QuestionType.TRUE_FALSE && question.displayPair && (
            <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 max-w-sm mx-auto space-y-2">
              <div className="text-2xl font-bold text-sky-400">{question.displayPair.term}</div>
              <div className="text-sm text-slate-400">equals</div>
              <div className="text-xl font-semibold text-emerald-400">
                {question.displayPair.translation}
              </div>
            </div>
          )}
        </div>

        {/* Question Type Inputs */}
        {!answerResult ? (
          <div className="space-y-4">
            {/* 1. Multiple Choice */}
            {question.questionType === QuestionType.MULTIPLE_CHOICE && question.options && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {question.options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setSelectedOption(opt);
                      handleSubmitAnswer(opt);
                    }}
                    className="p-4 rounded-2xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/50 text-slate-200 font-semibold text-base transition text-left active:scale-[0.99]"
                  >
                    <span className="text-xs font-mono text-slate-500 mr-2">[{i + 1}]</span>
                    {opt}
                  </button>
                ))}
              </div>
            )}

            {/* 2 & 3. Direct / Reverse Typing */}
            {(question.questionType === QuestionType.DIRECT_TYPING ||
              question.questionType === QuestionType.REVERSE_TYPING) && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (userAnswer.trim()) handleSubmitAnswer(userAnswer.trim());
                }}
                className="space-y-3"
              >
                <input
                  type="text"
                  autoFocus
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Type your answer here..."
                  className="w-full px-5 py-4 rounded-2xl bg-slate-950 border border-slate-800 text-white font-medium text-lg outline-none focus:border-indigo-500 transition"
                />
                <button
                  type="submit"
                  disabled={!userAnswer.trim() || isSubmitting}
                  className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-sm transition flex items-center justify-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Answer</span>
                </button>
              </form>
            )}

            {/* 4. True or False */}
            {question.questionType === QuestionType.TRUE_FALSE && (
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleSubmitAnswer('true')}
                  className="py-4 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 font-bold text-lg transition active:scale-95"
                >
                  True (Правда)
                </button>
                <button
                  onClick={() => handleSubmitAnswer('false')}
                  className="py-4 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 font-bold text-lg transition active:scale-95"
                >
                  False (Неправда)
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Answer Feedback Banner */
          <div className="space-y-4 animate-fadeIn">
            {answerResult.isCorrect ? (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center space-x-3 text-emerald-400">
                <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
                <div>
                  <div className="font-bold text-base">Correct!</div>
                  <div className="text-xs text-emerald-300/80">Well done, keep going!</div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 space-y-1 text-rose-400">
                <div className="flex items-center space-x-3 font-bold text-base">
                  <XCircle className="w-6 h-6 flex-shrink-0" />
                  <span>Incorrect</span>
                </div>
                <div className="text-xs text-rose-300/90 pl-9">
                  Correct Answer:{' '}
                  <strong className="text-white font-mono">{answerResult.correctAnswer}</strong>
                </div>
              </div>
            )}

            <button
              onClick={handleNextQuestion}
              className="w-full py-4 rounded-2xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-base transition shadow-lg shadow-sky-500/20"
            >
              {question.questionIndex + 1 >= question.totalQuestions
                ? 'View Results'
                : 'Next Question →'}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
