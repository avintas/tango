import type {
  ProcessBuilderTask,
  TaskContext,
  TaskResult,
} from "@/process-builders/core/types";
import { loadPrompt, callGeminiAPI } from "../helpers/ai-helpers";

/**
 * Task 3: Generate Summary
 * Uses AI to generate a comprehensive summary of the content
 */
export const generateSummaryTask: ProcessBuilderTask = {
  id: "generate-summary",
  name: "Generate Summary",
  description: "Uses AI to generate a comprehensive summary of the content",

  async execute(context: TaskContext): Promise<TaskResult> {
    try {
      // Get processed content from previous tasks
      const processedResult = context.previousResults?.[0];
      if (!processedResult?.success || !processedResult.data) {
        return {
          success: false,
          errors: [
            {
              code: "MISSING_PREVIOUS_RESULT",
              message:
                "Process Content task must complete successfully before summary generation",
              taskId: "generate-summary",
            },
          ],
        };
      }

      const processedContent = processedResult.data as {
        content_text: string;
        normalized_text: string;
      };

      // Load content enrichment prompt from database
      const prompt = await loadPrompt("content_enrichment");
      if (!prompt) {
        return {
          success: false,
          errors: [
            {
              code: "PROMPT_NOT_FOUND",
              message:
                "Content enrichment prompt not found in database. Please create an active prompt.",
              taskId: "generate-summary",
            },
          ],
        };
      }

      // Create specific prompt for summary generation
      const summaryPrompt = `${prompt}\n\nPlease generate a comprehensive summary (3-5 sentences, 100-150 words) of the source content.`;

      // Call Gemini API (text response for summary)
      const geminiResult = await callGeminiAPI(
        summaryPrompt,
        processedContent.normalized_text,
        "text/plain",
      );

      if (!geminiResult.success || !geminiResult.data) {
        return {
          success: false,
          errors: [
            {
              code: "AI_SUMMARY_FAILED",
              message:
                geminiResult.error || "Failed to generate summary from AI",
              taskId: "generate-summary",
            },
          ],
        };
      }

      const summary = geminiResult.data as string;

      return {
        success: true,
        data: { summary },
        metadata: {
          generated: true,
          summaryLength: summary.length,
        },
      };
    } catch (error) {
      return {
        success: false,
        errors: [
          {
            code: "SUMMARY_GENERATION_FAILED",
            message: error instanceof Error ? error.message : "Unknown error",
            taskId: "generate-summary",
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
