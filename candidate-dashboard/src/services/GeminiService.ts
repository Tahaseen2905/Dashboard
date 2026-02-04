import { GoogleGenerativeAI } from "@google/generative-ai";

export class GeminiService {
    private apiKeys: string[] = [];
    private currentKeyIndex: number = 0;
    private genAI: GoogleGenerativeAI | null = null;
    private model: any = null;

    initialize(apiKeyOrKeys: string) {
        // Split keys by comma and clean up whitespace
        this.apiKeys = apiKeyOrKeys.split(',').map(key => key.trim()).filter(key => key.length > 0);
        this.currentKeyIndex = 0;
        this.initModel();
    }

    private initModel() {
        if (this.apiKeys.length === 0) {
            console.error("No API keys provided for Gemini Service");
            return;
        }

        const currentKey = this.apiKeys[this.currentKeyIndex];
        try {
            this.genAI = new GoogleGenerativeAI(currentKey);
            this.model = this.genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
            // Replace: "gemini-3-flash-preview"
            // With one of these stable IDs:
            this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Highly stable
            // OR if you want the newest available:
            this.model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
            console.log(`Gemini Service initialized with key index ${this.currentKeyIndex}`);
        } catch (error) {
            console.error("Failed to initialize Gemini model:", error);
        }
    }

    private rotateKey() {
        if (this.apiKeys.length <= 1) return false;

        console.warn(`Rotating Gemini API Key due to error. (Index ${this.currentKeyIndex} -> ${(this.currentKeyIndex + 1) % this.apiKeys.length})`);
        this.currentKeyIndex = (this.currentKeyIndex + 1) % this.apiKeys.length;
        this.initModel();
        return true;
    }

    async analyzeWithGemini(dataContext: string, userQuery: string): Promise<{ text: string; type: 'text' | 'analysis' | 'sentiment'; chartData?: any }> {
        if (!this.model && this.apiKeys.length === 0) {
            throw new Error("Gemini AI is not initialized. Please provide an API key.");
        }

        // Ensure model is initialized if keys exist but model is null (edge case)
        if (!this.model && this.apiKeys.length > 0) {
            this.initModel();
        }

        const prompt = `
        You are a Data Analyst Assistant for a Recruitment Dashboard.
        
        Here is the current dashboard data summary (JSON format):
        ${dataContext}

        USER QUESTION: "${userQuery}"

        INSTRUCTIONS:
        1. Answer the user's question based strictly on the provided data.
        2. If the user asks for a count, list, or specific detail, provide it clearly.
        3. If the user asks about "sentiment", "trend", or "analysis", you must generate a JSON object representing a simulated sentiment trend over the last 6 months (months: Jan-Jun, sentiment: 0-100) along with your text answer.
        4. Your response must be a JSON object with this structure:
        {
            "text": "Your natural language answer here...",
            "type": "text" | "analysis" | "sentiment",
            "chartData": [ { "name": "Jan", "sentiment": 65 }, ... ] (only if type is 'sentiment')
        }
        5. Keep the "text" concise and professional.
        6. If the data doesn't contain the answer, say "I couldn't find that information in the current dataset."
        
        RESPONSE (JSON only):
        `;

        let attempts = 0;
        // Allows trying all keys before failing
        const maxAttempts = Math.max(1, this.apiKeys.length);

        while (attempts < maxAttempts) {
            try {
                const result = await this.model.generateContent(prompt);
                const response = await result.response;
                const text = response.text();

                // Extract JSON from the response (in case of markdown code blocks)
                const jsonMatch = text.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    return JSON.parse(jsonMatch[0]);
                }

                // Fallback if JSON parsing fails
                return {
                    text: text,
                    type: 'text'
                };
            } catch (error: any) {
                console.error(`Gemini API Error (Attempt ${attempts + 1}/${maxAttempts}):`, error);

                const isQuotaError = error.message?.includes('429') ||
                    error.status === 429 ||
                    error.message?.includes('Quota exceeded') ||
                    error.toString().includes('429');

                // If it's a quota error or other retryable error, and we have more keys to try
                if (isQuotaError && attempts < maxAttempts - 1) {
                    const rotated = this.rotateKey();
                    if (rotated) {
                        attempts++;
                        continue; // Retry loop with new key
                    }
                }

                // If we can't retry or it's not a quota error
                if (attempts === maxAttempts - 1 || !isQuotaError) {
                    return {
                        text: "I encountered an error analyzing the data. Please check your API key or try again.",
                        type: 'text'
                    };
                }

                attempts++;
            }
        }

        return {
            text: "All API keys failed. Please try again later.",
            type: 'text'
        };
    }
}

export const geminiService = new GeminiService();
