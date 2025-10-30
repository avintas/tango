/**
 * Unified Gemini AI Motivational Content Generator
 * Generates inspirational quotes and stories with strict format enforcement
 * Integrates with unified content table
 */

import { gemini } from "@/lib/gemini";
import { UniContent } from "./types";
import { extractJsonObject } from "./content-helpers";

export interface MotivationalGenerationRequest {
  sourceContent: string;
  customPrompt: string;
}

export interface MotivationalGenerationResponse {
  success: boolean;
  data?: UniContent[];
  error?: string;
}

/**
 * Generate motivational content using Gemini AI
 * @param request The generation request containing source content and a custom prompt.
 * @returns A promise that resolves to the structured motivational content or an error.
 */
export async function generateMotivationalContent(
  request: MotivationalGenerationRequest,
): Promise<MotivationalGenerationResponse> {
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
    });

    const text = result.text;
    if (!text) {
      return {
        success: false,
        error: "Gemini returned empty response",
      };
    }

    const parsedResponse = extractJsonObject(text);
    if (!parsedResponse) {
      return {
        success: false,
        error: "The AI returned an invalid format. Please try again.",
      };
    }

    if (!parsedResponse.items || !Array.isArray(parsedResponse.items)) {
      return {
        success: false,
        error: 'The AI response is missing the required "items" array.',
      };
    }

    // Add the content_type to each item before returning
    const finalData = parsedResponse.items.map((item: any) => ({
      ...item,
      content_type: "motivational",
    }));

    return {
      success: true,
      data: finalData,
    };
  } catch (error) {
    console.error("❌ Error generating motivational content:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
