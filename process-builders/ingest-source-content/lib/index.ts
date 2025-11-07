import { ingestSourceContent } from "./ingest-source-content";
import { ingestSourceContentAction } from "./actions";
import type { ProcessBuilderMetadata } from "@/process-builders/core/types";

// Export main function and action
export { ingestSourceContent } from "./ingest-source-content";
export { ingestSourceContentAction } from "./actions";

// Export metadata for auto-discovery
export const metadata: ProcessBuilderMetadata = {
  id: "ingest-source-content",
  name: "Ingest Source Content",
  description:
    "Processes source content through workflow with AI-powered metadata extraction and enrichment",
  version: "1.0.0",
  tasks: [
    "process-content",
    "extract-metadata",
    "generate-summary",
    "generate-title-key-phrases",
    "validate-completeness",
    "create-record",
  ],
  requiredRules: ["contentText"],
  optionalRules: ["title", "skipAIExtraction"],
  defaults: {
    skipAIExtraction: false,
  },
  limits: {
    contentText: { min: 10, max: 50000 }, // Character limits
  },
};
