import { buildTriviaSet } from "./build-trivia-set";
import { buildTriviaSetAction } from "./actions";
import type { ProcessBuilderMetadata } from "@/process-builders/core/types";

// Export main function
export { buildTriviaSet, buildTriviaSetAction };

// Export metadata for auto-discovery
export const metadata: ProcessBuilderMetadata = {
  id: "build-trivia-set",
  name: "Build Trivia Set",
  description: "Creates a curated trivia set from existing questions",
  version: "1.0.0",
  tasks: [
    "query-questions",
    "select-balance",
    "generate-metadata",
    "assemble-data",
    "create-record",
    "validate-finalize",
  ],
  requiredRules: ["questionTypes", "questionCount"],
  optionalRules: [
    "distributionStrategy",
    "theme",
    "cooldownDays",
    "allowPartialSets",
  ],
  defaults: {
    distributionStrategy: "weighted",
    cooldownDays: 30,
    allowPartialSets: false,
  },
  limits: {
    questionCount: { min: 1, max: 100 },
  },
};
