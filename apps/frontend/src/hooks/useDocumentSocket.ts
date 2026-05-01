import { useEffect, useState, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
// Strip /api if present for socket connection
const SOCKET_URL = NEXT_PUBLIC_API_URL.replace('/api', '');

export function useDocumentSocket(documentId: string) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [content, setContent] = useState('');
  const [version, setVersion] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  
  // Track if the current content was an external update to prevent echo
  const isExternalUpdate = useRef(false);

  useEffect(() => {
    if (!documentId) return;

    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      setIsConnected(true);
      newSocket.emit('join-document', documentId);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    // Initial state upon joining
    newSocket.on('document-state', (data: { content: string; version: number }) => {
      isExternalUpdate.current = true;
      setContent(data.content);
      setVersion(data.version);
    });

    // Handle updates from other users
    newSocket.on('document-updated', (data: { content: string; version: number }) => {
      isExternalUpdate.current = true;
      setContent(data.content);
      setVersion(data.version);
    });

    // Acknowledge successful edit from server
    newSocket.on('edit-ack', (data: { version: number }) => {
      setVersion(data.version);
    });

    // Handle OCC conflict
    newSocket.on('conflict', (data: { latestContent: string; latestVersion: number }) => {
      console.warn('Conflict detected, applying server state.');
      isExternalUpdate.current = true;
      setContent(data.latestContent);
      setVersion(data.latestVersion);
    });

    return () => {
      newSocket.emit('leave-document', documentId);
      newSocket.disconnect();
    };
  }, [documentId]);

  const updateContent = useCallback((newContent: string) => {
    setContent(newContent);
    isExternalUpdate.current = false;
    
    if (socket && isConnected) {
      socket.emit('edit-document', {
        documentId,
        content: newContent,
        version: version, // We send the version we *think* it is
      });
    }
  }, [documentId, socket, isConnected, version]);

  return {
    content,
    updateContent,
    isConnected,
    isExternalUpdate,
  };
}
