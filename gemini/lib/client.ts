import { GoogleGenAI } from "@google/genai";

if (!process.env.GEMINI_API_KEY) {
  console.warn("GEMINI_API_KEY is not set. Gemini API will not be available.");
}

export const gemini = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
});
