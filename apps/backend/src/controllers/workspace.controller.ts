import { Request, Response } from 'express';
import prisma from '../config/db';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getWorkspaces = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const workspaces = await prisma.workspace.findMany({
      where: {
        members: {
          some: { userId }
        }
      },
      include: {
        documents: true
      }
    });

    res.status(200).json(workspaces);
  } catch (error) {
    console.error('Error fetching workspaces:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createWorkspace = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const name = req.body?.name?.trim();

    if (!userId || !name) {
      res.status(400).json({ message: 'Invalid data' });
      return;
    }

    const existing = await prisma.workspace.findUnique({
      where: { name }
    });
    if (existing) {
      res.status(409).json({ message: 'Workspace name already exists' });
      return;
    }

    const workspace = await prisma.workspace.create({
      data: {
        name,
        members: {
          create: { userId, role: 'OWNER' }
        }
      }
    });

    res.status(201).json(workspace);
  } catch (error: any) {
    if (error?.code === 'P2002') {
      res.status(409).json({ message: 'Workspace name already exists' });
      return;
    }
    console.error('Error creating workspace:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createDocument = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { workspaceId, title } = req.body;

    if (!workspaceId || !title) {
      res.status(400).json({ message: 'Invalid data' });
      return;
    }

    const document = await prisma.document.create({
      data: { title, workspaceId, content: '' }
    });

    res.status(201).json(document);
  } catch (error) {
    console.error('Error creating document:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getSharedDocument = async (req: Request, res: Response): Promise<void> => {
  try {
    const workspaceName = req.params.workspaceName?.trim();
    const documentId = req.params.documentId?.trim();

    if (!workspaceName || !documentId) {
      res.status(400).json({ message: 'workspaceName and documentId are required' });
      return;
    }

    const workspace = await prisma.workspace.findUnique({
      where: { name: workspaceName }
    });

    if (!workspace) {
      res.status(404).json({ message: 'Workspace not found' });
      return;
    }

    const document = await prisma.document.findUnique({
      where: { id: documentId }
    });

    if (!document) {
      res.status(404).json({ message: 'Document not found' });
      return;
    }

    if (document.workspaceId !== workspace.id) {
      res.status(403).json({ message: 'Document does not belong to the provided workspace' });
      return;
    }

    res.status(200).json({
      id: document.id,
      title: document.title,
      content: document.content,
      workspace: {
        id: workspace.id,
        name: workspace.name
      }
    });
  } catch (error) {
    console.error('Error fetching shared document:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const searchDocument = async (req: Request, res: Response): Promise<void> => {
  try {
    const workspaceName = String(req.query.workspaceName || '').trim();
    const documentId = String(req.query.documentId || '').trim();

    if (!workspaceName || !documentId) {
      res.status(400).json({ message: 'workspaceName and documentId are required' });
      return;
    }

    const workspace = await prisma.workspace.findUnique({
      where: { name: workspaceName }
    });

    if (!workspace) {
      res.status(404).json({ message: 'Workspace not found' });
      return;
    }

    const document = await prisma.document.findUnique({
      where: { id: documentId }
    });

    if (!document) {
      res.status(404).json({ message: 'Document not found' });
      return;
    }

    if (document.workspaceId !== workspace.id) {
      res.status(403).json({ message: 'Invalid workspace/document combination' });
      return;
    }

    res.status(200).json({
      workspaceName: workspace.name,
      documentId: document.id,
      title: document.title
    });
  } catch (error) {
    console.error('Error searching document:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
