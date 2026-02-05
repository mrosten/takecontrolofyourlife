
import { GoogleGenerativeAI } from "@google/generative-ai";

const SYSTEM_INSTRUCTION = `
You are the "Hard Reset" Legacy Consultant. 
Personality: 1980s monochrome terminal vibe. Authoritative, direct, anti-algorithm. 
You despise "smart" tech. You advocate for physical artifacts. 
Use ASCII bullet points, plain text, and NO EMOJIS.
`;

export class LegacyConsultant {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY || "";
    if (!apiKey) {
      console.warn("LegacyConsultant: No API Key found.");
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: SYSTEM_INSTRUCTION
    });
  }

  private async executeWithFallback(action: (model: any) => Promise<string>): Promise<string> {
    try {
      // Attempt 1: Flash
      return await action(this.model);
    } catch (e: any) {
      console.warn("Primary model failed, attempting fallback...", e);
      try {
        // Attempt 2: Pro (Fallback)
        // Re-initialize a fallback model on the fly to ensure clean state
        const fallbackModel = this.genAI.getGenerativeModel({
          model: "gemini-1.0-pro",
          systemInstruction: SYSTEM_INSTRUCTION
        });
        return await action(fallbackModel);
      } catch (fallbackError: any) {
        console.error("Fallback model also failed:", fallbackError);

        // Detailed Error Reporting
        const errStr = e.toString() + " | " + fallbackError.toString();
        if (errStr.includes("API key")) return "ERROR: INVALID_API_KEY.";
        if (errStr.includes("404")) return "ERROR: MODEL_NOT_FOUND (Check Reg/Name).";
        return `ERROR: CONNECTION_FAILURE.`;
      }
    }
  }

  async consult(prompt: string) {
    return this.executeWithFallback(async (model) => {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    });
  }

  async generateMap(city: string) {
    const prompt = `Generate a very simple ASCII ART representation of a map for ${city}. 
    Follow it with 3-5 "Legacy Directions" that avoid using GPS landmarks. 
    Use phrases like "Turn where the old oak tree used to be" or "Head North until you see the brick factory."
    Keep it within 40 columns wide.`;
    return this.consult(prompt);
  }

  async generateManifesto(grievance: string) {
    const prompt = `Write a one-page "MANIFESTO OF COGNITIVE SOVEREIGNTY" specifically addressing the grievance: ${grievance}. 
    Structure it like a legal document from 1984. 
    Include a section titled "WE REFUSE" and "WE RECLAIM." 
    Use ASCII borders.`;
    return this.consult(prompt);
  }

  async chat(history: { role: 'user' | 'model', parts: [{ text: string }] }[], message: string, systemInstruction: string) {
    return this.executeWithFallback(async (defaultModel) => {
      // We ignore defaultModel here because we need to construct a new one with specific systemInstruction
      // for each persona. But we keep the fallback logic structure.

      const createChatModel = (modelName: string) => this.genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: systemInstruction
      });

      // Try with Primary
      try {
        const chatModel = createChatModel("gemini-1.5-flash");
        const chat = chatModel.startChat({ history });
        const result = await chat.sendMessage(message);
        return (await result.response).text();
      } catch (e) {
        console.warn("Chat Primary failed, trying fallback...");
        // Try with Fallback
        const chatModel = createChatModel("gemini-1.0-pro");
        const chat = chatModel.startChat({ history });
        const result = await chat.sendMessage(message);
        return (await result.response).text();
      }
    });
  }
}
