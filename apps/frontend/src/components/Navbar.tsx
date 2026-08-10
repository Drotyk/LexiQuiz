'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { LogOut, User as UserIcon, BookOpen, Layers } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="bg-gray-900/80 backdrop-blur-md border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-gray-500 to-gray-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-gray-500/20 group-hover:scale-105 transition-transform">
            WF
          </div>
          <span className="font-extrabold text-xl tracking-tight text-white group-hover:text-gray-400 transition-colors">
            WordForge
          </span>
        </Link>

        <nav className="flex items-center space-x-4 sm:space-x-6">
          {user ? (
            <>
              <Link
                href="/sets"
                className="flex items-center space-x-1.5 text-sm font-medium text-gray-300 hover:text-gray-400 transition"
              >
                <Layers className="w-4 h-4" />
                <span>My Sets</span>
              </Link>
              <Link
                href="/profile"
                className="flex items-center space-x-1.5 text-sm font-medium text-gray-300 hover:text-gray-400 transition"
              >
                <UserIcon className="w-4 h-4" />
                <span>{user.name}</span>
              </Link>
              <button
                onClick={() => logout()}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-gray-400 text-sm font-medium transition border border-gray-700"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-gray-300 hover:text-gray-400 transition"
              >
                Log In
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 rounded-xl bg-gray-500 hover:bg-gray-400 text-white text-sm font-semibold transition shadow-md shadow-gray-500/20"
              >
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
