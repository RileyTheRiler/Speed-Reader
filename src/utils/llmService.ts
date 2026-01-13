import { GoogleGenerativeAI } from "@google/generative-ai";

export const generateSummary = async (text: string, apiKey: string): Promise<string> => {
    if (!apiKey) throw new Error("API Key is required");

    // Initialize the API
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Construct prompt
    const prompt = `
    Please provide a concise summary of the following text. 
    Focus on the main ideas and key takeaways.
    Keep the summary under 200 words.
    
    Text:
    ${text.slice(0, 30000)} 
    `;
    // Truncate to avoid context limit issues for massive files, though Gemini has a large window.

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const summary = response.text();
        return summary;
    } catch (error: any) {
        console.error("Error generating summary:", error);
        throw new Error(error.message || "Failed to generate summary");
    }
};
