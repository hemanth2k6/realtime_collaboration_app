import { GoogleGenerativeAI } from "@google/generative-ai";

const PRIMARY_MODEL = "gemini-1.5-flash";
const FALLBACK_MODEL = "gemini-1.0-pro";
const MAX_RETRIES = 2;
const TIMEOUT_MS = 10000; // 10 seconds

export class AIService {
  private genAI: GoogleGenerativeAI;
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || "";
    this.genAI = new GoogleGenerativeAI(this.apiKey);
    
    if (!this.apiKey) {
      console.warn("[AI Service] Warning: GOOGLE_API_KEY is not defined.");
    } else {
      const maskedKey = this.apiKey.substring(0, 6) + "..." + this.apiKey.substring(this.apiKey.length - 4);
      console.log(`[AI Service] Initialized with key: ${maskedKey}`);
    }
  }

  /**
   * Helper to execute content generation with retry and fallback logic
   */
  private async executeWithRetry(prompt: string, useFallback = false): Promise<string> {
    const modelName = useFallback ? FALLBACK_MODEL : PRIMARY_MODEL;
    const model = this.genAI.getGenerativeModel({ model: modelName });
    
    console.log(`[AI Service] Request started (Model: ${modelName})`);

    let lastError: any;
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        // Simple timeout implementation
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Timeout")), TIMEOUT_MS)
        );

        const resultPromise = model.generateContent(prompt);
        const result = (await Promise.race([resultPromise, timeoutPromise])) as any;
        
        const response = await result.response;
        const text = response.text();
        
        if (!text) throw new Error("Empty response from AI");
        return text;

      } catch (error: any) {
        lastError = error;
        console.error(`[AI Service] Attempt ${attempt + 1} failed: ${error.message}`);
        
        // Don't retry if it's a 404 (config issue) or if we've exhausted retries
        if (error.status === 404 || attempt === MAX_RETRIES) {
          break;
        }

        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
      }
    }

    // If primary failed and we aren't already using fallback, try fallback model
    if (!useFallback) {
      console.warn(`[AI Service] Primary model failed. Attempting fallback: ${FALLBACK_MODEL}`);
      return this.executeWithRetry(prompt, true);
    }

    throw lastError;
  }

  async generateText(prompt: string): Promise<string> {
    try {
      return await this.executeWithRetry(prompt);
    } catch (error: any) {
      console.error(`[AI Service] All attempts failed: ${error.message}`);
      return "AI service temporarily unavailable";
    }
  }

  async summarizeText(text: string): Promise<string> {
    const prompt = `Summarize the following document clearly and concisely in a few sentences:\n\n${text}`;
    return this.generateText(prompt);
  }

  async suggestEdits(text: string): Promise<string> {
    const prompt = `You are an autocomplete assistant. Continue the user's text logically with a short phrase or sentence. Output ONLY the continuation, no extra text or quotes:\n\n${text}`;
    const result = await this.generateText(prompt);
    return result === "AI service temporarily unavailable" ? "" : result;
  }
}

export const aiService = new AIService();
