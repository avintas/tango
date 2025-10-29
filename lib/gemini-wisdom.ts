/**
 * Gemini AI Wisdom Content Generator
 * Generates reflective wisdom and insights with strict format enforcement
 */

import { gemini } from "@/lib/gemini";
import { UniContent } from "./content-types";
import { extractJsonObject } from "./content-helpers";

export interface WisdomGenerationRequest {
  sourceContent: string;
  customPrompt: string;
}

export interface WisdomGenerationResponse {
  success: boolean;
  data?: UniContent[];
  error?: string;
}

/**
 * Generate wisdom content using Gemini AI
 * @param request The generation request containing source content and a custom prompt.
 * @returns A promise that resolves to the structured wisdom content or an error.
 */
export async function generateWisdomContent(
  request: WisdomGenerationRequest,
): Promise<WisdomGenerationResponse> {
  const { sourceContent, customPrompt } = request;

  if (!sourceContent || !customPrompt) {
    return {
      success: false,
      error: "Source content and custom prompt are required.",
    };
  }

  try {
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
        error: "The AI failed to generate a response.",
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
      content_type: "wisdom",
    }));

    return {
      success: true,
      data: finalData,
    };
  } catch (error) {
    console.error("Error generating wisdom content:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return {
      success: false,
      error: `An error occurred during content generation: ${errorMessage}`,
    };
  }
}
