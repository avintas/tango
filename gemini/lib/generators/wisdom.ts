/**
 * Gemini AI Wisdom Content Generator
 * Generates reflective wisdom and insights with strict format enforcement
 */

import { gemini } from "../client";
import { CollectionContent } from "@/lib/types";
import { cleanJsonString } from "@/lib/content-helpers";
import { handleGeminiError } from "../error-handler";

export interface WisdomGenerationRequest {
  sourceContent: string;
  customPrompt: string;
}

export interface WisdomGenerationResponse {
  success: boolean;
  data?: CollectionContent[];
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
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = result.text;
    if (!text) {
      return {
        success: false,
        error: "The AI failed to generate a response.",
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
      content_type: "wisdom",
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
