import type {
  ProcessBuilderGoal,
  ProcessBuilderRules,
  ProcessBuilderOptions,
  ProcessBuilderResult,
} from "@/process-builders/core/types";
import { ProcessBuilderExecutor } from "../../core/executor";
import { queryQuestionsTask } from "./tasks/query-questions";
import { selectBalanceTask } from "./tasks/select-balance";
import { generateMetadataTask } from "./tasks/generate-metadata";
import { assembleDataTask } from "./tasks/assemble-data";
import { createRecordTask } from "./tasks/create-record";
import { validateFinalizeTask } from "./tasks/validate-finalize";

/**
 * Build Trivia Set - Main function
 * Creates a curated trivia set from existing questions
 */
export async function buildTriviaSet(
  goal: ProcessBuilderGoal,
  rules: ProcessBuilderRules,
  options?: ProcessBuilderOptions,
): Promise<ProcessBuilderResult> {
  // Create executor with tasks
  const executor = new ProcessBuilderExecutor(
    [
      queryQuestionsTask,
      selectBalanceTask,
      generateMetadataTask,
      assembleDataTask,
      createRecordTask,
      validateFinalizeTask,
    ],
    options?.onProgress,
  );

  // Execute process
  const result = await executor.execute(goal, rules, options);

  // Add process-specific metadata
  return {
    ...result,
    processId: "build-trivia-set",
    processName: "Build Trivia Set",
  };
}
