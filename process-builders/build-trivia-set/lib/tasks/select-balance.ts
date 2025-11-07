import type {
  ProcessBuilderTask,
  TaskContext,
  TaskResult,
} from "@/process-builders/core/types";
import type { QuestionCandidate, QuestionSelectionResult } from "../types";

/**
 * Task 2: Select & Balance Questions
 * Selects and balances questions based on distribution strategy
 */
export const selectBalanceTask: ProcessBuilderTask = {
  id: "select-balance",
  name: "Select & Balance Questions",
  description: "Selects and balances questions based on distribution strategy",

  async execute(context: TaskContext): Promise<TaskResult> {
    try {
      // Get candidates from previous task
      const previousResult = context.previousResults?.[0];
      if (
        !previousResult?.data ||
        typeof previousResult.data !== "object" ||
        previousResult.data === null ||
        !("candidates" in previousResult.data)
      ) {
        return {
          success: false,
          errors: [
            {
              code: "NO_CANDIDATES",
              message: "No candidates from previous task",
              taskId: "select-balance",
            },
          ],
        };
      }

      const candidates = (
        previousResult.data as { candidates: QuestionCandidate[] }
      ).candidates;
      const questionCount = context.rules.questionCount?.value as
        | number
        | undefined;
      const distributionStrategy =
        (context.rules.distributionStrategy?.value as string) || "weighted";
      const questionTypes = context.rules.questionTypes?.value as
        | string[]
        | undefined;

      if (!questionCount || questionCount <= 0) {
        return {
          success: false,
          errors: [
            {
              code: "INVALID_COUNT",
              message: "questionCount must be greater than 0",
              taskId: "select-balance",
            },
          ],
        };
      }

      if (!questionTypes || questionTypes.length === 0) {
        return {
          success: false,
          errors: [
            {
              code: "NO_TYPES",
              message: "At least one question type is required",
              taskId: "select-balance",
            },
          ],
        };
      }

      // Filter candidates by requested types
      const filteredCandidates = candidates.filter((c) => {
        if (
          questionTypes.includes("TMC") ||
          questionTypes.includes("multiple-choice")
        ) {
          if (c.question_type === "multiple-choice") return true;
        }
        if (
          questionTypes.includes("TFT") ||
          questionTypes.includes("true-false")
        ) {
          if (c.question_type === "true-false") return true;
        }
        if (
          questionTypes.includes("WAI") ||
          questionTypes.includes("who-am-i")
        ) {
          if (c.question_type === "who-am-i") return true;
        }
        return false;
      });

      if (filteredCandidates.length === 0) {
        return {
          success: false,
          errors: [
            {
              code: "NO_MATCHING_CANDIDATES",
              message: "No candidates match the requested question types",
              taskId: "select-balance",
            },
          ],
        };
      }

      // Check if we have enough questions
      const allowPartialSets = context.rules.allowPartialSets?.value as
        | boolean
        | undefined;
      const availableCount = filteredCandidates.length;

      if (availableCount < questionCount) {
        if (!allowPartialSets) {
          // Option B: Error if "Allow Partial Sets" is not checked
          return {
            success: false,
            errors: [
              {
                code: "INSUFFICIENT_QUESTIONS",
                message: `Not enough questions available. Need ${questionCount}, but only ${availableCount} found. Enable "Allow Partial Sets" to create a set with fewer questions.`,
                taskId: "select-balance",
              },
            ],
          };
        }
        // If allowPartialSets is true, continue with available questions
      }

      // Use the smaller of requested count or available count
      const actualQuestionCount = Math.min(questionCount, availableCount);

      // Calculate distribution
      const distribution = calculateDistribution(
        filteredCandidates,
        actualQuestionCount, // Use actual count, not requested count
        questionTypes,
        distributionStrategy,
      );

      // Select questions
      const selected = selectQuestions(
        filteredCandidates,
        distribution,
        actualQuestionCount,
      );

      if (selected.length === 0) {
        return {
          success: false,
          errors: [
            {
              code: "SELECTION_FAILED",
              message: "Failed to select questions",
              taskId: "select-balance",
            },
          ],
        };
      }

      // Shuffle final selection
      const shuffled = shuffleArray([...selected]);

      // Add warning if we selected fewer than requested
      const warnings: string[] = [];
      if (shuffled.length < questionCount) {
        warnings.push(
          `Created partial set: Requested ${questionCount} questions, but only ${shuffled.length} available.`,
        );
      }

      return {
        success: true,
        data: {
          candidates: filteredCandidates,
          selected: shuffled,
          distribution: {
            tmc: distribution.tmc,
            tft: distribution.tft,
            wai: distribution.wai || 0,
          },
        } as QuestionSelectionResult,
        warnings: warnings.length > 0 ? warnings : undefined,
        metadata: {
          totalCandidates: filteredCandidates.length,
          selectedCount: shuffled.length,
          requestedCount: questionCount,
          distributionStrategy,
        },
      };
    } catch (error) {
      return {
        success: false,
        errors: [
          {
            code: "SELECTION_ERROR",
            message: error instanceof Error ? error.message : "Unknown error",
            taskId: "select-balance",
          },
        ],
      };
    }
  },
};

/**
 * Calculate distribution of questions across types
 */
function calculateDistribution(
  candidates: QuestionCandidate[],
  totalCount: number,
  questionTypes: string[],
  strategy: string,
): { tmc: number; tft: number; wai: number } {
  const tmcCandidates = candidates.filter(
    (c) => c.question_type === "multiple-choice",
  );
  const tftCandidates = candidates.filter(
    (c) => c.question_type === "true-false",
  );
  const waiCandidates = candidates.filter(
    (c) => c.question_type === "who-am-i",
  );

  let tmcCount = 0;
  let tftCount = 0;
  let waiCount = 0;

  switch (strategy) {
    case "even":
      // Equal split between all requested types
      const typeCount = questionTypes.length;
      const baseCount = Math.floor(totalCount / typeCount);
      const remainder = totalCount % typeCount;

      if (
        questionTypes.includes("TMC") ||
        questionTypes.includes("multiple-choice")
      ) {
        tmcCount = baseCount + (remainder > 0 ? 1 : 0);
        tmcCount = Math.min(tmcCount, tmcCandidates.length);
      }
      if (
        questionTypes.includes("TFT") ||
        questionTypes.includes("true-false")
      ) {
        tftCount = baseCount + (remainder > 1 ? 1 : 0);
        tftCount = Math.min(tftCount, tftCandidates.length);
      }
      if (questionTypes.includes("WAI") || questionTypes.includes("who-am-i")) {
        waiCount = baseCount + (remainder > 2 ? 1 : 0);
        waiCount = Math.min(waiCount, waiCandidates.length);
      }
      break;

    case "weighted":
      // Weighted by availability
      const totalAvailable =
        tmcCandidates.length + tftCandidates.length + waiCandidates.length;

      if (totalAvailable > 0) {
        if (tmcCandidates.length > 0) {
          tmcCount = Math.round(
            (totalCount * tmcCandidates.length) / totalAvailable,
          );
          tmcCount = Math.min(tmcCount, tmcCandidates.length);
        }
        if (tftCandidates.length > 0) {
          tftCount = Math.round(
            (totalCount * tftCandidates.length) / totalAvailable,
          );
          tftCount = Math.min(tftCount, tftCandidates.length);
        }
        if (waiCandidates.length > 0) {
          waiCount = Math.round(
            (totalCount * waiCandidates.length) / totalAvailable,
          );
          waiCount = Math.min(waiCount, waiCandidates.length);
        }
      }
      break;

    case "custom":
      // Use custom percentages if provided, otherwise fall back to weighted
      // For now, use weighted as default
      return calculateDistribution(
        candidates,
        totalCount,
        questionTypes,
        "weighted",
      );

    default:
      // Fallback to weighted
      return calculateDistribution(
        candidates,
        totalCount,
        questionTypes,
        "weighted",
      );
  }

  // Ensure we don't exceed total count
  const currentTotal = tmcCount + tftCount + waiCount;
  if (currentTotal > totalCount) {
    // Reduce proportionally
    const ratio = totalCount / currentTotal;
    tmcCount = Math.floor(tmcCount * ratio);
    tftCount = Math.floor(tftCount * ratio);
    waiCount = totalCount - tmcCount - tftCount;
  } else if (currentTotal < totalCount) {
    // Distribute remainder
    const remainder = totalCount - currentTotal;
    if (tmcCandidates.length > tmcCount && remainder > 0) {
      tmcCount += Math.min(remainder, tmcCandidates.length - tmcCount);
    }
    if (tftCandidates.length > tftCount && remainder > 0) {
      tftCount += Math.min(remainder, tftCandidates.length - tftCount);
    }
    if (waiCandidates.length > waiCount && remainder > 0) {
      waiCount += Math.min(remainder, waiCandidates.length - waiCount);
    }
  }

  return { tmc: tmcCount, tft: tftCount, wai: waiCount };
}

/**
 * Select questions based on distribution
 */
function selectQuestions(
  candidates: QuestionCandidate[],
  distribution: { tmc: number; tft: number; wai: number },
  totalCount: number,
): QuestionCandidate[] {
  const selected: QuestionCandidate[] = [];

  // Select TMC questions
  const tmcCandidates = candidates.filter(
    (c) => c.question_type === "multiple-choice",
  );
  if (distribution.tmc > 0 && tmcCandidates.length > 0) {
    const tmcSelected = selectDiverseQuestions(tmcCandidates, distribution.tmc);
    selected.push(...tmcSelected);
  }

  // Select TFT questions
  const tftCandidates = candidates.filter(
    (c) => c.question_type === "true-false",
  );
  if (distribution.tft > 0 && tftCandidates.length > 0) {
    const tftSelected = selectDiverseQuestions(tftCandidates, distribution.tft);
    selected.push(...tftSelected);
  }

  // Select WAI questions
  const waiCandidates = candidates.filter(
    (c) => c.question_type === "who-am-i",
  );
  if (distribution.wai > 0 && waiCandidates.length > 0) {
    const waiSelected = selectDiverseQuestions(waiCandidates, distribution.wai);
    selected.push(...waiSelected);
  }

  return selected;
}

/**
 * Select diverse questions (avoid duplicates, mix difficulty)
 */
function selectDiverseQuestions(
  candidates: QuestionCandidate[],
  count: number,
): QuestionCandidate[] {
  if (candidates.length <= count) {
    return [...candidates];
  }

  const selected: QuestionCandidate[] = [];
  const used = new Set<number>();

  // First, try to get diverse difficulty levels
  const byDifficulty = groupByDifficulty(candidates);
  const difficulties = Object.keys(byDifficulty).sort();

  // Distribute across difficulties
  let remaining = count;
  for (const difficulty of difficulties) {
    if (remaining <= 0) break;

    const pool = byDifficulty[difficulty].filter((c) => !used.has(c.id));
    if (pool.length === 0) continue;

    const takeCount = Math.ceil(
      remaining / (difficulties.length - difficulties.indexOf(difficulty)),
    );
    const toTake = Math.min(takeCount, pool.length, remaining);

    // Random select from this difficulty
    const shuffled = shuffleArray([...pool]);
    for (let i = 0; i < toTake && selected.length < count; i++) {
      selected.push(shuffled[i]);
      used.add(shuffled[i].id);
      remaining--;
    }
  }

  // Fill remaining slots randomly
  const remainingCandidates = candidates.filter((c) => !used.has(c.id));
  while (selected.length < count && remainingCandidates.length > 0) {
    const randomIndex = Math.floor(Math.random() * remainingCandidates.length);
    selected.push(remainingCandidates[randomIndex]);
    used.add(remainingCandidates[randomIndex].id);
    remainingCandidates.splice(randomIndex, 1);
  }

  return selected;
}

/**
 * Group candidates by difficulty
 */
function groupByDifficulty(
  candidates: QuestionCandidate[],
): Record<string, QuestionCandidate[]> {
  const grouped: Record<string, QuestionCandidate[]> = {
    easy: [],
    medium: [],
    hard: [],
    unknown: [],
  };

  for (const candidate of candidates) {
    const difficulty = (candidate.difficulty || "unknown").toLowerCase();
    if (difficulty in grouped) {
      grouped[difficulty].push(candidate);
    } else {
      grouped["unknown"].push(candidate);
    }
  }

  return grouped;
}

/**
 * Shuffle array (Fisher-Yates algorithm)
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
