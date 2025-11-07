"use server";

import { ingestSourceContent } from "./ingest-source-content";
import type {
  ProcessBuilderGoal,
  ProcessBuilderRules,
  ProcessBuilderOptions,
} from "@/process-builders/core/types";

/**
 * Server Action for ingesting source content
 * Called from client components
 */
export async function ingestSourceContentAction(
  goal: ProcessBuilderGoal,
  rules: ProcessBuilderRules,
  options?: ProcessBuilderOptions,
) {
  return await ingestSourceContent(goal, rules, options);
}
