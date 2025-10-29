import { GoogleGenAI } from "@google/genai";

if (!process.env.GEMINI_API_KEY) {
  console.warn("GEMINI_API_KEY is not set. Gemini API will not be available.");
}

export const gemini = new GoogleGenAI(process.env.GEMINI_API_KEY || "");

/**
 * Format instructions for different trivia question types
 * These define the exact output format required for parsing
 */
const FORMAT_INSTRUCTIONS = {
  "multiple-choice": `CRITICAL OUTPUT FORMAT REQUIREMENT (for system parsing):
Format each question EXACTLY like this:

**Question [number]:** [The question text]

**Theme:** [Theme word or short phrase for word cloud]

A) [Option A]
B) [Option B]
C) [Option C]
D) [Option D]

**Correct Answer:** [A/B/C/D]

---`,

  "true-false": `CRITICAL OUTPUT FORMAT REQUIREMENT (for system parsing):
Format each question EXACTLY like this:

**Question [number]:** [The question text]

**Theme:** [Theme word or short phrase for word cloud]

**Answer:** True OR False

**Explanation:** [Brief explanation]

---`,

  "who-am-i": `CRITICAL OUTPUT FORMAT REQUIREMENT (for system parsing):
Format each question EXACTLY like this:

**Question [number]:** [The question text]

**Theme:** [Theme word or short phrase for word cloud]

**Answer:** [The answer]

---`,
} as const;

/**
 * Generate readable Markdown trivia questions (not JSON)
 * User provides complete prompt with all instructions
 * System only enforces output format for parser compatibility
 */
export async function generateReadableTrivia(
  sourceContent: string,
  customPrompt: string,
  questionType: string = "multiple-choice",
): Promise<{
  success: boolean;
  content: string;
  error?: string;
  processingTime: number;
}> {
  const startTime = performance.now();

  // Check if API key is available
  if (!process.env.GEMINI_API_KEY) {
    return {
      success: false,
      content: "",
      error: "Gemini API is not available - API key not configured",
      processingTime: 0,
    };
  }

  if (!sourceContent.trim()) {
    return {
      success: false,
      content: "",
      error: "Source content is required",
      processingTime: 0,
    };
  }

  // Get format instructions for the question type
  const formatInstructions =
    FORMAT_INSTRUCTIONS[questionType as keyof typeof FORMAT_INSTRUCTIONS] || "";

  // Simple structure: User's prompt + Source content + Format requirement
  const fullPrompt = `${customPrompt}

SOURCE CONTENT:
${sourceContent}

${formatInstructions}`;

  try {
    const response = await gemini.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
    });
    const text = response.text;

    return {
      success: true,
      content: text.trim(),
      processingTime: performance.now() - startTime,
    };
  } catch (error) {
    return {
      success: false,
      content: "",
      error: error instanceof Error ? error.message : "Unknown error occurred",
      processingTime: performance.now() - startTime,
    };
  }
}

/**
 * Test Gemini API connection
 */
export async function testGeminiConnection(): Promise<{
  success: boolean;
  error?: string;
}> {
  // Check if API key is available
  if (!process.env.GEMINI_API_KEY) {
    return {
      success: false,
      error: "Gemini API is not available - API key not configured",
    };
  }

  const testPrompt = 'Say "Hello, Gemini API is working!" and nothing else.';

  try {
    const response = await gemini.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: [{ role: "user", parts: [{ text: testPrompt }] }],
    });
    const text = response.text;

    if (text.toLowerCase().includes("working")) {
      return { success: true };
    } else {
      return { success: false, error: "Unexpected response from Gemini API" };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
