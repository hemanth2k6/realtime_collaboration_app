"use client";

import React, { useState } from 'react';
import { useDocumentSocket } from '../hooks/useDocumentSocket';

interface CollaborativeEditorProps {
  documentId: string;
}

export const CollaborativeEditor: React.FC<CollaborativeEditorProps> = ({ documentId }) => {
  const { content, updateContent, isConnected } = useDocumentSocket(documentId);

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Document: {documentId}</h2>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {isConnected ? 'Connected' : 'Disconnected'}
        </span>
      </div>
      
      <textarea
        className="w-full h-96 p-4 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-black dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={content}
        onChange={(e) => updateContent(e.target.value)}
        placeholder="Start typing to collaborate in real-time..."
      />
    </div>
  );
};
