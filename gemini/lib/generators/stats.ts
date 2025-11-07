/**
 * Unified Gemini AI Stats Content Generator
 * Generates historical statistics content with strict format enforcement
 * Integrates with unified content table
 */

import { gemini } from "../client";
import { CollectionContent } from "@/lib/types";
import { cleanJsonString } from "@/lib/content-helpers";
import { handleGeminiError } from "../error-handler";

export interface StatsGenerationRequest {
  sourceContent: string;
  customPrompt: string;
}

export interface StatsGenerationResponse {
  success: boolean;
  data?: CollectionContent[];
  error?: string;
}

/**
 * Generate stats content using Gemini AI
 * @param request The generation request containing source content and a custom prompt.
 * @returns A promise that resolves to the structured stats content or an error.
 */
export async function generateStatsContent(
  request: StatsGenerationRequest,
): Promise<StatsGenerationResponse> {
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
      content_type: "stat",
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
