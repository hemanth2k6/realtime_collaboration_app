"use client";

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { CollaborativeEditor } from '@/components/CollaborativeEditor';

export default function DocumentPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const documentId = params.id as string;

  if (isLoading) return <div className="p-8">Loading...</div>;

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Header bar */}
      <header className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push('/dashboard')}
            className="text-zinc-500 hover:text-black dark:hover:text-white"
          >
            ← Back to Dashboard
          </button>
        </div>
        <div className="text-sm text-zinc-500 dark:text-zinc-400">
          Editing as: <span className="font-medium text-black dark:text-white">{user.email}</span>
        </div>
      </header>

      {/* Editor Main Area */}
      <main className="flex-1 p-8">
        <CollaborativeEditor documentId={documentId} />
      </main>
    </div>
  );
}
