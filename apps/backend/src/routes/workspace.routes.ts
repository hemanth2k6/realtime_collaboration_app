import { Router } from 'express';
import { getWorkspaces, createWorkspace, createDocument } from '../controllers/workspace.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate); // Protect all routes in this namespace

router.get('/', getWorkspaces);
router.post('/', createWorkspace);
router.post('/documents', createDocument);

export default router;
