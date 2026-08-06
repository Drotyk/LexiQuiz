'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import {
  StatisticsOverviewDto,
  DifficultWordDto,
  DailyActivityItemDto,
} from '@wordforge/shared-types';
import {
  BarChart2,
  AlertTriangle,
  Award,
  BookOpen,
  CheckCircle,
  Clock,
  ArrowLeft,
} from 'lucide-react';

export default function StatisticsPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();

  const [overview, setOverview] = useState<StatisticsOverviewDto | null>(null);
  const [difficultWords, setDifficultWords] = useState<DifficultWordDto[]>([]);
  const [activity, setActivity] = useState<DailyActivityItemDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push('/login');
    }
  }, [user, isAuthLoading, router]);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      setIsLoading(true);
      try {
        const [ovRes, diffRes, actRes] = await Promise.all([
          api.get('/statistics/overview'),
          api.get('/statistics/difficult-words'),
          api.get('/statistics/activity', { params: { days: 7 } }),
        ]);
        setOverview(ovRes.data);
        setDifficultWords(diffRes.data);
        setActivity(actRes.data);
      } catch {
        // Handled
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  if (isAuthLoading || isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-slate-400 font-mono animate-pulse">Loading statistics...</div>
      </div>
    );
  }

  return (
    <main className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      <Link
        href="/"
        className="inline-flex items-center space-x-2 text-sm font-medium text-slate-400 hover:text-white transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Dashboard</span>
      </Link>

      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
          <BarChart2 className="w-8 h-8 text-sky-400" />
          Learning Analytics & Statistics
        </h1>
      </div>

      {/* Main Breakdown Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-1">
          <span className="text-xs text-slate-400 font-medium">New Words</span>
          <div className="text-3xl font-black text-sky-400">{overview?.newWords || 0}</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-1">
          <span className="text-xs text-slate-400 font-medium">In Learning</span>
          <div className="text-3xl font-black text-amber-400">{overview?.learningWords || 0}</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-1">
          <span className="text-xs text-slate-400 font-medium">In Reviewing</span>
          <div className="text-3xl font-black text-indigo-400">{overview?.reviewingWords || 0}</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-1">
          <span className="text-xs text-slate-400 font-medium">Mastered Words</span>
          <div className="text-3xl font-black text-emerald-400">{overview?.masteredWords || 0}</div>
        </div>
      </div>

      {/* Quiz & Speed Performance */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex items-center space-x-4">
          <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400">
            <Award className="w-8 h-8" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{overview?.accuracy7Days || 100}%</div>
            <div className="text-xs text-slate-400">7-Day Quiz Accuracy</div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex items-center space-x-4">
          <div className="p-3 rounded-2xl bg-sky-500/10 text-sky-400">
            <BookOpen className="w-8 h-8" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{overview?.totalQuizzesCompleted || 0}</div>
            <div className="text-xs text-slate-400">Quizzes Completed</div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex items-center space-x-4">
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400">
            <Clock className="w-8 h-8" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white font-mono">
              {overview?.avgResponseTimeMs ? `${(overview.avgResponseTimeMs / 1000).toFixed(1)}s` : '—'}
            </div>
            <div className="text-xs text-slate-400">Avg Answer Speed</div>
          </div>
        </div>
      </div>

      {/* Difficult Words Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-400" />
          Most Challenging Words
        </h2>

        {difficultWords.length === 0 ? (
          <div className="p-8 text-center bg-slate-950/40 border border-slate-800/80 rounded-xl text-slate-400 text-sm">
            No difficult words recorded yet. Keep practicing!
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950 text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-4">Term</th>
                  <th className="p-4">Translation</th>
                  <th className="p-4">Set</th>
                  <th className="p-4 text-center">Incorrect Attempts</th>
                  <th className="p-4 text-right">Accuracy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
                {difficultWords.map((word) => (
                  <tr key={word.wordId} className="hover:bg-slate-800/40">
                    <td className="p-4 font-bold text-white font-sans text-sm">{word.term}</td>
                    <td className="p-4 text-slate-300 font-sans text-sm">{word.translation}</td>
                    <td className="p-4 text-slate-400 font-sans">{word.setName}</td>
                    <td className="p-4 text-center text-rose-400 font-bold">{word.incorrectAnswers}</td>
                    <td className="p-4 text-right text-slate-200">{word.accuracyPercent}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 7-Day Activity History */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-emerald-400" />
          Recent Activity (Last 7 Days)
        </h2>

        <div className="grid grid-cols-7 gap-2 sm:gap-4 text-center">
          {activity.map((item, i) => (
            <div key={i} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="text-[10px] font-mono text-slate-500">{item.date.slice(5)}</div>
              <div className="text-lg font-bold text-white">{item.count}</div>
              <div className="text-[10px] text-emerald-400">{item.correct} ✓</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
