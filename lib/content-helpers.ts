/**
 * Content System - Helper Functions
 * Utility functions for working with content generation and saving
 */

/**
 * Extract JSON object string from a text response.
 * Handles responses that may be wrapped in markdown code blocks or conversational text.
 * @param text Raw text response from AI.
 * @returns A string containing only the JSON object, or the original text if no object is found.
 */
export function cleanJsonString(text: string): string {
  const jsonStartIndex = text.indexOf("{");
  const jsonEndIndex = text.lastIndexOf("}");

  if (jsonStartIndex === -1 || jsonEndIndex === -1) {
    // If we can't find a JSON object, return the original text
    // so JSON.parse can fail with a clear error.
    return text;
  }

  return text.substring(jsonStartIndex, jsonEndIndex + 1);
}
