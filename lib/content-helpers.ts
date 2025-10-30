/**
 * Content System - Helper Functions
 * Utility functions for working with content generation and saving
 */

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
