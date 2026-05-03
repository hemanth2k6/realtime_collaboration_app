import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { sharedFunction } from 'shared';
import authRoutes from './routes/auth.routes';

dotenv.config();

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

app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
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
