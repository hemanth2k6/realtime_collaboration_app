"use client";

import React, { useState } from 'react';
import { useDocumentSocket } from '../hooks/useDocumentSocket';

interface CollaborativeEditorProps {
  documentId: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const CollaborativeEditor: React.FC<CollaborativeEditorProps> = ({ documentId }) => {
  const { content, updateContent, isConnected } = useDocumentSocket(documentId);
  
  const [summary, setSummary] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);

  const handleSummarize = async () => {
    if (!content.trim()) return;
    setIsSummarizing(true);
    setSummary(null);
    try {
      const res = await fetch(`${API_URL}/ai/summarize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });
      const data = await res.json();
      setSummary(data.summary || 'Summary could not be generated.');
    } catch (err) {
      setSummary('Error generating summary.');
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleSuggest = async () => {
    if (!content.trim()) return;
    setIsSuggesting(true);
    try {
      const res = await fetch(`${API_URL}/ai/suggest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });
      const data = await res.json();
      if (data.suggestion) {
        updateContent(content + ' ' + data.suggestion.trim());
      }
    } catch (err) {
      console.error('Error fetching suggestion', err);
    } finally {
      setIsSuggesting(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Document: {documentId}</h2>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {isConnected ? 'Connected' : 'Disconnected'}
        </span>
      </div>

      <div className="flex gap-4">
        <button 
          onClick={handleSuggest} 
          disabled={isSuggesting || !content.trim()}
          className="px-4 py-2 bg-blue-600 text-white font-semibold rounded shadow hover:bg-blue-700 disabled:opacity-50"
        >
          {isSuggesting ? 'Suggesting...' : 'AI Suggest'}
        </button>
        <button 
          onClick={handleSummarize} 
          disabled={isSummarizing || !content.trim()}
          className="px-4 py-2 bg-purple-600 text-white font-semibold rounded shadow hover:bg-purple-700 disabled:opacity-50"
        >
          {isSummarizing ? 'Summarizing...' : 'Summarize Document'}
        </button>
      </div>

      {summary && (
        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg text-purple-900 dark:text-purple-100">
          <h3 className="font-bold mb-2">AI Summary:</h3>
          <p>{summary}</p>
        </div>
      )}
      
      <textarea
        className="w-full h-96 p-4 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-black dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={content}
        onChange={(e) => updateContent(e.target.value)}
        placeholder="Start typing to collaborate in real-time..."
      />
    </div>
  );
};
