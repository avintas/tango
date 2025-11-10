/**
 * Ideation Module - Public API
 * Centralized exports for all ideation functionality
 */

// Core ideation logic
export {
  ideation,
  createIdeationContext,
  addSelection,
  removeSelection,
  updateFilters,
  buildPlanFromContext,
  type IdeationContext,
} from "./lib/ideation";

// Types
export type {
  IdeationPlan,
  ContentSelection,
  PlanParameters,
  PlanMetadata,
  PlanType,
  SelectionType,
  AnalysisRequest,
  AnalysisResult,
  ExplorationFilters,
} from "./lib/types";

// Plan builder
export {
  createPlan,
  validatePlan,
  serializePlan,
  deserializePlan,
  exportPlanForExecution,
} from "./lib/plan-builder";

// Analysis - Only available server-side via API route
// Do not import analyzeContent in client components
// Use /api/ideation/analyze instead

// Exploration - Only available server-side via API route
// Do not import exploration functions in client components
// Use /api/ideation/explore instead
