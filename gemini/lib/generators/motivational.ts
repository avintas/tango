/**
 * Unified Gemini AI Motivational Content Generator
 * Generates inspirational quotes and stories with strict format enforcement
 * Integrates with unified content table
 */

import { gemini } from "../client";
import { CollectionContent } from "@/lib/types";
import { cleanJsonString } from "@/lib/content-helpers";
import { handleGeminiError } from "../error-handler";

export interface MotivationalGenerationRequest {
  sourceContent: string;
  customPrompt: string;
}

export interface MotivationalGenerationResponse {
  success: boolean;
  data?: CollectionContent[];
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
      config: {
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
      content_type: "motivational",
    }));

    return {
      success: true,
      data: finalData,
    };
  } catch (error) {
    const errorResult = handleGeminiError(error);
    return errorResult;
  }
}
