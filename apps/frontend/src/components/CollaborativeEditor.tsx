"use client";

import React, { useState } from 'react';
import { useDocumentSocket } from '../hooks/useDocumentSocket';

interface CollaborativeEditorProps {
  documentId: string;
}

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api').replace(/\/$/, '');

export const CollaborativeEditor: React.FC<CollaborativeEditorProps> = ({ documentId }) => {
  const { content, updateContent, isConnected } = useDocumentSocket(documentId);
  
  const [summary, setSummary] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSummarize = async () => {
    if (!content.trim()) return;
    setIsSummarizing(true);
    setSummary(null);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/ai/summarize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to summarize');
      setSummary(data.summary || 'Summary could not be generated.');
    } catch (err: any) {
      setError(err.message || 'Error generating summary.');
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleSuggest = async () => {
    if (!content.trim()) return;
    setIsSuggesting(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/ai/suggest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to get suggestion');
      if (data.suggestion) {
        updateContent(content + ' ' + data.suggestion.trim());
      }
    } catch (err: any) {
      console.error('Error fetching suggestion', err);
      setError('Failed to get AI suggestion.');
    } finally {
      setIsSuggesting(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6 p-4 md:p-0">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
             <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
             </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white leading-tight">Editor</h2>
            <p className="text-xs text-zinc-500 font-mono">{documentId}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 bg-zinc-50 dark:bg-zinc-800 rounded-full border border-zinc-100 dark:border-zinc-700">
             <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
             <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
               {isConnected ? 'Live Syncing' : 'Offline'}
             </span>
          </div>
        </div>
      </div>

      {/* AI Controls */}
      <div className="flex flex-wrap gap-3">
        <button 
          onClick={handleSuggest} 
          disabled={isSuggesting || !content.trim()}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:shadow-none"
        >
          {isSuggesting ? (
            <><svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Thinking...</>
          ) : '✨ AI Suggest'}
        </button>
        <button 
          onClick={handleSummarize} 
          disabled={isSummarizing || !content.trim()}
          className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm font-bold rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-all shadow-sm disabled:opacity-50"
        >
          {isSummarizing ? (
            <><svg className="animate-spin h-4 w-4 text-indigo-600" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Summarizing...</>
          ) : '📝 Summarize'}
        </button>
      </div>

      {/* Alerts/Feedback */}
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-red-700 dark:text-red-300 text-sm">
           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
           {error}
        </div>
      )}

      {summary && (
        <div className="p-5 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-xl text-indigo-900 dark:text-indigo-100 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              AI Summary
            </h3>
            <button onClick={() => setSummary(null)} className="text-zinc-400 hover:text-zinc-600">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <p className="text-sm leading-relaxed italic">"{summary}"</p>
        </div>
      )}
      
      {/* Editor Area */}
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-0 group-focus-within:opacity-10 transition duration-500"></div>
        <textarea
          className="relative w-full h-[600px] p-6 border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-mono text-sm leading-relaxed shadow-xl focus:outline-none focus:ring-0 transition-all resize-none"
          value={content}
          onChange={(e) => updateContent(e.target.value)}
          placeholder="Start collaborating with your team and AI..."
        />
        <div className="absolute bottom-4 right-4 flex items-center gap-2 text-[10px] font-mono text-zinc-400 uppercase tracking-widest pointer-events-none">
           <span>{content.length} characters</span>
           <span className="w-1 h-1 bg-zinc-300 rounded-full"></span>
           <span>{content.split(/\s+/).filter(Boolean).length} words</span>
        </div>
      </div>
    </div>
  );
};
