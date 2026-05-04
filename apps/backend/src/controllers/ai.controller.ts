import { Request, Response } from 'express';
import { aiService } from '../services/ai.service';

export const summarizeDocument = async (req: Request, res: Response): Promise<void> => {
  try {
    const { content } = req.body;

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      res.status(400).json({ message: 'Content is required for summarization' });
      return;
    }

    const summary = await aiService.summarizeText(content);
    res.status(200).json({ summary });
  } catch (error: any) {
    console.error('[AI Controller] Summarization Error:', error?.message || error);
    res.status(200).json({ summary: "AI service temporarily unavailable" });
  }
};

export const suggestInline = async (req: Request, res: Response): Promise<void> => {
  try {
    const { content } = req.body;

    if (!content || typeof content !== 'string') {
      res.status(400).json({ message: 'Content context is required for suggestions' });
      return;
    }

    const suggestion = await aiService.suggestEdits(content);
    res.status(200).json({ suggestion });
  } catch (error: any) {
    console.error('[AI Controller] Suggestion Error:', error?.message || error);
    res.status(200).json({ suggestion: "" });
  }
};
