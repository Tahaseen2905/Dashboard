import { GoogleGenerativeAI } from "@google/generative-ai";

// Read API key manually since we can't easily rely on vite env vars in a bare node script without setup
const API_KEY = "AIzaSyA8E3cyIsYkq_6pt920q0U9mb9-ByyKVlI";

const genAI = new GoogleGenerativeAI(API_KEY);

async function listModels() {
    try {
        // There isn't a direct "listModels" on the main class in the node SDK roughly
        // actually there IS a model listing, let's try to just hit a known model with a prompt
        // to see if we can get a specific error or success.

        // BUT, the error message literally suggested: "Call ListModels to see the list..."
        // The SDK exposes this via the 'GenerativeModel' usually or a model manager. 
        // Let's check if we can use the model manager if exposed, otherwise we might fetch via REST.

        console.log("Attempting to list models via REST API...");

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);
        const data = await response.json();

        if (data.models) {
            console.log("AVAILABLE MODELS:");
            data.models.forEach(m => console.log(`- ${m.name} (${m.supportedGenerationMethods})`));
        } else {
            console.log("No models found or error:", JSON.stringify(data, null, 2));
        }

    } catch (error) {
        console.error("Error listing models:", error);
    }
}

listModels();
