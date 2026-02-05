
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
      model: "gemini-1.5-flash-001",
      systemInstruction: SYSTEM_INSTRUCTION
    });
  }

  async consult(prompt: string) {
    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (e) {
      console.error("Gemini Error:", e);
      return "ERROR: CONNECTION_TIMEOUT.";
    }
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
    try {
      // For chat, we can instantiate a specific model with the persona instructions
      const chatModel = this.genAI.getGenerativeModel({
        model: "gemini-1.5-flash-001",
        systemInstruction: systemInstruction
      });

      const chat = chatModel.startChat({
        history: history,
      });

      const result = await chat.sendMessage(message);
      const response = await result.response;
      return response.text();
    } catch (e: any) {
      console.error("Gemini Chat Error:", e);
      // Return the actual error to help debugging (especially for API Key issues)
      const errStr = e.toString();
      if (errStr.includes("API key")) return "ERROR: INVALID_API_KEY_DETECTED.";
      if (errStr.includes("400")) return "ERROR: BAD_REQUEST_SIGNAL.";
      return `ERROR: ${e.message || "LINE_NOISE_DETECTED"}.`;
    }
  }
}
