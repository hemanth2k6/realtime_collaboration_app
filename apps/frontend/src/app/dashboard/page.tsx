"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Document {
  id: string;
  title: string;
  workspaceId: string;
}

interface Workspace {
  id: string;
  name: string;
  documents: Document[];
}

export default function DashboardPage() {
  const { user, token, logout, isLoading } = useAuth();
  const router = useRouter();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [newDocTitle, setNewDocTitle] = useState('');
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>('');
  const [workspaceError, setWorkspaceError] = useState('');

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  const apiBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api').replace(/\/$/, '');

  const fetchWorkspaces = async () => {
    if (!token) {
      console.warn('[dashboard] fetchWorkspaces skipped: no token');
      return;
    }
    try {
      const url = `${apiBase}/workspaces`;
      console.log('[dashboard] GET', url);
      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setWorkspaces(data);
        if (data.length > 0 && !selectedWorkspaceId) {
          setSelectedWorkspaceId(data[0].id);
        }
      } else {
        const errBody = await res.text();
        console.error('[dashboard] fetchWorkspaces failed', res.status, errBody);
      }
    } catch (err) {
      console.error('[dashboard] fetchWorkspaces error', err);
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, [token]);

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    setWorkspaceError('');
    if (!token) {
      console.warn('[dashboard] createWorkspace: no token');
      setWorkspaceError('You must be logged in.');
      return;
    }
    if (!newWorkspaceName.trim()) {
      console.warn('[dashboard] createWorkspace: empty name');
      setWorkspaceError('Enter a workspace name.');
      return;
    }
    const url = `${apiBase}/workspaces`;
    console.log('[dashboard] POST', url, { name: newWorkspaceName.trim() });
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: newWorkspaceName.trim() })
      });
      const bodyText = await res.text();
      if (res.ok) {
        console.log('[dashboard] createWorkspace ok', res.status);
        setNewWorkspaceName('');
        await fetchWorkspaces();
        return;
      }
      let message = `Request failed (${res.status})`;
      try {
        const j = JSON.parse(bodyText);
        if (j?.message) message = j.message;
      } catch {
        if (bodyText) message = bodyText;
      }
      console.error('[dashboard] createWorkspace failed', res.status, bodyText);
      setWorkspaceError(message);
    } catch (err) {
      console.error('[dashboard] createWorkspace network error', err);
      setWorkspaceError('Network error — check the API is running.');
    }
  };

  const handleCreateDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocTitle.trim() || !selectedWorkspaceId || !token) return;
    try {
      const res = await fetch(`${apiBase}/workspaces/documents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title: newDocTitle, workspaceId: selectedWorkspaceId })
      });
      if (res.ok) {
        setNewDocTitle('');
        fetchWorkspaces();
      }
    } catch (err) {
      console.error('Error creating document', err);
    }
  };

  if (isLoading || !user) return <div className="p-8">Loading...</div>;

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950 p-8">
      <div className="flex justify-between items-center mb-8 max-w-5xl mx-auto w-full">
        <h1 className="text-3xl font-bold dark:text-white">Dashboard</h1>
        <div className="flex items-center gap-4">
          <span className="text-zinc-600 dark:text-zinc-400">{user.email}</span>
          <button onClick={logout} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Logout</button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto w-full grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Workspaces Sidebar */}
        <div className="col-span-1 bg-white dark:bg-zinc-900 p-6 rounded-lg shadow border border-zinc-200 dark:border-zinc-800">
          <h2 className="text-xl font-bold mb-4 dark:text-white">Your Workspaces</h2>
          
          <form onSubmit={handleCreateWorkspace} className="flex flex-col gap-2 mb-6">
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="New workspace name" 
                value={newWorkspaceName}
                onChange={e => setNewWorkspaceName(e.target.value)}
                className="flex-1 p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700 dark:text-white focus:outline-none"
              />
              <button type="submit" className="bg-blue-600 text-white px-3 py-2 rounded font-bold hover:bg-blue-700 whitespace-nowrap">
                + Create Workspace
              </button>
            </div>
            {workspaceError && (
              <p className="text-sm text-red-600 dark:text-red-400" role="alert">{workspaceError}</p>
            )}
          </form>

          <div className="flex flex-col gap-2">
            {workspaces.map(ws => (
              <button 
                key={ws.id}
                onClick={() => setSelectedWorkspaceId(ws.id)}
                className={`text-left p-3 rounded transition ${selectedWorkspaceId === ws.id ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-bold' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 dark:text-zinc-300'}`}
              >
                {ws.name}
              </button>
            ))}
            {workspaces.length === 0 && <p className="text-sm text-zinc-500">No workspaces found.</p>}
          </div>
        </div>

        {/* Documents Area */}
        <div className="col-span-1 md:col-span-2 bg-white dark:bg-zinc-900 p-6 rounded-lg shadow border border-zinc-200 dark:border-zinc-800">
          <h2 className="text-xl font-bold mb-4 dark:text-white">Documents</h2>
          
          {selectedWorkspaceId ? (
            <>
              <form onSubmit={handleCreateDocument} className="flex gap-2 mb-6">
                <input 
                  type="text" 
                  placeholder="New Document Title" 
                  value={newDocTitle}
                  onChange={e => setNewDocTitle(e.target.value)}
                  className="flex-1 p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700 dark:text-white focus:outline-none"
                />
                <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded font-bold hover:bg-green-700">Create</button>
              </form>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {workspaces.find(ws => ws.id === selectedWorkspaceId)?.documents.map(doc => (
                  <Link href={`/document/${doc.id}`} key={doc.id}>
                    <div className="p-4 border border-zinc-200 dark:border-zinc-700 rounded hover:border-blue-500 hover:shadow-md transition cursor-pointer dark:bg-zinc-800">
                      <h3 className="font-semibold text-lg dark:text-white mb-2">{doc.title}</h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">ID: {doc.id.split('-')[0]}...</p>
                    </div>
                  </Link>
                ))}
                {workspaces.find(ws => ws.id === selectedWorkspaceId)?.documents.length === 0 && (
                  <p className="text-zinc-500 text-sm">No documents in this workspace yet.</p>
                )}
              </div>
            </>
          ) : (
            <p className="text-zinc-500 text-sm">Select or create a workspace to view documents.</p>
          )}
        </div>

      </div>
    </div>
  );
}
