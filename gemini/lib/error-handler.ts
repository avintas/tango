/**
 * Shared Gemini API Error Handler
 * Provides consistent error handling and user-friendly messages for Gemini API errors
 */

/**
 * Parse and format Gemini API errors
 * Handles 429 rate limit errors with user-friendly messages
 */
export function handleGeminiError(error: unknown): {
  success: false;
  error: string;
  errorCode?: string;
  retryable?: boolean;
} {
  console.error("Gemini API error:", error);

  // Handle structured errors from Gemini API
  let errorMessage = "Unknown error occurred";
  let errorCode: string | undefined;
  let retryable = false;

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
                "Gemini API rate limit exceeded. The service is temporarily unavailable due to high demand. Please wait a few moments and try again.",
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
    retryable,
  };
}
