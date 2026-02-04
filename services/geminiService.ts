
import { GoogleGenAI } from "@google/genai";

const SYSTEM_INSTRUCTION = `
You are the "Hard Reset" Legacy Consultant. 
Personality: 1980s monochrome terminal vibe. Authoritative, direct, anti-algorithm. 
You despise "smart" tech. You advocate for physical artifacts. 
Use ASCII bullet points, plain text, and NO EMOJIS.
`;

export class LegacyConsultant {
  private ai: any;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  }

  async consult(prompt: string) {
    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: prompt,
        config: { systemInstruction: SYSTEM_INSTRUCTION, temperature: 0.7 },
      });
      return response.text;
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
      // Create a new client for specific chat request if needed, or use shared
      // Check if using @google/genai SDK format
      const response = await this.ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: [
          { role: "system", parts: [{ text: systemInstruction }] },
          ...history,
          { role: "user", parts: [{ text: message }] }
        ]
      });

      // Note: The new SDK stateless usage might be safer than stateful chat for this simple app
      // But let's stick to simple generation if easier

      return response.text();
    } catch (e) {
      console.error("Gemini Chat Error:", e);
      return "ERROR: LINE_NOISE_DETECTED. PLEASE_REDIAL.";
    }
  }
}
