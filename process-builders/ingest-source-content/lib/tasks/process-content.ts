import type {
  ProcessBuilderTask,
  TaskContext,
  TaskResult,
} from "@/process-builders/core/types";
import type { ProcessedContent } from "../types";
import { processText } from "@/lib/text-processing";

/**
 * Task 1: Process Content
 * Normalizes and validates content using existing text processing logic
 * Calculates word/character counts
 */
export const processContentTask: ProcessBuilderTask = {
  id: "process-content",
  name: "Process Content",
  description:
    "Normalizes and validates content, calculates word/character counts",

  async execute(context: TaskContext): Promise<TaskResult> {
    try {
      const contentText = context.rules.contentText?.value as
        | string
        | undefined;
      const isAlreadyProcessed = context.rules.isAlreadyProcessed?.value as
        | boolean
        | undefined;

      if (!contentText || typeof contentText !== "string") {
        return {
          success: false,
          errors: [
            {
              code: "INVALID_CONTENT",
              message: "contentText rule is required and must be a string",
              taskId: "process-content",
            },
          ],
        };
      }

      // If content is already processed, skip processing and just calculate counts
      if (isAlreadyProcessed) {
        const wordCount = contentText
          .trim()
          .split(/\s+/)
          .filter((word) => word.length > 0).length;
        const charCount = contentText.length;

        const processedContent: ProcessedContent = {
          content_text: contentText, // Use as-is
          word_count: wordCount,
          char_count: charCount,
          normalized_text: contentText, // Already normalized
        };

        return {
          success: true,
          data: processedContent,
          metadata: {
            wordCount,
            charCount,
            skippedProcessing: true,
          },
        };
      }

      // Use existing text processing function
      const processingResult = await processText(contentText);

      const processedContent: ProcessedContent = {
        content_text: processingResult.processedText,
        word_count: processingResult.wordCount,
        char_count: processingResult.charCount,
        normalized_text: processingResult.processedText,
      };

      return {
        success: true,
        data: processedContent,
        metadata: {
          wordCount: processingResult.wordCount,
          charCount: processingResult.charCount,
          processingTime: processingResult.processingTime,
        },
      };
    } catch (error) {
      return {
        success: false,
        errors: [
          {
            code: "PROCESS_FAILED",
            message: error instanceof Error ? error.message : "Unknown error",
            taskId: "process-content",
          },
        ],
      };
    }
  },
};
