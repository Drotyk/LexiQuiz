'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { UserPlus, AlertCircle } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [dailyGoal, setDailyGoal] = useState(10);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await api.post('/auth/register', {
        name,
        email,
        password,
        dailyGoal,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
      });

      const { accessToken, user } = response.data;
      login(accessToken, user);
      router.push('/');
    } catch (err: any) {
      const message =
        err.response?.data?.message || 'Failed to create account. Please try again.';
      setError(Array.isArray(message) ? message.join(', ') : message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-xl bg-gray-500/10 text-gray-400 mb-2">
            <UserPlus className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Create Account</h1>
          <p className="text-gray-400 text-sm">
            Start forging your personal dictionary today
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-gray-500/10 border border-gray-500/20 flex items-start space-x-3 text-gray-400 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 focus:border-gray-500 focus:ring-1 focus:ring-gray-500 text-white placeholder-gray-500 text-sm outline-none transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 focus:border-gray-500 focus:ring-1 focus:ring-gray-500 text-white placeholder-gray-500 text-sm outline-none transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Password (min 6 chars)
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 focus:border-gray-500 focus:ring-1 focus:ring-gray-500 text-white placeholder-gray-500 text-sm outline-none transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Daily Target (words per day)
            </label>
            <input
              type="number"
              min={1}
              max={100}
              value={dailyGoal}
              onChange={(e) => setDailyGoal(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 focus:border-gray-500 focus:ring-1 focus:ring-gray-500 text-white placeholder-gray-500 text-sm outline-none transition"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 rounded-xl bg-gray-500 hover:bg-gray-400 disabled:opacity-50 text-white font-semibold text-sm transition shadow-lg shadow-gray-500/20"
          >
            {isSubmitting ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <div className="text-center text-sm text-gray-400">
          Already have an account?{' '}
          <Link href="/login" className="text-gray-400 hover:underline font-medium">
            Sign in
          </Link>
        </div>
      </div>
    </main>
  );
}
