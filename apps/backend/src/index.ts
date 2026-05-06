import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { sharedFunction } from 'shared';
import authRoutes from './routes/auth.routes';

dotenv.config();

// Diagnostic log for AI Key (Masked for security)
const aiKey = process.env.OPENROUTER_API_KEY;
if (aiKey) {
  const masked = aiKey.substring(0, 6) + "..." + aiKey.substring(aiKey.length - 4);
  console.log(`[Config] OpenRouter API Key detected: ${masked}`);
} else {
  console.warn("[Config] Warning: No OPENROUTER_API_KEY found in environment variables.");
}

const app = express();

const DEFAULT_PORT = 5001;
const parsed = process.env.PORT ? parseInt(process.env.PORT, 10) : DEFAULT_PORT;
/** Never bind the HTTP server to 5432 — that belongs to PostgreSQL and causes protocol errors if traffic is misrouted. */
const port =
  Number.isFinite(parsed) && parsed > 0 && parsed !== 5432 ? parsed : DEFAULT_PORT;

app.use(cors());
app.use(express.json());

// Routes
import aiRoutes from './routes/ai.routes';
import workspaceRoutes from './routes/workspace.routes';
import { getSharedDocument, searchDocument } from './controllers/workspace.controller';

app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.get('/api/search', searchDocument);
app.get('/api/workspace/:workspaceName/document/:documentId', getSharedDocument);
app.use('/api/workspaces', workspaceRoutes);

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.get('/api/message', (req: Request, res: Response) => {
  res.json({ message: sharedFunction() });
});

import { createServer } from 'http';
import { initializeSocket } from './socket';

const httpServer = createServer(app);
initializeSocket(httpServer);

httpServer.listen(port, () => {
  console.log(`Backend and Socket.io are running on http://localhost:${port}`);
});
