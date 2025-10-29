/**
 * Session Storage Helper Functions
 * Centralized session storage management for processing workflows
 */

export interface ProcessingSession {
  sourceContent: string;
  sourceContentId: string;
  aiPrompt: string;
  contentType:
    | "mc"
    | "tf"
    | "whoami"
    | "stats"
    | "motivational"
    | "greetings"
    | "lore";
  libraryReturnPath: string;
}

/**
 * Set processing session data in sessionStorage
 * @param data Partial session data to store
 */
export const setProcessingSession = (
  data: Partial<ProcessingSession>,
): void => {
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined) {
      sessionStorage.setItem(key, value);
    }
  });
};

/**
 * Get all processing session data from sessionStorage
 * @returns Complete processing session object with defaults
 */
export const getProcessingSession = (): ProcessingSession => {
  return {
    sourceContent: sessionStorage.getItem("sourceContent") || "",
    sourceContentId: sessionStorage.getItem("sourceContentId") || "",
    aiPrompt: sessionStorage.getItem("aiPrompt") || "",
    contentType:
      (sessionStorage.getItem(
        "contentType",
      ) as ProcessingSession["contentType"]) || "mc",
    libraryReturnPath: sessionStorage.getItem("libraryReturnPath") || "",
  };
};

/**
 * Clear all processing session data from sessionStorage
 */
export const clearProcessingSession = (): void => {
  sessionStorage.removeItem("sourceContent");
  sessionStorage.removeItem("sourceContentId");
  sessionStorage.removeItem("aiPrompt");
  sessionStorage.removeItem("contentType");
  sessionStorage.removeItem("libraryReturnPath");
};

/**
 * Check if required session data exists
 * @param required Array of required fields
 * @returns true if all required fields are present
 */
export const hasRequiredSession = (
  required: (keyof ProcessingSession)[],
): boolean => {
  const session = getProcessingSession();
  return required.every((field) => !!session[field]);
};
