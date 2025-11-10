/**
 * Ideation Module - Plan Builder
 * Builds structured ideation plans from selections and parameters
 */

import type {
  IdeationPlan,
  ContentSelection,
  PlanParameters,
  PlanMetadata,
  PlanType,
} from "./types";

/**
 * Create a new ideation plan
 */
export function createPlan(
  type: PlanType,
  selections: ContentSelection[],
  parameters: PlanParameters,
  metadata?: Partial<PlanMetadata>,
): IdeationPlan {
  const plan: IdeationPlan = {
    id: generatePlanId(),
    type,
    selections,
    parameters,
    metadata: {
      createdAt: new Date().toISOString(),
      ...metadata,
    },
  };

  return plan;
}

/**
 * Validate an ideation plan
 */
export function validatePlan(plan: IdeationPlan): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!plan.id) {
    errors.push("Plan ID is required");
  }

  if (!plan.type) {
    errors.push("Plan type is required");
  }

  if (!plan.selections || plan.selections.length === 0) {
    errors.push("At least one selection is required");
  }

  if (!plan.parameters) {
    errors.push("Plan parameters are required");
  }

  // Validate selections
  plan.selections.forEach((selection, index) => {
    if (!selection.id) {
      errors.push(`Selection ${index + 1}: ID is required`);
    }
    if (!selection.type) {
      errors.push(`Selection ${index + 1}: Type is required`);
    }
    if (!selection.contentId) {
      errors.push(`Selection ${index + 1}: Content ID is required`);
    }
  });

  // Type-specific validation
  if (plan.type === "theme-based" && !plan.parameters.theme) {
    errors.push("Theme-based plans require a theme parameter");
  }

  if (
    plan.type === "batch-generation" &&
    (!plan.parameters.contentTypes || plan.parameters.contentTypes.length === 0)
  ) {
    errors.push("Batch generation plans require content types");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Serialize plan to JSON string
 */
export function serializePlan(plan: IdeationPlan): string {
  return JSON.stringify(plan, null, 2);
}

/**
 * Deserialize plan from JSON string
 */
export function deserializePlan(json: string): IdeationPlan | null {
  try {
    return JSON.parse(json) as IdeationPlan;
  } catch (error) {
    console.error("Failed to deserialize plan:", error);
    return null;
  }
}

/**
 * Generate unique plan ID
 */
function generatePlanId(): string {
  return `plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Export plan for process builder execution
 */
export function exportPlanForExecution(plan: IdeationPlan): {
  goal: string;
  rules: string[];
  selections: ContentSelection[];
  parameters: PlanParameters;
} {
  return {
    goal: buildGoalFromPlan(plan),
    rules: buildRulesFromPlan(plan),
    selections: plan.selections,
    parameters: plan.parameters,
  };
}

/**
 * Build goal string from plan
 */
function buildGoalFromPlan(plan: IdeationPlan): string {
  const parts: string[] = [];

  if (plan.parameters.theme) {
    parts.push(`Theme: ${plan.parameters.theme}`);
  }

  if (plan.parameters.category) {
    parts.push(`Category: ${plan.parameters.category}`);
  }

  if (plan.parameters.questionCount) {
    parts.push(`Generate ${plan.parameters.questionCount} questions`);
  }

  if (plan.selections.length > 0) {
    parts.push(
      `Using ${plan.selections.length} selected ${plan.selections[0].type}`,
    );
  }

  return parts.join(" | ") || "Create content from ideation plan";
}

/**
 * Build rules array from plan
 */
function buildRulesFromPlan(plan: IdeationPlan): string[] {
  const rules: string[] = [];

  if (plan.parameters.difficulty) {
    rules.push(`Difficulty level: ${plan.parameters.difficulty}`);
  }

  if (plan.parameters.contentTypes && plan.parameters.contentTypes.length > 0) {
    rules.push(`Content types: ${plan.parameters.contentTypes.join(", ")}`);
  }

  if (plan.parameters.tags && plan.parameters.tags.length > 0) {
    rules.push(`Tags: ${plan.parameters.tags.join(", ")}`);
  }

  return rules;
}
