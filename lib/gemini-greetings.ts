/**
 * Unified Gemini AI Greetings Content Generator
 * Generates friendly greetings and daily messages with strict format enforcement
 * Integrates with unified content table
 */

import { gemini } from "@/lib/gemini";
import { CollectionContent } from "./types";
import { cleanJsonString } from "./content-helpers";

export interface GreetingsGenerationRequest {
  sourceContent: string;
  customPrompt: string;
}

export interface GreetingsGenerationResponse {
  success: boolean;
  data?: CollectionContent[];
  error?: string;
}

/**
 * Generate greetings content using Gemini AI
 * @param request The generation request containing source content and a custom prompt.
 * @returns A promise that resolves to the structured greetings content or an error.
 */
export async function generateGreetingsContent(
  request: GreetingsGenerationRequest,
): Promise<GreetingsGenerationResponse> {
  try {
    const { sourceContent, customPrompt } = request;

    if (!sourceContent?.trim()) {
      return {
        success: false,
        error: "Source content is required",
      };
    }

    if (!customPrompt?.trim()) {
      return {
        success: false,
        error:
          "AI Prompt is required. Please load a prompt from the Prompts Library.",
      };
    }

    const result = await gemini.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: [
        {
          role: "user",
          parts: [
            { text: customPrompt + "\n\nSource Content:\n" + sourceContent },
          ],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const text = result.text;
    if (!text) {
      return {
        success: false,
        error: "Gemini returned empty response",
      };
    }

    const cleanText = cleanJsonString(text);
    const parsedResponse = JSON.parse(cleanText);

    if (!parsedResponse.items || !Array.isArray(parsedResponse.items)) {
      return {
        success: false,
        error: 'The AI response is missing the required "items" array.',
      };
    }

    // Add the content_type to each item before returning
    const finalData = parsedResponse.items.map((item: any) => ({
      ...item,
      content_type: "greeting",
    }));

    return {
      success: true,
      data: finalData,
    };
  } catch (error) {
    console.error("❌ Error generating greetings content:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
