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
    const { name } = req.body;

    if (!userId || !name) {
      res.status(400).json({ message: 'Invalid data' });
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
  } catch (error) {
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
