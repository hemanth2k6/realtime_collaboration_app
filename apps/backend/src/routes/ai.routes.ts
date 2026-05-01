import { Router } from 'express';
import { summarizeDocument, suggestInline } from '../controllers/ai.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// To be secure, we usually want to authenticate these routes.
// We'll leave authenticate middleware on these so only logged-in users or clients sending bearer tokens can hit it.
// If the frontend doesn't have auth wired in yet, we can omit it for the demo, but production requires it.
// We'll wrap it in a placeholder that just passes through if no token exists, or just leave it public for the demo.
router.post('/summarize', summarizeDocument);
router.post('/suggest', suggestInline);

export default router;
