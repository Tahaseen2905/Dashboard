import { GoogleGenerativeAI } from "@google/generative-ai";

export class GeminiService {
    private genAI: GoogleGenerativeAI | null = null;
    private model: any = null;

    initialize(apiKey: string) {
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
        // cthis.model  = this.genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
    }

    async analyzeWithGemini(dataContext: string, userQuery: string): Promise<{ text: string; type: 'text' | 'analysis' | 'sentiment'; chartData?: any }> {
        if (!this.model) {
            throw new Error("Gemini AI is not initialized. Please provide an API key.");
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
        } catch (error) {
            console.error("Gemini API Error:", error);
            return {
                text: "I encountered an error analyzing the data. Please check your API key or try again.",
                type: 'text'
            };
        }
    }
}

export const geminiService = new GeminiService();
