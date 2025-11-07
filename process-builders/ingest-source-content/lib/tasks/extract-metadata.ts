import type {
  ProcessBuilderTask,
  TaskContext,
  TaskResult,
} from "@/process-builders/core/types";
import type { ExtractedMetadata } from "../types";
import { loadPrompt, callGeminiAPI } from "../helpers/ai-helpers";

/**
 * Task 2: Extract Metadata
 * Uses AI to extract theme, tags, and category from content
 */
export const extractMetadataTask: ProcessBuilderTask = {
  id: "extract-metadata",
  name: "Extract Metadata",
  description: "Uses AI to extract theme, tags, and category from content",

  async execute(context: TaskContext): Promise<TaskResult> {
    try {
      // Get processed content from previous task
      const previousResult = context.previousResults?.[0];
      if (!previousResult?.success || !previousResult.data) {
        return {
          success: false,
          errors: [
            {
              code: "MISSING_PREVIOUS_RESULT",
              message:
                "Process Content task must complete successfully before metadata extraction",
              taskId: "extract-metadata",
            },
          ],
        };
      }

      const processedContent = previousResult.data as {
        content_text: string;
        normalized_text: string;
      };

      // Load metadata extraction prompt from database
      const prompt = await loadPrompt("metadata_extraction");
      if (!prompt) {
        return {
          success: false,
          errors: [
            {
              code: "PROMPT_NOT_FOUND",
              message:
                "Metadata extraction prompt not found in database. Please create an active prompt.",
              taskId: "extract-metadata",
            },
          ],
        };
      }

      // Call Gemini API
      const geminiResult = await callGeminiAPI(
        prompt,
        processedContent.normalized_text,
        "application/json",
      );

      if (!geminiResult.success || !geminiResult.data) {
        return {
          success: false,
          errors: [
            {
              code: "AI_EXTRACTION_FAILED",
              message:
                geminiResult.error || "Failed to extract metadata from AI",
              taskId: "extract-metadata",
            },
          ],
        };
      }

      // Parse AI response (expecting JSON with theme, tags, category)
      const aiResponse = geminiResult.data as {
        theme?: string;
        tags?: string[];
        category?: string;
      };

      if (!aiResponse.theme) {
        return {
          success: false,
          errors: [
            {
              code: "MISSING_THEME",
              message: "AI response missing required theme field",
              taskId: "extract-metadata",
            },
          ],
        };
      }

      const extractedMetadata: ExtractedMetadata = {
        theme: aiResponse.theme,
        tags: aiResponse.tags || [],
        category: aiResponse.category,
      };

      return {
        success: true,
        data: extractedMetadata,
        metadata: {
          extracted: true,
          theme: extractedMetadata.theme,
          tagsCount: extractedMetadata.tags.length,
          hasCategory: !!extractedMetadata.category,
        },
      };
    } catch (error) {
      return {
        success: false,
        errors: [
          {
            code: "EXTRACTION_FAILED",
            message: error instanceof Error ? error.message : "Unknown error",
            taskId: "extract-metadata",
          },
        ],
      };
    }
  },

  retryable: true,
  maxRetries: 3, // Increased retries for rate limit issues
  retryDelay: 5000, // Increased delay to 5 seconds for rate limit backoff
  timeout: 30000,
};
