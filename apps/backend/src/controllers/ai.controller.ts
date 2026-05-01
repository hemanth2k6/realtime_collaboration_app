import { Request, Response } from 'express';
import OpenAI from 'openai';

// We instantiate the client but handle the case where the key might be missing gracefully
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy_key_if_missing',
});

export const summarizeDocument = async (req: Request, res: Response): Promise<void> => {
  try {
    const { content } = req.body;

    if (!content) {
      res.status(400).json({ message: 'Content is required for summarization' });
      return;
    }

    if (!process.env.OPENAI_API_KEY) {
      // Return a mock summary if no API key is provided
      res.status(200).json({ summary: 'This is a mocked summary because OPENAI_API_KEY is not set. The document contains ' + content.split(' ').length + ' words.' });
      return;
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are an assistant that summarizes documents concisely.' },
        { role: 'user', content: `Summarize the following document:\n\n${content}` }
      ],
      max_tokens: 150,
    });

    const summary = response.choices[0]?.message?.content || 'Unable to generate summary.';
    res.status(200).json({ summary });
  } catch (error) {
    console.error('Summarize Error:', error);
    res.status(500).json({ message: 'Internal server error while summarizing' });
  }
};

export const suggestInline = async (req: Request, res: Response): Promise<void> => {
  try {
    const { content } = req.body;

    if (!content) {
      res.status(400).json({ message: 'Content context is required for suggestions' });
      return;
    }

    if (!process.env.OPENAI_API_KEY) {
      // Mock suggestion
      res.status(200).json({ suggestion: ' (Mocked suggestion: ...and then the AI completed the sentence.)' });
      return;
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are an autocomplete assistant. Continue the user\'s text logically with 1 to 2 sentences. Do not repeat their text, just output the continuation.' },
        { role: 'user', content: content }
      ],
      max_tokens: 50,
    });

    const suggestion = response.choices[0]?.message?.content || '';
    res.status(200).json({ suggestion });
  } catch (error) {
    console.error('Suggest Error:', error);
    res.status(500).json({ message: 'Internal server error while generating suggestion' });
  }
};
