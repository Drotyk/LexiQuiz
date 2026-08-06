'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { StatisticsOverviewDto, WordSetDto } from '@wordforge/shared-types';
import {
  Play,
  RotateCcw,
  Plus,
  Layers,
  BookOpen,
  Target,
  Award,
  BarChart2,
  Clock,
  CheckCircle,
} from 'lucide-react';

export default function HomePage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [stats, setStats] = useState<StatisticsOverviewDto | null>(null);
  const [recentSets, setRecentSets] = useState<WordSetDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      setIsLoading(true);
      try {
        const [statsRes, setsRes] = await Promise.all([
          api.get('/statistics/overview'),
          api.get('/word-sets', { params: { limit: 3 } }),
        ]);
        setStats(statsRes.data);
        setRecentSets(setsRes.data.data);
      } catch {
        // Handled
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  if (isAuthLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-slate-400 font-mono animate-pulse">Loading WordForge...</div>
      </div>
    );
  }

  // Landing page for unauthenticated visitors
  if (!user) {
    return (
      <main className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-6 text-center space-y-8 max-w-4xl mx-auto">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-sky-500 to-indigo-500 flex items-center justify-center text-white text-3xl font-extrabold shadow-2xl shadow-sky-500/20 animate-bounce">
          WF
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight bg-gradient-to-r from-sky-400 via-indigo-300 to-teal-400 bg-clip-text text-transparent">
            Forge & Master Your Custom Vocabulary
          </h1>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto leading-relaxed">
            Add custom word sets, study with interactive flashcards, take quizzes, and let automated SM-2 spaced repetition plan your reviews.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Link
            href="/register"
            className="px-8 py-4 rounded-2xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-base transition shadow-xl shadow-sky-500/25"
          >
            Get Started for Free
          </Link>
          <Link
            href="/login"
            className="px-8 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white font-bold text-base transition"
          >
            Sign In
          </Link>
        </div>
      </main>
    );
  }

  // Authenticated User Dashboard
  return (
    <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Welcome Banner & Quick Start */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/60 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-sky-400">
            Welcome Back
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
            Hello, {user.name}! 👋
          </h1>
          <p className="text-slate-300 text-sm max-w-md">
            You have <strong className="text-amber-400 font-bold">{stats?.dueTodayCount || 0}</strong> words ready for repetition today.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/review"
            className="inline-flex items-center space-x-2 px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition shadow-lg shadow-amber-500/20"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Review Due Words ({stats?.dueTodayCount || 0})</span>
          </Link>
          <Link
            href="/quiz/setup"
            className="inline-flex items-center space-x-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition shadow-lg shadow-indigo-500/20"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Start Quiz</span>
          </Link>
        </div>
      </div>

      {/* Metrics Widgets */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Total Words</span>
            <BookOpen className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-3xl font-black text-white">{stats?.totalWords || 0}</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Mastered Words</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-emerald-400">
            {stats?.masteredWords || 0}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>7-Day Accuracy</span>
            <Award className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-black text-indigo-400">
            {stats?.accuracy7Days || 100}%
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Daily Goal</span>
            <Target className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-amber-400">
            {stats?.dailyGoal || 10} <span className="text-xs font-normal text-slate-400">words/day</span>
          </div>
        </div>
      </div>

      {/* Recent Word Sets & Statistics Link */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Layers className="w-6 h-6 text-sky-400" />
            Recent Word Sets
          </h2>
          <div className="flex items-center space-x-3">
            <Link
              href="/statistics"
              className="inline-flex items-center space-x-1.5 text-sm font-semibold text-sky-400 hover:underline"
            >
              <BarChart2 className="w-4 h-4" />
              <span>Full Statistics</span>
            </Link>
            <Link
              href="/sets"
              className="text-sm font-semibold text-slate-400 hover:text-white transition"
            >
              View All Sets →
            </Link>
          </div>
        </div>

        {recentSets.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-4">
            <p className="text-slate-400 text-sm">You have no word sets yet.</p>
            <Link
              href="/sets/new"
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-sky-500 text-white font-semibold text-sm hover:bg-sky-400 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Create Word Set</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {recentSets.map((set) => (
              <Link
                key={set.id}
                href={`/sets/${set.id}`}
                className="bg-slate-900 border border-slate-800 hover:border-sky-500/50 rounded-2xl p-6 transition space-y-3"
              >
                <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 uppercase tracking-wider">
                  {set.sourceLanguage} → {set.targetLanguage}
                </span>
                <h3 className="text-lg font-bold text-white truncate">{set.title}</h3>
                <p className="text-slate-400 text-xs line-clamp-2">
                  {set.description || 'No description.'}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
