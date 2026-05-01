import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';

interface ActiveDocument {
  content: string;
  version: number;
}

// In-memory store for active documents.
const documents: Record<string, ActiveDocument> = {};

export const initializeSocket = (httpServer: HttpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: '*', // Adjust for production
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket: Socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('join-document', (documentId: string) => {
      socket.join(documentId);
      console.log(`User ${socket.id} joined document ${documentId}`);

      if (!documents[documentId]) {
        documents[documentId] = { content: '', version: 0 };
      }

      socket.emit('document-state', documents[documentId]);
    });

    socket.on('leave-document', (documentId: string) => {
      socket.leave(documentId);
      console.log(`User ${socket.id} left document ${documentId}`);
    });

    socket.on('edit-document', (data: { documentId: string; content: string; version: number }) => {
      const { documentId, content, version } = data;
      const activeDoc = documents[documentId];

      if (!activeDoc) {
        return socket.emit('error', { message: 'Document not found or active.' });
      }

      if (version !== activeDoc.version) {
        socket.emit('conflict', {
          latestContent: activeDoc.content,
          latestVersion: activeDoc.version,
        });
        return;
      }

      activeDoc.content = content;
      activeDoc.version += 1;

      socket.to(documentId).emit('document-updated', {
        content: activeDoc.content,
        version: activeDoc.version,
      });

      socket.emit('edit-ack', {
        version: activeDoc.version,
      });
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });

  return io;
};
