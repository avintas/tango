/**
 * API Helper Functions
 * Standardized error handling and response formatting
 */

export interface APIError {
  success: false;
  error: string;
}

export interface APISuccess<T = any> {
  success: true;
  data?: T;
  message?: string;
  count?: number;
}

export type APIResponse<T = any> = APISuccess<T> | APIError;

/**
 * Handle API errors with consistent formatting
 * @param error Error object or unknown error
 * @returns Formatted error response
 */
export const handleAPIError = (error: unknown): APIError => {
  console.error("API Error:", error);
  return {
    success: false,
    error: error instanceof Error ? error.message : "Unknown error occurred",
  };
};

/**
 * Create a successful API response
 * @param data Optional data to include in response
 * @param message Optional success message
 * @param count Optional count of items
 * @returns Formatted success response
 */
export const createAPIResponse = <T>(
  data?: T,
  message?: string,
  count?: number,
): APISuccess<T> => {
  const response: APISuccess<T> = {
    success: true,
  };

  if (data !== undefined) response.data = data;
  if (message) response.message = message;
  if (count !== undefined) response.count = count;

  return response;
};

/**
 * Validate required fields in request body
 * @param body Request body object
 * @param required Array of required field names
 * @returns Error message if validation fails, null if successful
 */
export const validateRequiredFields = (
  body: Record<string, any>,
  required: string[],
): string | null => {
  for (const field of required) {
    if (!body[field] && body[field] !== 0 && body[field] !== false) {
      return `${field} is required`;
    }
  }
  return null;
};

/**
 * Parse and validate array fields in request body
 * @param value Value to parse
 * @param defaultValue Default value if parsing fails
 * @returns Parsed array or default value
 */
export const parseArrayField = (
  value: any,
  defaultValue: any[] = [],
): any[] => {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : defaultValue;
    } catch {
      return defaultValue;
    }
  }
  return defaultValue;
};

/**
 * Sanitize string input by trimming whitespace
 * @param value Value to sanitize
 * @returns Sanitized string or undefined
 */
export const sanitizeString = (value: any): string | undefined => {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }
  return undefined;
};

/**
 * Strip markdown formatting and quotes from text
 * Removes: ** (bold), " (quotes), ' (quotes)
 */
export const stripMarkdown = (text: string): string => {
  return (
    text
      .trim()
      // Remove bold markdown from start and end
      .replace(/^\*\*+/, "")
      .replace(/\*\*+$/, "")
      // Remove quotes from start and end
      .replace(/^["']/, "")
      .replace(/["']$/, "")
      .trim()
  );
};
