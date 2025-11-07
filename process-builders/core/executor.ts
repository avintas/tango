import type {
  ProcessBuilderGoal,
  ProcessBuilderRules,
  ProcessBuilderOptions,
  ProcessBuilderTask,
  TaskContext,
  TaskResult,
  ProcessBuilderResult,
  TaskProgress,
  ProcessBuilderError,
} from "./types";

/**
 * Retry a task execution with exponential backoff
 */
async function retryTask<T>(
  fn: () => Promise<T>,
  maxRetries: number,
  delay: number,
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("Unknown error");

      if (attempt < maxRetries) {
        const waitTime = delay * Math.pow(2, attempt); // Exponential backoff
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        continue;
      }

      throw lastError;
    }
  }

  throw lastError || new Error("Retry failed");
}

/**
 * Process Builder Executor
 * Executes tasks in sequence with progress tracking and lifecycle hooks
 */
export class ProcessBuilderExecutor {
  private tasks: ProcessBuilderTask[] = [];
  private results: TaskResult[] = [];
  private progress: TaskProgress[] = [];
  private onProgress?: (progress: TaskProgress) => void;

  constructor(
    tasks: ProcessBuilderTask[],
    onProgress?: (progress: TaskProgress) => void,
  ) {
    this.tasks = tasks;
    this.onProgress = onProgress;
  }

  private emitProgress(progressUpdate: TaskProgress): void {
    this.progress.push(progressUpdate);
    this.onProgress?.(progressUpdate);
  }

  async execute(
    goal: ProcessBuilderGoal,
    rules: ProcessBuilderRules,
    options?: ProcessBuilderOptions,
  ): Promise<ProcessBuilderResult> {
    const startTime = Date.now();
    this.results = [];
    this.progress = [];

    const context: TaskContext = {
      goal,
      rules,
      options,
      previousResults: [],
      metadata: {},
    };

    try {
      // Execute each task in sequence
      for (let i = 0; i < this.tasks.length; i++) {
        const task = this.tasks[i];

        // Emit pending status
        this.emitProgress({
          taskId: task.id,
          taskName: task.name,
          status: "pending",
          progress: 0,
        });

        // Validate task if validator exists
        if (task.validate) {
          const validation = await task.validate(context);
          if (!validation.valid) {
            const error: ProcessBuilderError = {
              code: "VALIDATION_FAILED",
              message: `Task ${task.id} validation failed: ${validation.error}`,
              taskId: task.id,
            };

            this.emitProgress({
              taskId: task.id,
              taskName: task.name,
              status: "failed",
              progress: 0,
              error,
            });

            throw new Error(validation.error);
          }
        }

        // Call onStart hook
        if (task.onStart) {
          await task.onStart(context);
        }

        // Emit running status
        this.emitProgress({
          taskId: task.id,
          taskName: task.name,
          status: "running",
          progress: 0,
          startedAt: new Date(),
        });

        // Execute task (with retry if configured)
        let result: TaskResult;

        if (task.retryable && task.maxRetries) {
          result = await retryTask(
            () => task.execute(context),
            task.maxRetries,
            task.retryDelay || 1000,
          );
        } else {
          result = await this.executeWithTimeout(task, context);
        }

        this.results.push(result);

        // Update context with result
        if (!context.previousResults) {
          context.previousResults = [];
        }
        context.previousResults.push(result);
        if (result.data) {
          context.metadata = { ...context.metadata, ...result.metadata };
        }

        // Call lifecycle hooks
        if (result.success && task.onSuccess) {
          await task.onSuccess(result, context);
        } else if (!result.success && task.onError) {
          await task.onError(
            new Error(result.errors?.[0]?.message || "Task failed"),
            context,
          );
        }

        if (task.onComplete) {
          await task.onComplete(result, context);
        }

        // Emit completed status
        this.emitProgress({
          taskId: task.id,
          taskName: task.name,
          status: result.success ? "completed" : "failed",
          progress: 100,
          completedAt: new Date(),
          error: result.errors?.[0],
        });

        // Stop on error (unless partial results allowed)
        if (!result.success && !options?.allowPartialResults) {
          break;
        }
      }

      // Determine final status
      const hasErrors = this.results.some((r) => !r.success);
      const allSuccess = this.results.every((r) => r.success);

      const status = allSuccess
        ? "success"
        : hasErrors && options?.allowPartialResults
          ? "partial"
          : "error";

      return {
        status,
        processId: "unknown", // Set by process builder
        processName: "unknown", // Set by process builder
        results: this.results,
        taskProgress: this.progress,
        finalResult: this.results[this.results.length - 1]?.data,
        errors: this.results.flatMap((r) => r.errors || []),
        warnings: this.results.flatMap((r) => r.warnings || []),
        executionTime: Date.now() - startTime,
        metadata: context.metadata,
      };
    } catch (error) {
      return {
        status: "error",
        processId: "unknown",
        processName: "unknown",
        results: this.results,
        taskProgress: this.progress,
        errors: [
          {
            code: "EXECUTION_ERROR",
            message: error instanceof Error ? error.message : "Unknown error",
            details: error,
          },
        ],
        executionTime: Date.now() - startTime,
      };
    }
  }

  private async executeWithTimeout(
    task: ProcessBuilderTask,
    context: TaskContext,
  ): Promise<TaskResult> {
    if (!task.timeout) {
      return await task.execute(context);
    }

    return Promise.race([
      task.execute(context),
      new Promise<TaskResult>((_, reject) =>
        setTimeout(
          () =>
            reject(
              new Error(`Task ${task.id} timed out after ${task.timeout}ms`),
            ),
          task.timeout,
        ),
      ),
    ]);
  }
}
