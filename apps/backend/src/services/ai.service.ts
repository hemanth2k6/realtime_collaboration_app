const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const PRIMARY_MODEL = process.env.AI_MODEL || "openai/gpt-4o-mini";
const FALLBACK_MODEL = "openai/gpt-4o-mini";
const MAX_RETRIES = 2;
const TIMEOUT_MS = 15000; // 15 seconds for OpenRouter

export class AIService {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY || "";
    
    if (!this.apiKey) {
      console.warn("[AI Service] Warning: OPENROUTER_API_KEY is not defined.");
    } else {
      const maskedKey = this.apiKey.substring(0, 6) + "..." + this.apiKey.substring(this.apiKey.length - 4);
      console.log(`[AI Service] Initialized with key: ${maskedKey}`);
      console.log(`[AI Service] Primary Model: ${PRIMARY_MODEL}`);
    }
  }

  private async executeWithRetry(prompt: string, useFallback = false): Promise<string> {
    const modelName = useFallback ? FALLBACK_MODEL : PRIMARY_MODEL;
    
    console.log(`[AI Service] Request started (Model: ${modelName}${useFallback ? ' - FALLBACK' : ''})`);

    let lastError: any;
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

        const response = await fetch(OPENROUTER_URL, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://collabai.local", // Optional but good practice
            "X-Title": "CollabAI"
          },
          body: JSON.stringify({
            model: modelName,
            messages: [{ role: "user", content: prompt }],
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`OpenRouter API error: ${response.status} ${JSON.stringify(errorData)}`);
        }

        const data = await response.json() as any;
        const text = data.choices?.[0]?.message?.content;
        
        if (!text) throw new Error("Empty response from OpenRouter");
        return text;

      } catch (error: any) {
        lastError = error;
        const isAbort = error.name === 'AbortError';
        console.error(`[AI Service] Attempt ${attempt + 1} failed: ${isAbort ? 'Timeout' : error.message}`);
        
        if (attempt === MAX_RETRIES) break;

        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
      }
    }

    // If primary failed, try fallback model once
    if (!useFallback && modelName !== FALLBACK_MODEL) {
      console.warn(`[AI Service] Primary model ${modelName} failed. Attempting fallback: ${FALLBACK_MODEL}`);
      return this.executeWithRetry(prompt, true);
    }

    throw lastError;
  }

  async generateText(prompt: string): Promise<string> {
    try {
      if (!this.apiKey) return "AI service temporarily unavailable (API key missing)";
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
