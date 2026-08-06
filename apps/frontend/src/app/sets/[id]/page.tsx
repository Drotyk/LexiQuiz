'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { WordSetDto, WordDto, BulkPreviewResultDto } from '@wordforge/shared-types';
import {
  ArrowLeft,
  BookOpen,
  Edit3,
  Trash2,
  Layers,
  Plus,
  Play,
  Lock,
  Globe,
  Link2,
  Search,
  Upload,
  X,
  AlertTriangle,
  CheckCircle2,
  FileText,
} from 'lucide-react';

export default function WordSetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { user, isLoading: isAuthLoading } = useAuth();

  const [set, setSet] = useState<WordSetDto | null>(null);
  const [words, setWords] = useState<WordDto[]>([]);
  const [totalWords, setTotalWords] = useState(0);
  const [search, setSearch] = useState('');
  const [selectedWordIds, setSelectedWordIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingWord, setEditingWord] = useState<WordDto | null>(null);
  const [showBulkModal, setShowBulkModal] = useState(false);

  // Single word form state
  const [term, setTerm] = useState('');
  const [translation, setTranslation] = useState('');
  const [transcription, setTranscription] = useState('');
  const [example, setExample] = useState('');
  const [note, setNote] = useState('');
  const [isSubmittingWord, setIsSubmittingWord] = useState(false);

  // Bulk import state
  const [bulkText, setBulkText] = useState('');
  const [bulkPreview, setBulkPreview] = useState<BulkPreviewResultDto | null>(null);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push('/login');
    }
  }, [user, isAuthLoading, router]);

  const [refreshCount, setRefreshCount] = useState(0);

  useEffect(() => {
    const fetchSetAndWords = async () => {
      if (!id || !user) return;
      setIsLoading(true);
      try {
        const [setRes, wordsRes] = await Promise.all([
          api.get(`/word-sets/${id}`),
          api.get(`/word-sets/${id}/words`, { params: { search: search || undefined, limit: 100 } }),
        ]);
        setSet(setRes.data);
        setWords(wordsRes.data.data);
        setTotalWords(wordsRes.data.total);
      } catch {
        // Handled
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(() => {
      if (user) fetchSetAndWords();
    }, 300);
    return () => clearTimeout(timer);
  }, [id, user, search, refreshCount]);

  // Single Word Add/Edit
  const handleSaveWord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!term || !translation) return;
    setIsSubmittingWord(true);

    try {
      if (editingWord) {
        await api.patch(`/words/${editingWord.id}`, {
          term,
          translation,
          transcription: transcription || undefined,
          example: example || undefined,
          note: note || undefined,
        });
      } else {
        await api.post(`/word-sets/${id}/words`, {
          term,
          translation,
          transcription: transcription || undefined,
          example: example || undefined,
          note: note || undefined,
        });
      }

      resetWordForm();
      setRefreshCount((c) => c + 1);
    } catch {
      alert('Failed to save word');
    } finally {
      setIsSubmittingWord(false);
    }
  };

  const resetWordForm = () => {
    setTerm('');
    setTranslation('');
    setTranscription('');
    setExample('');
    setNote('');
    setEditingWord(null);
    setShowAddModal(false);
  };

  const openEditWordModal = (word: WordDto) => {
    setEditingWord(word);
    setTerm(word.term);
    setTranslation(word.translation);
    setTranscription(word.transcription || '');
    setExample(word.example || '');
    setNote(word.note || '');
    setShowAddModal(true);
  };

  const handleDeleteWord = async (wordId: string) => {
    if (!confirm('Are you sure you want to delete this word?')) return;
    try {
      await api.delete(`/words/${wordId}`);
      setSelectedWordIds((prev) => prev.filter((i) => i !== wordId));
      setRefreshCount((c) => c + 1);
    } catch {
      alert('Failed to delete word');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedWordIds.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedWordIds.length} selected words?`)) return;

    try {
      await api.delete('/words/bulk', { data: { wordIds: selectedWordIds } });
      setSelectedWordIds([]);
      setRefreshCount((c) => c + 1);
    } catch {
      alert('Failed to bulk delete words');
    }
  };

  // Bulk Import Preview & Submit
  const handlePreviewBulk = async () => {
    if (!bulkText.trim()) return;
    setIsPreviewing(true);
    try {
      const response = await api.post(`/word-sets/${id}/words/bulk-preview`, {
        text: bulkText,
      });
      setBulkPreview(response.data);
    } catch {
      alert('Failed to parse text for preview');
    } finally {
      setIsPreviewing(false);
    }
  };

  const handleConfirmBulkImport = async () => {
    if (!bulkPreview || bulkPreview.valid.length === 0) return;
    setIsImporting(true);
    try {
      await api.post(`/word-sets/${id}/words/bulk`, {
        words: bulkPreview.valid,
      });
      setShowBulkModal(false);
      setBulkText('');
      setBulkPreview(null);
      setRefreshCount((c) => c + 1);
    } catch {
      alert('Failed to import words');
    } finally {
      setIsImporting(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedWordIds.length === words.length) {
      setSelectedWordIds([]);
    } else {
      setSelectedWordIds(words.map((w) => w.id));
    }
  };

  const toggleSelectWord = (wordId: string) => {
    setSelectedWordIds((prev) =>
      prev.includes(wordId) ? prev.filter((i) => i !== wordId) : [...prev, wordId],
    );
  };

  if (isAuthLoading || isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-slate-400 font-mono animate-pulse">Loading set details...</div>
      </div>
    );
  }

  if (!set) {
    return (
      <main className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <Link
          href="/sets"
          className="inline-flex items-center space-x-2 text-sm font-medium text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Word Sets</span>
        </Link>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
          Word set not found or access forbidden.
        </div>
      </main>
    );
  }

  const isOwner = user?.id === set.userId;

  return (
    <main className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      <Link
        href="/sets"
        className="inline-flex items-center space-x-2 text-sm font-medium text-slate-400 hover:text-white transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Word Sets</span>
      </Link>

      {/* Set Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20 uppercase tracking-wider">
                {set.sourceLanguage} → {set.targetLanguage}
              </span>
              <div className="flex items-center space-x-1.5 text-slate-400 text-xs font-medium">
                {set.visibility === 'private' && (
                  <span title="Private" className="flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5" /> Private
                  </span>
                )}
                {set.visibility === 'link' && (
                  <span title="Accessible via Link" className="flex items-center gap-1 text-sky-400">
                    <Link2 className="w-3.5 h-3.5" /> Link Access
                  </span>
                )}
                {set.visibility === 'public' && (
                  <span title="Public" className="flex items-center gap-1 text-emerald-400">
                    <Globe className="w-3.5 h-3.5" /> Public
                  </span>
                )}
              </div>
            </div>

            <h1 className="text-3xl font-extrabold text-white tracking-tight">{set.title}</h1>
            {set.description && (
              <p className="text-slate-300 text-base leading-relaxed">{set.description}</p>
            )}
          </div>

          {isOwner && (
            <div className="flex items-center space-x-2">
              <Link
                href={`/sets/${set.id}/edit`}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-sm transition border border-slate-700"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit Set</span>
              </Link>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-6 text-sm text-slate-400 w-full sm:w-auto">
            <span className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-sky-400" />
              <strong className="text-white font-semibold">{totalWords}</strong> Words
            </span>
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <Link
              href={`/study/${set.id}`}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-semibold text-sm transition shadow-lg shadow-sky-500/20"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Study Cards</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Words Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <Layers className="w-6 h-6 text-sky-400" />
            <h2 className="text-xl font-bold text-white">Words List</h2>
          </div>

          {isOwner && (
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowBulkModal(true)}
                className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm transition border border-slate-700"
              >
                <Upload className="w-4 h-4 text-indigo-400" />
                <span>Bulk Import</span>
              </button>
              <button
                onClick={() => {
                  resetWordForm();
                  setShowAddModal(true);
                }}
                className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-semibold text-sm transition shadow-md shadow-sky-500/20"
              >
                <Plus className="w-4 h-4" />
                <span>Add Word</span>
              </button>
            </div>
          )}
        </div>

        {/* Filter & Selection Bar */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search words by term or translation..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm outline-none focus:border-sky-500"
            />
          </div>

          {selectedWordIds.length > 0 && isOwner && (
            <button
              onClick={handleBulkDelete}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 text-sm font-semibold hover:bg-rose-500/20 transition"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete ({selectedWordIds.length}) Selected</span>
            </button>
          )}
        </div>

        {/* Words Table */}
        {words.length === 0 ? (
          <div className="p-12 text-center bg-slate-950/40 border border-slate-800/80 rounded-xl space-y-3">
            <p className="text-slate-400 text-sm">
              {search ? 'No words match your search.' : 'No words added yet.'}
            </p>
            {isOwner && !search && (
              <button
                onClick={() => setShowBulkModal(true)}
                className="inline-flex items-center space-x-2 text-sky-400 hover:underline font-medium text-sm"
              >
                <Upload className="w-4 h-4" />
                <span>Paste a list of words using Bulk Import</span>
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950 text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  {isOwner && (
                    <th className="p-4 w-10">
                      <input
                        type="checkbox"
                        checked={words.length > 0 && selectedWordIds.length === words.length}
                        onChange={toggleSelectAll}
                        className="rounded border-slate-800 bg-slate-900 text-sky-500 focus:ring-0 cursor-pointer"
                      />
                    </th>
                  )}
                  <th className="p-4">Term</th>
                  <th className="p-4">Translation</th>
                  <th className="p-4">Transcription</th>
                  <th className="p-4">Example</th>
                  {isOwner && <th className="p-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {words.map((w) => (
                  <tr key={w.id} className="hover:bg-slate-800/40 transition-colors">
                    {isOwner && (
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={selectedWordIds.includes(w.id)}
                          onChange={() => toggleSelectWord(w.id)}
                          className="rounded border-slate-800 bg-slate-900 text-sky-500 focus:ring-0 cursor-pointer"
                        />
                      </td>
                    )}
                    <td className="p-4 font-semibold text-white">{w.term}</td>
                    <td className="p-4 text-slate-200">{w.translation}</td>
                    <td className="p-4 text-slate-400 font-mono text-xs">
                      {w.transcription || '—'}
                    </td>
                    <td className="p-4 text-slate-400 text-xs italic max-w-xs truncate">
                      {w.example || '—'}
                    </td>
                    {isOwner && (
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => openEditWordModal(w)}
                          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteWord(w.id)}
                          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Word Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">
                {editingWord ? 'Edit Word' : 'Add New Word'}
              </h3>
              <button onClick={resetWordForm} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveWord} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Term <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  placeholder="e.g., destination"
                  className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Translation <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={translation}
                  onChange={(e) => setTranslation(e.target.value)}
                  placeholder="e.g., місце призначення"
                  className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Transcription (optional)
                </label>
                <input
                  type="text"
                  value={transcription}
                  onChange={(e) => setTranscription(e.target.value)}
                  placeholder="e.g., [ˌdestɪˈneɪʃn]"
                  className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Example sentence (optional)
                </label>
                <textarea
                  rows={2}
                  value={example}
                  onChange={(e) => setExample(e.target.value)}
                  placeholder="e.g., We reached our destination safely."
                  className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm outline-none focus:border-sky-500 resize-none"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={resetWordForm}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-sm font-medium hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingWord}
                  className="px-5 py-2 rounded-xl bg-sky-500 text-white text-sm font-semibold hover:bg-sky-400 disabled:opacity-50"
                >
                  {isSubmittingWord ? 'Saving...' : 'Save Word'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Import Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <Upload className="w-6 h-6 text-indigo-400" />
                <div>
                  <h3 className="text-xl font-bold text-white">Bulk Word Import</h3>
                  <p className="text-slate-400 text-xs">
                    Paste multiple lines in format: <code className="text-sky-400">word — translation</code>
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowBulkModal(false);
                  setBulkPreview(null);
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-300">
                Paste Words (Separators allowed: —, -, :, ;, Tab):
              </label>
              <textarea
                rows={8}
                value={bulkText}
                onChange={(e) => {
                  setBulkText(e.target.value);
                  setBulkPreview(null);
                }}
                placeholder={`destination — місце призначення\nluggage — багаж\ndeparture — відправлення`}
                className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-sm text-white placeholder-slate-600 outline-none focus:border-sky-500"
              />

              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">
                  Supported formats: word — translation | word : translation | word TAB translation
                </span>
                <button
                  onClick={handlePreviewBulk}
                  disabled={!bulkText.trim() || isPreviewing}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium transition"
                >
                  {isPreviewing ? 'Parsing...' : 'Preview Recognized Words'}
                </button>
              </div>
            </div>

            {/* Live Preview Section */}
            {bulkPreview && (
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <h4 className="text-lg font-bold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-sky-400" />
                  Parse Summary:
                  <span className="text-emerald-400 text-sm font-normal">
                    {bulkPreview.valid.length} valid
                  </span>
                  ,
                  <span className="text-amber-400 text-sm font-normal">
                    {bulkPreview.duplicates.length} duplicates
                  </span>
                  ,
                  <span className="text-rose-400 text-sm font-normal">
                    {bulkPreview.invalid.length} errors
                  </span>
                </h4>

                {/* Invalid / Errors */}
                {bulkPreview.invalid.length > 0 && (
                  <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 space-y-2">
                    <div className="text-rose-400 font-semibold text-sm flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Ignored Lines ({bulkPreview.invalid.length}):
                    </div>
                    <ul className="text-xs text-rose-300 space-y-1 font-mono">
                      {bulkPreview.invalid.map((inv, idx) => (
                        <li key={idx}>
                          Line {inv.line}: &quot;{inv.value}&quot; — {inv.reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Duplicates */}
                {bulkPreview.duplicates.length > 0 && (
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-2">
                    <div className="text-amber-400 font-semibold text-sm flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Skipped Duplicates ({bulkPreview.duplicates.length}):
                    </div>
                    <ul className="text-xs text-amber-300 space-y-1 font-mono">
                      {bulkPreview.duplicates.map((dup, idx) => (
                        <li key={idx}>
                          Line {dup.line}: {dup.term} — {dup.reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Valid Preview List */}
                {bulkPreview.valid.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-emerald-400 font-semibold text-sm flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      Ready to import ({bulkPreview.valid.length} words):
                    </div>
                    <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950 p-3 space-y-1 text-xs">
                      {bulkPreview.valid.map((v, i) => (
                        <div key={i} className="flex justify-between text-slate-300 py-1 border-b border-slate-900 last:border-0">
                          <span className="font-semibold text-white">{v.term}</span>
                          <span className="text-slate-400">{v.translation}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-4 flex justify-end space-x-3 border-t border-slate-800">
                  <button
                    onClick={() => {
                      setShowBulkModal(false);
                      setBulkPreview(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-sm font-medium hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmBulkImport}
                    disabled={bulkPreview.valid.length === 0 || isImporting}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-sm transition shadow-lg shadow-emerald-500/20"
                  >
                    {isImporting ? 'Importing...' : `Import ${bulkPreview.valid.length} Words`}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
