/**
 * Content System - Helper Functions
 * Utility functions for working with content generation and saving
 */

import { UniContent, TriviaQuestion } from "./types";
import { gemini } from "@/lib/gemini";

/**
 * Extract JSON object from Gemini AI response text
 * Handles responses that may be wrapped in markdown code blocks or conversational text
 * @param text Raw text response from AI
 * @returns Parsed JSON object or null if parsing fails
 */
export function extractJsonObject(text: string): any | null {
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
 * Save content to the appropriate collection table via API
 * Routes to correct table based on content_type
 * @param content Content to save
 * @returns Saved content or error
 */
export async function saveUniContent(
  content: UniContent,
): Promise<{ success: boolean; data?: UniContent; error?: string }> {
  try {
    const response = await fetch("/api/content/save", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content }),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Batch save multiple content items
 * @param contents Array of content to save
 * @returns Array of results
 */
export async function batchSaveUniContent(
  contents: UniContent[],
): Promise<Array<{ success: boolean; data?: UniContent; error?: string }>> {
  const results = await Promise.all(
    contents.map((content) => saveUniContent(content)),
  );
  return results;
}
