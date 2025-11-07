// Core types for Process Builders
// Generic system types only - NO builder-specific types here

export interface ProcessBuilderGoal {
  text: string;
  metadata?: Record<string, unknown>;
}

export interface ProcessBuilderRule {
  key: string;
  value: unknown;
  type: "string" | "number" | "boolean" | "array" | "object";
}

export interface ProcessBuilderRules {
  [key: string]: ProcessBuilderRule;
}

export interface ProcessBuilderTask {
  id: string;
  name: string;
  description: string;

  // Lifecycle hooks
  onStart?: (context: TaskContext) => Promise<void>;
  execute: (context: TaskContext) => Promise<TaskResult>;
  onSuccess?: (result: TaskResult, context: TaskContext) => Promise<void>;
  onError?: (error: Error, context: TaskContext) => Promise<void>;
  onComplete?: (result: TaskResult, context: TaskContext) => Promise<void>;

  validate?: (context: TaskContext) => Promise<ValidationResult>;

  // Retry configuration
  retryable?: boolean;
  maxRetries?: number;
  retryDelay?: number;

  // Timeout
  timeout?: number; // milliseconds
}

export interface TaskContext {
  goal: ProcessBuilderGoal;
  rules: ProcessBuilderRules;
  options?: ProcessBuilderOptions;
  previousResults?: TaskResult[];
  metadata?: Record<string, unknown>;
}

export interface TaskResult {
  success: boolean;
  data?: unknown;
  errors?: ProcessBuilderError[];
  warnings?: string[];
  metadata?: Record<string, unknown>;
}

export interface TaskProgress {
  taskId: string;
  taskName: string;
  status: "pending" | "running" | "completed" | "failed" | "retrying";
  progress: number; // 0-100
  message?: string;
  startedAt?: Date;
  completedAt?: Date;
  error?: ProcessBuilderError;
}

export interface ProcessBuilderOptions {
  allowPartialResults?: boolean;
  useCache?: boolean;
  dryRun?: boolean;
  onProgress?: (progress: TaskProgress) => void;
  [key: string]: unknown;
}

export interface ProcessBuilderResult {
  status: "success" | "error" | "partial";
  processId: string;
  processName: string;
  results: TaskResult[];
  taskProgress: TaskProgress[];
  finalResult?: unknown;
  errors?: ProcessBuilderError[];
  warnings?: string[];
  executionTime: number;
  metadata?: Record<string, unknown>;
}

export interface ProcessBuilderError {
  code: string;
  message: string;
  taskId?: string;
  details?: unknown;
  retryable?: boolean;
}

export interface ProcessBuilderMetadata {
  id: string;
  name: string;
  description: string;
  version: string;
  tasks: string[]; // Task IDs
  requiredRules: string[];
  optionalRules: string[];
  deprecatedVersions?: string[];
  migrationGuide?: string;
  defaults?: Record<string, unknown>;
  limits?: Record<string, { min?: number; max?: number }>;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
}
