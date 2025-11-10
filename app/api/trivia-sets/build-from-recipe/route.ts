import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  Recipe,
  RecipeExecutionRequest,
  RecipeExecutionResult,
} from "@/lib/recipes/types";

// Initialize Supabase Admin Client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);

// =============================================================================
// POST /api/trivia-sets/build-from-recipe
// =============================================================================
// Execute a recipe to build a trivia set
// Body: RecipeExecutionRequest
// =============================================================================

export async function POST(request: NextRequest) {
  try {
    const body: RecipeExecutionRequest = await request.json();
    const {
      recipeId,
      recipe: inlineRecipe,
      quantity: overrideQuantity,
      allowPartialSets = false,
    } = body;

    // Load recipe (either by ID or from inline recipe)
    let recipe: Recipe | null = null;

    if (recipeId) {
      const { data, error } = await supabaseAdmin
        .from("trivia_sets_recipes")
        .select("*")
        .eq("id", recipeId)
        .single();

      if (error || !data) {
        return NextResponse.json(
          {
            success: false,
            error: "Recipe not found",
          } as RecipeExecutionResult,
          { status: 404 },
        );
      }

      // Transform database record to Recipe
      recipe = {
        id: data.id,
        name: data.name,
        description: data.description,
        category: data.category,
        theme: data.theme,
        questionTypes: data.question_types || [],
        bagType: data.bag_type,
        quantity: {
          min: data.quantity_min,
          max: data.quantity_max,
          default: data.quantity_default,
        },
        cooldown: {
          days: data.cooldown_days,
          enabled: data.cooldown_enabled,
        },
        selectionMethod: data.selection_method || "random",
        executionMode: data.execution_mode || "auto",
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        createdBy: data.created_by,
        usageCount: data.usage_count || 0,
        lastUsedAt: data.last_used_at,
      };
    } else if (inlineRecipe) {
      // Use inline recipe (temporary, won't update stats)
      recipe = {
        id: 0,
        name: "Inline Recipe",
        description: inlineRecipe.description,
        category: inlineRecipe.category,
        theme: inlineRecipe.theme,
        questionTypes: inlineRecipe.questionTypes,
        bagType: inlineRecipe.bagType,
        quantity: inlineRecipe.quantity,
        cooldown: inlineRecipe.cooldown,
        selectionMethod: inlineRecipe.selectionMethod || "random",
        executionMode: inlineRecipe.executionMode || "auto",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: inlineRecipe.createdBy,
        usageCount: 0,
        lastUsedAt: null,
      };
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "Either recipeId or recipe object is required",
        } as RecipeExecutionResult,
        { status: 400 },
      );
    }

    if (!recipe) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to load recipe",
        } as RecipeExecutionResult,
        { status: 500 },
      );
    }

    // Determine quantity to use
    const targetQuantity = overrideQuantity || recipe.quantity.default;
    const actualQuantity = Math.min(
      Math.max(targetQuantity, recipe.quantity.min),
      recipe.quantity.max,
    );

    // Query questions by category and question types
    const allQuestions: any[] = [];

    // Query Multiple Choice if requested
    if (recipe.questionTypes.includes("multiple-choice")) {
      let mcQuery = supabaseAdmin
        .from("trivia_multiple_choice")
        .select("*")
        .eq("category", recipe.category)
        .eq("status", "published");

      const { data: mcData, error: mcError } = await mcQuery;

      if (mcError) {
        console.error("Error querying multiple choice:", mcError);
      } else if (mcData) {
        allQuestions.push(
          ...mcData.map((q) => ({
            ...q,
            question_type: "multiple-choice",
            source_table: "trivia_multiple_choice",
            wrong_answers: q.wrong_answers || [],
          })),
        );
      }
    }

    // Query True/False if requested
    if (recipe.questionTypes.includes("true-false")) {
      let tfQuery = supabaseAdmin
        .from("trivia_true_false")
        .select("*")
        .eq("category", recipe.category)
        .eq("status", "published");

      const { data: tfData, error: tfError } = await tfQuery;

      if (tfError) {
        console.error("Error querying true/false:", tfError);
      } else if (tfData) {
        allQuestions.push(
          ...tfData.map((q) => ({
            ...q,
            question_type: "true-false",
            source_table: "trivia_true_false",
            correct_answer: q.is_true ? "True" : "False",
            wrong_answers: [],
          })),
        );
      }
    }

    // Query Who Am I if requested
    if (recipe.questionTypes.includes("who-am-i")) {
      let waiQuery = supabaseAdmin
        .from("trivia_who_am_i")
        .select("*")
        .eq("category", recipe.category)
        .eq("status", "published");

      const { data: waiData, error: waiError } = await waiQuery;

      if (waiError) {
        console.error("Error querying who-am-i:", waiError);
      } else if (waiData) {
        allQuestions.push(
          ...waiData.map((q) => ({
            ...q,
            question_type: "who-am-i",
            source_table: "trivia_who_am_i",
            wrong_answers: [],
          })),
        );
      }
    }

    // Apply cooldown filter if enabled
    let availableQuestions = allQuestions;

    if (recipe.cooldown.enabled && recipe.cooldown.days !== null) {
      const cooldownDate = new Date();
      cooldownDate.setDate(cooldownDate.getDate() - recipe.cooldown.days);

      // Get recently used question IDs from all set tables
      const [mcUsed, tfUsed, waiUsed] = await Promise.all([
        supabaseAdmin
          .from("sets_trivia_multiple_choice")
          .select("question_data")
          .gte("created_at", cooldownDate.toISOString()),
        supabaseAdmin
          .from("sets_trivia_true_false")
          .select("question_data")
          .gte("created_at", cooldownDate.toISOString()),
        supabaseAdmin
          .from("sets_trivia_who_am_i")
          .select("question_data")
          .gte("created_at", cooldownDate.toISOString()),
      ]);

      // Extract source_id from question_data JSONB arrays
      const usedIds = new Set<number>();

      // Process multiple choice sets
      if (mcUsed.data) {
        mcUsed.data.forEach((set: any) => {
          if (set.question_data && Array.isArray(set.question_data)) {
            set.question_data.forEach((q: any) => {
              if (q.source_id) usedIds.add(q.source_id);
            });
          }
        });
      }

      // Process true/false sets
      if (tfUsed.data) {
        tfUsed.data.forEach((set: any) => {
          if (set.question_data && Array.isArray(set.question_data)) {
            set.question_data.forEach((q: any) => {
              if (q.source_id) usedIds.add(q.source_id);
            });
          }
        });
      }

      // Process who-am-i sets
      if (waiUsed.data) {
        waiUsed.data.forEach((set: any) => {
          if (set.question_data && Array.isArray(set.question_data)) {
            set.question_data.forEach((q: any) => {
              if (q.source_id) usedIds.add(q.source_id);
            });
          }
        });
      }

      availableQuestions = allQuestions.filter((q) => !usedIds.has(q.id));
    }

    // Check if we have enough questions
    if (availableQuestions.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: `No questions available for category "${recipe.category}" matching the criteria`,
        } as RecipeExecutionResult,
        { status: 404 },
      );
    }

    // Handle insufficient questions
    if (availableQuestions.length < actualQuantity) {
      if (!allowPartialSets) {
        return NextResponse.json(
          {
            success: false,
            error: `Insufficient questions. Requested ${actualQuantity}, but only ${availableQuestions.length} available`,
            questionsRequested: actualQuantity,
            questionsSelected: availableQuestions.length,
          } as RecipeExecutionResult,
          { status: 400 },
        );
      }
      // If allowPartialSets is true, proceed with available questions and add warning
    }

    // Random selection - use available quantity if less than requested
    const shuffled = shuffleArray([...availableQuestions]);
    const selectedQuestions = shuffled.slice(
      0,
      Math.min(actualQuantity, availableQuestions.length),
    );

    // Ensure we have at least one question
    if (selectedQuestions.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No questions available to create trivia set",
        } as RecipeExecutionResult,
        { status: 400 },
      );
    }

    // Determine which set table to use based on recipe's question types
    // Use the first question type from the recipe (recipes should have consistent types)
    const primaryType =
      recipe.questionTypes[0] ||
      selectedQuestions[0]?.question_type ||
      "multiple-choice";
    const setTableMap: Record<string, string> = {
      "multiple-choice": "sets_trivia_multiple_choice",
      "true-false": "sets_trivia_true_false",
      "who-am-i": "sets_trivia_who_am_i",
    };
    const setTable = setTableMap[primaryType] || "sets_trivia_multiple_choice";

    console.log(
      `[Recipe Execution] Recipe: ${recipe.name}, Question Types: ${recipe.questionTypes.join(", ")}, Selected Table: ${setTable}, Questions Selected: ${selectedQuestions.length}`,
    );

    // Validate that all selected questions match the recipe's question type
    const mismatchedQuestions = selectedQuestions.filter(
      (q) => !recipe.questionTypes.includes(q.question_type),
    );
    if (mismatchedQuestions.length > 0) {
      console.warn(
        `Warning: ${mismatchedQuestions.length} questions have mismatched types`,
      );
    }

    // Prepare question data for set
    const questionData = selectedQuestions.map((q, index) => ({
      question_id: `q-${q.id}-${index}`,
      source_id: q.id,
      question_text: q.question_text,
      question_type: q.question_type,
      correct_answer: q.correct_answer || (q.is_true ? "True" : "False"),
      wrong_answers: q.wrong_answers || [],
      explanation: q.explanation || null,
      tags: q.tags || [],
      difficulty: mapDifficultyToNumber(q.difficulty),
      points: calculatePoints(q.difficulty),
      time_limit: 30,
    }));

    // Create trivia set record directly in the type-specific table
    const setTitle = `${recipe.name} - ${new Date().toLocaleDateString()}`;
    const setSlug = `${recipe.category.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`;

    // Insert directly into the appropriate type-specific table
    const { data: setRecord, error: setError } = await supabaseAdmin
      .from(setTable)
      .insert({
        title: setTitle,
        slug: setSlug,
        description:
          recipe.description || `Set built from recipe: ${recipe.name}`,
        category: recipe.category || null,
        theme: recipe.theme || null,
        tags: [], // Empty array for tags (required TEXT[] field)
        question_data: questionData,
        question_count: questionData.length,
        difficulty: calculateSetDifficulty(selectedQuestions) || "medium",
        status: "published",
        visibility: "Public",
      })
      .select()
      .single();

    if (setError || !setRecord) {
      console.error("Error creating trivia set:", setError);
      const errorMessage = setError?.message || "Unknown error";
      const errorDetails = setError?.details || "";
      return NextResponse.json(
        {
          success: false,
          error: `Failed to create trivia set: ${errorMessage}${errorDetails ? ` (${errorDetails})` : ""}`,
        } as RecipeExecutionResult,
        { status: 500 },
      );
    }

    // Update recipe usage stats (only if recipeId was provided)
    if (recipeId) {
      await supabaseAdmin
        .from("trivia_sets_recipes")
        .update({
          usage_count: recipe.usageCount + 1,
          last_used_at: new Date().toISOString(),
        })
        .eq("id", recipeId);
    }

    const warnings: string[] = [];
    if (selectedQuestions.length < actualQuantity) {
      warnings.push(
        `Selected ${selectedQuestions.length} questions instead of requested ${actualQuantity} (only ${availableQuestions.length} available)`,
      );
    }

    return NextResponse.json({
      success: true,
      triviaSetId: setRecord.id,
      questionsSelected: selectedQuestions.length,
      questionsRequested: actualQuantity,
      warnings: warnings.length > 0 ? warnings : undefined,
    } as RecipeExecutionResult);
  } catch (error) {
    console.error("Error in POST /api/trivia-sets/build-from-recipe:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      } as RecipeExecutionResult,
      { status: 500 },
    );
  }
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

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

/**
 * Map difficulty string to number (1-3)
 */
function mapDifficultyToNumber(difficulty?: string | null): number {
  if (!difficulty) return 2; // Default medium

  const diffLower = difficulty.toLowerCase();
  if (diffLower === "easy") return 1;
  if (diffLower === "medium") return 2;
  if (diffLower === "hard") return 3;

  return 2; // Default medium
}

/**
 * Calculate points based on difficulty
 */
function calculatePoints(difficulty?: string | null): number {
  const diffNum = mapDifficultyToNumber(difficulty);
  return diffNum * 10; // Easy=10, Medium=20, Hard=30
}

/**
 * Calculate set difficulty from questions
 */
function calculateSetDifficulty(questions: any[]): "easy" | "medium" | "hard" {
  if (questions.length === 0) return "medium";

  const difficultyMap: Record<string, number> = {
    easy: 1,
    medium: 2,
    hard: 3,
  };

  let totalDifficulty = 0;
  let count = 0;

  for (const question of questions) {
    const diff = question.difficulty?.toLowerCase() || "medium";
    if (diff in difficultyMap) {
      totalDifficulty += difficultyMap[diff];
      count++;
    }
  }

  if (count === 0) return "medium";

  const avgDifficulty = totalDifficulty / count;

  if (avgDifficulty <= 1.3) return "easy";
  if (avgDifficulty <= 2.3) return "medium";
  return "hard";
}
