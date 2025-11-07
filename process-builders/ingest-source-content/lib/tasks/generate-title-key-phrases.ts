import type {
  ProcessBuilderTask,
  TaskContext,
  TaskResult,
} from "@/process-builders/core/types";
import { loadPrompt, callGeminiAPI } from "../helpers/ai-helpers";

/**
 * Task 4: Generate Title & Key Phrases
 * Uses AI to generate title and extract key phrases from content
 */
export const generateTitleKeyPhrasesTask: ProcessBuilderTask = {
  id: "generate-title-key-phrases",
  name: "Generate Title & Key Phrases",
  description: "Uses AI to generate title and extract key phrases from content",

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
                "Process Content task must complete successfully before title/key phrase generation",
              taskId: "generate-title-key-phrases",
            },
          ],
        };
      }

      const processedContent = processedResult.data as {
        content_text: string;
        normalized_text: string;
      };

      // Check if title was provided manually
      const manualTitle = context.rules.title?.value as string | undefined;

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
              taskId: "generate-title-key-phrases",
            },
          ],
        };
      }

      // Create specific prompt for title and key phrases
      const titleKeyPhrasesPrompt = `${prompt}\n\nPlease generate:
1. A concise title (5-15 words) for this content
2. Key phrases (5-10 multi-word phrases) that represent important concepts

Return as JSON: { "title": "...", "key_phrases": ["...", "..."] }`;

      // Call Gemini API (JSON response)
      const geminiResult = await callGeminiAPI(
        titleKeyPhrasesPrompt,
        processedContent.normalized_text,
        "application/json",
      );

      if (!geminiResult.success || !geminiResult.data) {
        return {
          success: false,
          errors: [
            {
              code: "AI_TITLE_KEY_PHRASES_FAILED",
              message:
                geminiResult.error ||
                "Failed to generate title/key phrases from AI",
              taskId: "generate-title-key-phrases",
            },
          ],
        };
      }

      // Parse AI response
      const aiResponse = geminiResult.data as {
        title?: string;
        key_phrases?: string[];
      };

      // Use manual title if provided, otherwise use AI-generated
      const title = manualTitle || aiResponse.title || "";
      const key_phrases = aiResponse.key_phrases || [];

      return {
        success: true,
        data: { title, key_phrases },
        metadata: {
          titleProvided: !!manualTitle,
          generated: true,
          titleLength: title.length,
          keyPhrasesCount: key_phrases.length,
        },
      };
    } catch (error) {
      return {
        success: false,
        errors: [
          {
            code: "TITLE_KEY_PHRASES_GENERATION_FAILED",
            message: error instanceof Error ? error.message : "Unknown error",
            taskId: "generate-title-key-phrases",
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
