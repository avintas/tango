import type {
  ProcessBuilderGoal,
  ProcessBuilderRules,
  ProcessBuilderOptions,
  ProcessBuilderResult,
} from "@/process-builders/core/types";
import { ProcessBuilderExecutor } from "../../core/executor";
import { processContentTask } from "./tasks/process-content";
import { extractMetadataTask } from "./tasks/extract-metadata";
import { generateSummaryTask } from "./tasks/generate-summary";
import { generateTitleKeyPhrasesTask } from "./tasks/generate-title-key-phrases";
import { validateCompletenessTask } from "./tasks/validate-completeness";
import { createRecordTask } from "./tasks/create-record";

/**
 * Ingest Source Content - Main function
 * Processes source content through workflow with AI-powered metadata extraction
 */
export async function ingestSourceContent(
  goal: ProcessBuilderGoal,
  rules: ProcessBuilderRules,
  options?: ProcessBuilderOptions,
): Promise<ProcessBuilderResult> {
  // Create executor with tasks
  const executor = new ProcessBuilderExecutor(
    [
      processContentTask,
      extractMetadataTask,
      generateSummaryTask,
      generateTitleKeyPhrasesTask,
      validateCompletenessTask,
      createRecordTask,
    ],
    options?.onProgress,
  );

  // Execute process
  const result = await executor.execute(goal, rules, options);

  // Add process-specific metadata
  return {
    ...result,
    processId: "ingest-source-content",
    processName: "Ingest Source Content",
  };
}
