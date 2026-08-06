'use client';

import React, { useEffect, useState } from 'react';
import { HealthResponse } from '@wordforge/shared-types';

export default function HomePage() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3001/health')
      .then((res) => res.json())
      .then((data) => {
        setHealth(data);
        setLoading(false);
      })
      .catch(() => {
        setHealth({ status: 'error', database: 'disconnected' });
        setLoading(false);
      });
  }, []);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-900 text-slate-100">
      <div className="max-w-2xl w-full bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-2xl text-center space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-sky-500/10 text-sky-400 text-3xl font-bold border border-sky-500/20">
          WF
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">
          WordForge
        </h1>
        <p className="text-slate-300 text-lg">
          Master custom vocabulary effortlessly with smart flashcards, interactive quizzes, and automated spaced repetition.
        </p>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-700/60 flex items-center justify-between text-sm">
          <span className="text-slate-400 font-medium">Backend Health Status:</span>
          {loading ? (
            <span className="text-amber-400 animate-pulse font-mono">Checking...</span>
          ) : health?.status === 'ok' ? (
            <span className="inline-flex items-center gap-2 text-emerald-400 font-mono">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              API: OK | DB: {health.database}
            </span>
          ) : (
            <span className="text-rose-400 font-mono">Disconnected</span>
          )}
        </div>

        <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="http://localhost:3001/api/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-semibold transition shadow-lg shadow-sky-500/20 text-center"
          >
            Swagger API Docs
          </a>
        </div>
      </div>
    </main>
  );
}
