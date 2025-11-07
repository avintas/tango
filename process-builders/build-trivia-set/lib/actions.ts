"use server";

import { buildTriviaSet } from "./build-trivia-set";
import type {
  ProcessBuilderGoal,
  ProcessBuilderRules,
  ProcessBuilderOptions,
} from "@/process-builders/core/types";

/**
 * Server Action for building trivia sets
 * Called from client components
 */
export async function buildTriviaSetAction(
  goal: ProcessBuilderGoal,
  rules: ProcessBuilderRules,
  options?: ProcessBuilderOptions,
) {
  return await buildTriviaSet(goal, rules, options);
}
