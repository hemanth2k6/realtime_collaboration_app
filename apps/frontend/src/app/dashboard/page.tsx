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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col overflow-x-hidden">
      {/* Header */}
      <header className="h-16 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 md:px-6 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden p-2 -ml-2 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">C</span>
            </div>
            <h1 className="text-xl font-bold dark:text-white">CollabAI</h1>
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <span className="text-sm text-zinc-500 dark:text-zinc-400 hidden sm:block truncate max-w-[150px]">{user.email}</span>
          <button onClick={logout} className="px-3 py-1.5 md:px-4 md:py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-sm">
            Logout
          </button>
        </div>
      </header>

      <div className="flex-1 flex relative">
        {/* Mobile Sidebar Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-[60] lg:hidden transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
        )}

        {/* Sidebar (Desktop & Mobile) */}
        <aside className={`
          fixed lg:static inset-y-0 left-0 w-72 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 
          transform transition-transform duration-300 ease-in-out z-[70] lg:translate-x-0
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="flex flex-col h-full">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between lg:block">
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-white mb-0 lg:mb-4">Workspaces</h2>
              <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden p-1 text-zinc-400">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-4 bg-zinc-50/50 dark:bg-zinc-800/30">
              <form onSubmit={handleCreateWorkspace} className="space-y-2">
                <input 
                  type="text" 
                  placeholder="Workspace name..." 
                  value={newWorkspaceName}
                  onChange={e => setNewWorkspaceName(e.target.value)}
                  className="w-full text-sm p-2.5 border border-zinc-200 dark:border-zinc-800 rounded-lg dark:bg-zinc-950 dark:text-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                />
                <button
                  type="submit"
                  disabled={isCreatingWorkspace}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2.5 rounded-lg transition-colors disabled:opacity-50 shadow-sm"
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
                  onClick={() => {
                    setSelectedWorkspaceId(ws.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all flex items-center gap-3 ${selectedWorkspaceId === ws.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
                >
                  <span className="w-2 h-2 rounded-full bg-current opacity-40"></span>
                  <span className="font-medium truncate">{ws.name}</span>
                </button>
              ))}
              {workspaces.length === 0 && <div className="p-8 text-center text-xs text-zinc-400">No workspaces yet</div>}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0 overflow-y-auto p-4 md:p-10 bg-zinc-50 dark:bg-zinc-950/50">
          <div className="max-w-5xl mx-auto space-y-6 md:space-y-10">
            
            {/* Quick Open Section */}
            <section className="bg-white dark:bg-zinc-900 p-5 md:p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Quick Open</h2>
              </div>
              <form onSubmit={handleOpenDocument} className="flex flex-col md:flex-row gap-3">
                <input
                  type="text"
                  placeholder="Workspace name"
                  value={searchWorkspaceName}
                  onChange={(e) => setSearchWorkspaceName(e.target.value)}
                  className="flex-1 text-sm p-3 border border-zinc-200 dark:border-zinc-800 rounded-xl dark:bg-zinc-950 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
                <input
                  type="text"
                  placeholder="Document ID"
                  value={searchDocumentId}
                  onChange={(e) => setSearchDocumentId(e.target.value)}
                  className="flex-1 text-sm p-3 border border-zinc-200 dark:border-zinc-800 rounded-xl dark:bg-zinc-950 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
                <button type="submit" className="bg-zinc-900 dark:bg-white dark:text-zinc-900 text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors shadow-lg">
                  Open
                </button>
              </form>
              {searchError && <p className="text-xs text-red-500 mt-2">{searchError}</p>}
            </section>

            {/* Documents Section */}
            <section>
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <h2 className="text-xl md:text-2xl font-black text-zinc-900 dark:text-white">
                  {selectedWorkspace ? `${selectedWorkspace.name}` : 'Select a Workspace'}
                </h2>
                
                {selectedWorkspace && (
                  <form onSubmit={handleCreateDocument} className="flex gap-2 w-full md:max-w-xs">
                    <input 
                      type="text" 
                      placeholder="New document..." 
                      value={newDocTitle}
                      onChange={e => setNewDocTitle(e.target.value)}
                      className="flex-1 text-sm p-3 border border-zinc-200 dark:border-zinc-800 rounded-xl dark:bg-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-inner"
                    />
                    <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-xl text-sm font-bold transition-colors shadow-lg shadow-emerald-500/10">
                      Create
                    </button>
                  </form>
                )}
              </div>

              {selectedWorkspace ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {selectedWorkspace.documents.map(doc => (
                    <Link
                      href={`/document/${doc.id}?workspaceName=${encodeURIComponent(selectedWorkspace.name)}`}
                      key={doc.id}
                      className="group block"
                    >
                      <div className="h-full p-5 md:p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-xl transition-all active:scale-[0.98]">
                        <div className="flex items-center justify-between mb-4">
                          <div className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 transition-colors">
                             <svg className="w-6 h-6 text-zinc-500 group-hover:text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                             </svg>
                          </div>
                          <span className="text-[10px] font-mono text-zinc-400 bg-zinc-50 dark:bg-zinc-800 px-2 py-1 rounded">ID: {doc.id.split('-')[0]}</span>
                        </div>
                        <h3 className="font-bold text-lg text-zinc-900 dark:text-white group-hover:text-indigo-600 transition-colors truncate">{doc.title}</h3>
                        <p className="mt-2 text-xs text-zinc-500">Tap to edit and collaborate</p>
                      </div>
                    </Link>
                  ))}
                  {selectedWorkspace.documents.length === 0 && (
                    <div className="col-span-full py-16 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl">
                       <div className="mx-auto w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-3 text-zinc-400">
                         <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                       </div>
                       <p className="text-zinc-500 font-medium">No documents yet. Create one above!</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-24 text-center bg-zinc-100/50 dark:bg-zinc-900/50 rounded-3xl border border-zinc-200 dark:border-zinc-800 flex flex-col items-center">
                  <div className="w-16 h-16 bg-white dark:bg-zinc-800 rounded-2xl shadow-sm flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                  </div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Workspace Required</h3>
                  <p className="text-zinc-500 max-w-xs mx-auto mt-2">Open the menu or use the sidebar to select a workspace and start collaborating.</p>
                  <button onClick={() => setIsMobileMenuOpen(true)} className="mt-6 lg:hidden px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20">
                    Open Menu
                  </button>
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

