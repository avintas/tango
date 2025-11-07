/**
 * AI Helpers for Source Content Ingestion
 * Handles loading prompts from database and calling Gemini API
 */

import { gemini } from "@/gemini";
import { cleanJsonString } from "@/lib/content-helpers";
import { supabaseAdmin } from "@/lib/supabase-admin";
import type { PromptType } from "@/lib/supabase";

/**
 * Load active prompt from database by type
 */
export async function loadPrompt(
  promptType: PromptType,
): Promise<string | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from("ai_extraction_prompts")
      .select("prompt_content")
      .eq("prompt_type", promptType)
      .eq("is_active", true)
      .single();

    if (error) {
      console.error(`Database error loading ${promptType} prompt:`, error);
      return null;
    }

    if (!data) {
      console.warn(`No active prompt found for type: ${promptType}`);
      return null;
    }

    return data.prompt_content;
  } catch (error) {
    console.error(`Error loading ${promptType} prompt:`, error);
    return null;
  }
}

/**
 * Call Gemini API with prompt and content
 * Returns JSON response parsed and cleaned, or plain text
 */
export async function callGeminiAPI(
  prompt: string,
  sourceContent: string,
  responseMimeType: "application/json" | "text/plain" = "application/json",
): Promise<{
  success: boolean;
  data?: unknown;
  error?: string;
  errorCode?: string;
  retryable?: boolean;
}> {
  try {
    if (!prompt?.trim()) {
      return {
        success: false,
        error: "Prompt is required",
      };
    }

    if (!sourceContent?.trim()) {
      return {
        success: false,
        error: "Content is required",
      };
    }

    // Combine prompt and content
    const fullPrompt = `${prompt}\n\nSource Content:\n${sourceContent}`;

    // Call Gemini API
    const result = await gemini.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: [
        {
          role: "user",
          parts: [{ text: fullPrompt }],
        },
      ],
      config: {
        responseMimeType,
      },
    });

    const text = result.text;
    if (!text) {
      return {
        success: false,
        error: "Gemini returned empty response",
      };
    }

    // If JSON response, parse and clean
    if (responseMimeType === "application/json") {
      const cleanText = cleanJsonString(text);
      const parsedResponse = JSON.parse(cleanText);
      return {
        success: true,
        data: parsedResponse,
      };
    }

    // For text responses, return as-is
    return {
      success: true,
      data: text,
    };
  } catch (error) {
    console.error("Gemini API error:", error);

    // Handle structured errors from Gemini API
    let errorMessage = "Unknown error";
    let errorCode: string | undefined;

    if (error instanceof Error) {
      errorMessage = error.message;

      // Try to parse error message if it contains JSON
      try {
        // Check if error message contains JSON structure
        const jsonMatch = errorMessage.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsedError = JSON.parse(jsonMatch[0]);
          if (parsedError.error) {
            errorCode = parsedError.error.code?.toString();
            const status = parsedError.error.status;

            // Handle 429 Resource Exhausted errors
            if (errorCode === "429" || status === "RESOURCE_EXHAUSTED") {
              return {
                success: false,
                error:
                  "Gemini API rate limit exceeded. Please wait a few moments and try again. The service is temporarily unavailable due to high demand.",
                errorCode: "429",
                retryable: true,
              };
            }

            // Use the structured error message if available
            if (parsedError.error.message) {
              errorMessage = parsedError.error.message;
            }
          }
        }
      } catch (parseError) {
        // If parsing fails, use the original error message
      }
    }

    return {
      success: false,
      error: errorMessage,
      errorCode,
    };
  }
}
