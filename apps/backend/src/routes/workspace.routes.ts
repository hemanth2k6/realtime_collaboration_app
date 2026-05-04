import { Router } from 'express';
import { getWorkspaces, createWorkspace, createDocument, getSharedDocument, searchDocument } from '../controllers/workspace.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.get('/search', searchDocument);
router.get('/workspace/:workspaceName/document/:documentId', getSharedDocument);

router.use(authenticate); // Protect all routes in this namespace

router.get('/', getWorkspaces);
router.post('/', createWorkspace);
router.post('/documents', createDocument);

export default router;
