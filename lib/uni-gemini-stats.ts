/**
 * Unified Gemini AI Stats Content Generator
 * Generates historical statistics content with strict format enforcement
 * Integrates with unified content table
 */

import { gemini } from "@/lib/gemini";
import { UniContent } from "./content-types";

export interface StatsGenerationRequest {
  sourceContent: string;
  customPrompt: string;
}

export interface StatsGenerationResponse {
  success: boolean;
  data?: UniContent[];
  error?: string;
}

/**
 * Extracts a clean JSON object from a string, even if it's wrapped in markdown or conversational text.
 * @param text The raw text response from the AI.
 * @returns A parsed JSON object, or null if parsing fails.
 */
function extractJsonObject(text: string): any | null {
  try {
    const jsonStartIndex = text.indexOf("{");
    const jsonEndIndex = text.lastIndexOf("}");
    if (jsonStartIndex === -1 || jsonEndIndex === -1) {
      console.error("No JSON object found in the response.");
      return null;
    }
    const jsonString = text.substring(jsonStartIndex, jsonEndIndex + 1);
    return JSON.parse(jsonString);
  } catch (e) {
    console.error("Failed to parse Gemini response as JSON:", text);
    return null;
  }
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
      content_type: "statistic",
    }));

    return {
      success: true,
      data: finalData,
    };
  } catch (error) {
    console.error("❌ Error generating stats content:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
