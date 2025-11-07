import type {
  ProcessBuilderTask,
  TaskContext,
  TaskResult,
} from "@/process-builders/core/types";

/**
 * Task 5: Validate Completeness
 * Validates that all required fields are present and complete
 */
export const validateCompletenessTask: ProcessBuilderTask = {
  id: "validate-completeness",
  name: "Validate Completeness",
  description: "Validates that all required fields are present and complete",

  async execute(context: TaskContext): Promise<TaskResult> {
    try {
      // Collect all data from previous tasks
      const processedResult = context.previousResults?.[0];
      const metadataResult = context.previousResults?.[1];
      const summaryResult = context.previousResults?.[2];
      const titleKeyPhrasesResult = context.previousResults?.[3];

      const errors: string[] = [];
      const warnings: string[] = [];

      // Validate processed content
      if (!processedResult?.success || !processedResult.data) {
        errors.push("Processed content is missing");
      }

      // Validate metadata (theme is required)
      if (!metadataResult?.success || !metadataResult.data) {
        errors.push("Metadata extraction failed");
      } else {
        const metadata = metadataResult.data as { theme?: string };
        if (!metadata.theme) {
          errors.push("Theme is required but missing");
        }
      }

      // Validate summary (optional but recommended)
      if (!summaryResult?.success || !summaryResult.data) {
        warnings.push("Summary generation failed or skipped");
      }

      // Validate title/key phrases (optional but recommended)
      if (!titleKeyPhrasesResult?.success || !titleKeyPhrasesResult.data) {
        warnings.push("Title/key phrases generation failed or skipped");
      }

      if (errors.length > 0) {
        return {
          success: false,
          errors: errors.map((error) => ({
            code: "VALIDATION_ERROR",
            message: error,
            taskId: "validate-completeness",
          })),
          warnings,
        };
      }

      return {
        success: true,
        data: { validated: true },
        warnings,
        metadata: {
          errorsCount: 0,
          warningsCount: warnings.length,
        },
      };
    } catch (error) {
      return {
        success: false,
        errors: [
          {
            code: "VALIDATION_FAILED",
            message: error instanceof Error ? error.message : "Unknown error",
            taskId: "validate-completeness",
          },
        ],
      };
    }
  },
};
