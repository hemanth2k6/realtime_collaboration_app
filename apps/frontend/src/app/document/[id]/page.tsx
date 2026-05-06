"use client";

import React from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { CollaborativeEditor } from '@/components/CollaborativeEditor';

export default function DocumentPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading } = useAuth();
  const documentId = params.id as string;
  const workspaceName = (searchParams.get('workspaceName') || '').trim();
  const [isAuthorizing, setIsAuthorizing] = React.useState(true);
  const [accessError, setAccessError] = React.useState('');
  const apiBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api').replace(/\/$/, '');

  React.useEffect(() => {
    if (!workspaceName || !documentId) {
      setAccessError('Workspace name and document ID are required.');
      setIsAuthorizing(false);
      return;
    }

    let active = true;
    const validateAccess = async () => {
      try {
        const res = await fetch(
          `${apiBase}/workspace/${encodeURIComponent(workspaceName)}/document/${encodeURIComponent(documentId)}`
        );
        if (!active) return;
        if (!res.ok) {
          const payload = await res.json().catch(() => null);
          setAccessError(payload?.message || 'Document access denied.');
          setIsAuthorizing(false);
          return;
        }
        setAccessError('');
      } catch (error) {
        if (active) {
          setAccessError('Unable to validate document access.');
        }
      } finally {
        if (active) {
          setIsAuthorizing(false);
        }
      }
    };

    validateAccess();
    return () => {
      active = false;
    };
  }, [apiBase, documentId, workspaceName]);

  if (isLoading || isAuthorizing) return <div className="p-8">Loading...</div>;

  if (!user) {
    router.push('/login');
    return null;
  }

  if (accessError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-6">
        <div className="w-full max-w-md rounded-lg border border-red-200 bg-white p-6 text-center shadow dark:border-red-800 dark:bg-zinc-900">
          <h2 className="text-lg font-semibold text-red-700 dark:text-red-300">Access denied</h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">{accessError}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="mt-4 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950 overflow-x-hidden">
      {/* Header bar */}
      <header className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-4 md:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 sticky top-0 z-50">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <button 
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold text-sm transition-colors active:scale-95"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Dashboard
          </button>
        </div>
        <div className="text-xs md:text-sm text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/50 px-4 py-2 rounded-full border border-zinc-100 dark:border-zinc-700 w-full sm:w-auto text-center">
          Collaborating as <span className="font-bold text-zinc-900 dark:text-white">{user.email}</span>
        </div>
      </header>

      {/* Editor Main Area */}
      <main className="flex-1 p-3 md:p-12 lg:p-16">
        <CollaborativeEditor documentId={documentId} />
      </main>
    </div>
  );
}
