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
  const [searchWorkspaceName, setSearchWorkspaceName] = useState('');
  const [searchDocumentId, setSearchDocumentId] = useState('');
  const [searchError, setSearchError] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  const apiBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api').replace(/\/$/, '');

  const fetchWorkspaces = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${apiBase}/workspaces`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setWorkspaces(data);
        if (data.length > 0 && !selectedWorkspaceId) {
          setSelectedWorkspaceId(data[0].id);
        }
      }
    } catch (err) {
      console.error('Error fetching workspaces:', err);
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, [token]);

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    setWorkspaceError('');
    if (!token || !newWorkspaceName.trim()) {
      setWorkspaceError('Please enter a workspace name.');
      return;
    }
    try {
      setIsCreatingWorkspace(true);
      const res = await fetch(`${apiBase}/workspaces`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: newWorkspaceName.trim() })
      });
      if (res.ok) {
        setNewWorkspaceName('');
        await fetchWorkspaces();
      } else {
        const data = await res.json();
        setWorkspaceError(data.message || 'Failed to create workspace');
      }
    } catch (err) {
      setWorkspaceError('Network error while creating workspace.');
    } finally {
      setIsCreatingWorkspace(false);
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
      console.error('Error creating document:', err);
    }
  };

  const handleOpenDocument = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError('');
    const wsName = searchWorkspaceName.trim();
    const docId = searchDocumentId.trim();
    if (!wsName || !docId) {
      setSearchError('Both fields are required.');
      return;
    }
    router.push(`/document/${encodeURIComponent(docId)}?workspaceName=${encodeURIComponent(wsName)}`);
  };

  if (isLoading || !user) return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <div className="animate-pulse text-zinc-500 text-lg font-medium">Loading your workspace...</div>
    </div>
  );

  const selectedWorkspace = workspaces.find(ws => ws.id === selectedWorkspaceId);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col">
      {/* Header */}
      <header className="h-16 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-6 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">C</span>
          </div>
          <h1 className="text-xl font-bold dark:text-white hidden sm:block">CollabAI</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-zinc-500 dark:text-zinc-400 hidden md:block">{user.email}</span>
          <button onClick={logout} className="text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-red-600 transition-colors">Logout</button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-72 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col hidden lg:flex">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-white mb-4">Workspaces</h2>
            <form onSubmit={handleCreateWorkspace} className="space-y-2">
              <input 
                type="text" 
                placeholder="Name" 
                value={newWorkspaceName}
                onChange={e => setNewWorkspaceName(e.target.value)}
                className="w-full text-sm p-2 border border-zinc-200 dark:border-zinc-800 rounded dark:bg-zinc-950 dark:text-white focus:ring-1 focus:ring-indigo-500 outline-none"
              />
              <button
                type="submit"
                disabled={isCreatingWorkspace}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2 rounded transition-colors disabled:opacity-50"
              >
                {isCreatingWorkspace ? 'Creating...' : '+ Create Workspace'}
              </button>
              {workspaceError && <p className="text-[10px] text-red-500 mt-1">{workspaceError}</p>}
            </form>
          </div>
          
          <nav className="flex-1 overflow-y-auto p-2 space-y-1">
            {workspaces.map(ws => (
              <button 
                key={ws.id}
                onClick={() => setSelectedWorkspaceId(ws.id)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-all ${selectedWorkspaceId === ws.id ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 font-semibold border border-indigo-100 dark:border-indigo-900/30' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'}`}
              >
                {ws.name}
              </button>
            ))}
            {workspaces.length === 0 && <div className="p-4 text-center text-xs text-zinc-400">No workspaces yet</div>}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-10">
          <div className="max-w-4xl mx-auto space-y-8">
            
            {/* Quick Open Section */}
            <section className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-4">Quick Open</h2>
              <form onSubmit={handleOpenDocument} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="Workspace name"
                  value={searchWorkspaceName}
                  onChange={(e) => setSearchWorkspaceName(e.target.value)}
                  className="flex-1 text-sm p-2.5 border border-zinc-200 dark:border-zinc-800 rounded-lg dark:bg-zinc-950 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
                <input
                  type="text"
                  placeholder="Document ID"
                  value={searchDocumentId}
                  onChange={(e) => setSearchDocumentId(e.target.value)}
                  className="flex-1 text-sm p-2.5 border border-zinc-200 dark:border-zinc-800 rounded-lg dark:bg-zinc-950 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
                <button type="submit" className="bg-zinc-900 dark:bg-white dark:text-zinc-900 text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors">
                  Open
                </button>
              </form>
              {searchError && <p className="text-xs text-red-500 mt-2">{searchError}</p>}
            </section>

            {/* Mobile Workspace Selector (Hidden on desktop) */}
            <section className="lg:hidden">
               <label className="block text-sm font-medium mb-2 dark:text-white">Active Workspace</label>
               <select 
                 className="w-full p-2.5 border border-zinc-200 dark:border-zinc-800 rounded-lg dark:bg-zinc-900 dark:text-white"
                 value={selectedWorkspaceId}
                 onChange={(e) => setSelectedWorkspaceId(e.target.value)}
               >
                 {workspaces.map(ws => <option key={ws.id} value={ws.id}>{ws.name}</option>)}
               </select>
            </section>

            {/* Documents Section */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
                  {selectedWorkspace ? `${selectedWorkspace.name} / Documents` : 'Select a Workspace'}
                </h2>
              </div>

              {selectedWorkspace ? (
                <div className="space-y-6">
                  <form onSubmit={handleCreateDocument} className="flex gap-2 max-w-md">
                    <input 
                      type="text" 
                      placeholder="New document title..." 
                      value={newDocTitle}
                      onChange={e => setNewDocTitle(e.target.value)}
                      className="flex-1 text-sm p-2.5 border border-zinc-200 dark:border-zinc-800 rounded-lg dark:bg-zinc-950 dark:text-white outline-none focus:ring-2 focus:ring-green-500/20"
                    />
                    <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg text-sm font-bold transition-colors">
                      Create
                    </button>
                  </form>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedWorkspace.documents.map(doc => (
                      <Link
                        href={`/document/${doc.id}?workspaceName=${encodeURIComponent(selectedWorkspace.name)}`}
                        key={doc.id}
                        className="group"
                      >
                        <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-md transition-all">
                          <div className="flex items-start justify-between">
                            <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 transition-colors">
                               <svg className="w-5 h-5 text-zinc-500 group-hover:text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                               </svg>
                            </div>
                            <span className="text-[10px] font-mono text-zinc-400 bg-zinc-50 dark:bg-zinc-800 px-2 py-1 rounded">ID: {doc.id.split('-')[0]}</span>
                          </div>
                          <h3 className="mt-4 font-bold text-lg text-zinc-900 dark:text-white group-hover:text-indigo-600 transition-colors">{doc.title}</h3>
                          <p className="mt-1 text-sm text-zinc-500">Last edited just now</p>
                        </div>
                      </Link>
                    ))}
                    {selectedWorkspace.documents.length === 0 && (
                      <div className="col-span-full py-12 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
                         <p className="text-zinc-500">No documents found in this workspace.</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="py-20 text-center bg-zinc-100/50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                  <p className="text-zinc-500 font-medium">Select a workspace from the sidebar to view documents.</p>
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

