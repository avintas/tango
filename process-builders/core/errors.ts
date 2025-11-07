import type { ProcessBuilderError as ProcessBuilderErrorType } from "./types";

/**
 * Custom error class for Process Builder errors
 */
export class ProcessBuilderError extends Error {
  code: string;
  taskId?: string;
  details?: unknown;
  retryable?: boolean;

  constructor(
    message: string,
    code: string = "PROCESS_BUILDER_ERROR",
    taskId?: string,
    details?: unknown,
    retryable?: boolean,
  ) {
    super(message);
    this.name = "ProcessBuilderError";
    this.code = code;
    this.taskId = taskId;
    this.details = details;
    this.retryable = retryable;

    // Maintains proper stack trace for where error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ProcessBuilderError);
    }
  }

  toJSON(): ProcessBuilderErrorType {
    return {
      code: this.code,
      message: this.message,
      taskId: this.taskId,
      details: this.details,
      retryable: this.retryable,
    };
  }
}

/**
 * Create a ProcessBuilderError from an unknown error
 */
export function createProcessBuilderError(
  error: unknown,
  taskId?: string,
): ProcessBuilderError {
  if (error instanceof ProcessBuilderError) {
    return error;
  }

  if (error instanceof Error) {
    return new ProcessBuilderError(
      error.message,
      "EXECUTION_ERROR",
      taskId,
      error,
    );
  }

  return new ProcessBuilderError(
    "Unknown error occurred",
    "UNKNOWN_ERROR",
    taskId,
    error,
  );
}
