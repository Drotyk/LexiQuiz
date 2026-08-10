import type { Metadata } from 'next';
import './globals.css';
import QueryProvider from '@/providers/QueryProvider';
import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'WordForge — Learn Your Vocabulary Effortlessly',
  description: 'Add your own words, study with flashcards and quizzes, and let SM-2 spaced repetition handle your learning schedule.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased selection:bg-white selection:text-black min-h-screen flex flex-col bg-black text-gray-100">
        <QueryProvider>
          <AuthProvider>
            <Navbar />
            <div className="flex-1">{children}</div>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
