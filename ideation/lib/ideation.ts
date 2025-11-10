/**
 * Ideation Module - Core Ideation Logic
 * Main orchestrator for ideation workflows
 */

import type {
  IdeationPlan,
  ContentSelection,
  PlanParameters,
  ExplorationFilters,
} from "./types";
import {
  createPlan,
  validatePlan,
  exportPlanForExecution,
} from "./plan-builder";
// Note: analyzeContent and exploration functions are server-only
// They are not imported here to prevent client-side bundling issues
// Use API routes instead: /api/ideation/analyze and /api/ideation/explore

/**
 * Ideation Context
 * Holds current ideation state
 */
export interface IdeationContext {
  selections: ContentSelection[];
  filters: ExplorationFilters;
  currentPlan: IdeationPlan | null;
}

/**
 * Create new ideation context
 */
export function createIdeationContext(): IdeationContext {
  return {
    selections: [],
    filters: {},
    currentPlan: null,
  };
}

/**
 * Add selection to ideation context
 */
export function addSelection(
  context: IdeationContext,
  selection: ContentSelection,
): IdeationContext {
  return {
    ...context,
    selections: [...context.selections, selection],
  };
}

/**
 * Remove selection from ideation context
 */
export function removeSelection(
  context: IdeationContext,
  selectionId: number,
): IdeationContext {
  return {
    ...context,
    selections: context.selections.filter((s) => s.id !== selectionId),
  };
}

/**
 * Update filters in ideation context
 */
export function updateFilters(
  context: IdeationContext,
  filters: Partial<ExplorationFilters>,
): IdeationContext {
  return {
    ...context,
    filters: { ...context.filters, ...filters },
  };
}

/**
 * Build plan from current context
 */
export function buildPlanFromContext(
  context: IdeationContext,
  planType: IdeationPlan["type"],
  parameters: PlanParameters,
  metadata?: Partial<IdeationPlan["metadata"]>,
): IdeationPlan | null {
  if (context.selections.length === 0) {
    return null;
  }

  const plan = createPlan(planType, context.selections, parameters, metadata);
  const validation = validatePlan(plan);

  if (!validation.valid) {
    console.error("Plan validation failed:", validation.errors);
    return null;
  }

  return plan;
}

/**
 * Export ideation functions
 * Note: Exploration and analysis functions are server-only
 * Use API routes instead: /api/ideation/explore and /api/ideation/analyze
 */
export const ideation = {
  // Planning (client-safe)
  createPlan,
  validatePlan,
  exportPlanForExecution,

  // Context management (client-safe)
  createIdeationContext,
  addSelection,
  removeSelection,
  updateFilters,
  buildPlanFromContext,
};
