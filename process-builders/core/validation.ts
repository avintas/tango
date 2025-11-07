import type {
  ProcessBuilderGoal,
  ProcessBuilderRules,
  ProcessBuilderMetadata,
  ProcessBuilderRule,
} from "./types";

/**
 * Validate a process builder goal
 */
export function validateGoal(goal: unknown): ProcessBuilderGoal {
  if (!goal || typeof goal !== "object") {
    throw new Error("Goal must be an object");
  }

  const goalObj = goal as Record<string, unknown>;

  if (
    !goalObj.text ||
    typeof goalObj.text !== "string" ||
    goalObj.text.trim() === ""
  ) {
    throw new Error("Goal.text is required and must be a non-empty string");
  }

  return {
    text: goalObj.text as string,
    metadata: goalObj.metadata as Record<string, unknown> | undefined,
  };
}

/**
 * Infer the type of a value
 */
function inferType(
  value: unknown,
): "string" | "number" | "boolean" | "array" | "object" {
  if (typeof value === "string") return "string";
  if (typeof value === "number") return "number";
  if (typeof value === "boolean") return "boolean";
  if (Array.isArray(value)) return "array";
  if (typeof value === "object" && value !== null) return "object";
  return "string"; // Default
}

/**
 * Validate process builder rules against metadata requirements
 */
export function validateRules(
  rules: unknown,
  processMetadata: ProcessBuilderMetadata,
): ProcessBuilderRules {
  if (!rules || typeof rules !== "object") {
    throw new Error("Rules must be an object");
  }

  const rulesObj = rules as Record<string, unknown>;
  const validatedRules: ProcessBuilderRules = {};

  // Validate each rule
  for (const [key, value] of Object.entries(rulesObj)) {
    if (value && typeof value === "object" && "value" in value) {
      // Already a ProcessBuilderRule
      validatedRules[key] = value as ProcessBuilderRule;
    } else {
      // Auto-wrap simple values
      validatedRules[key] = {
        key,
        value,
        type: inferType(value),
      };
    }
  }

  // Check required rules
  for (const requiredRule of processMetadata.requiredRules) {
    if (!validatedRules[requiredRule]) {
      throw new Error(`Missing required rule: ${requiredRule}`);
    }
  }

  return validatedRules;
}
