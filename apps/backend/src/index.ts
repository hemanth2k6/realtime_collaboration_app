import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { sharedFunction } from 'shared';
import authRoutes from './routes/auth.routes';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

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
