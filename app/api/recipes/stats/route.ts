import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { RecipeStats } from "@/lib/recipes/types";

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
// GET /api/recipes/stats
// =============================================================================
// Get statistics for a category (for ideation/exploration)
// Query params: category (required)
// =============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          error: "Category parameter is required",
        },
        { status: 400 },
      );
    }

    // Get theme for this category (from any question in the category)
    const { data: sampleQuestion } = await supabaseAdmin
      .from("trivia_multiple_choice")
      .select("theme")
      .eq("category", category)
      .eq("status", "published")
      .limit(1)
      .single();

    const theme = sampleQuestion?.theme || null;

    // Count questions by type from all trivia tables
    const [
      mcResult,
      tfResult,
      waiResult,
      mcDifficultyResult,
      tfDifficultyResult,
      waiDifficultyResult,
    ] = await Promise.all([
      // Multiple Choice counts
      supabaseAdmin
        .from("trivia_multiple_choice")
        .select("id", { count: "exact", head: true })
        .eq("category", category)
        .eq("status", "published"),

      // True/False counts
      supabaseAdmin
        .from("trivia_true_false")
        .select("id", { count: "exact", head: true })
        .eq("category", category)
        .eq("status", "published"),

      // Who Am I counts
      supabaseAdmin
        .from("trivia_who_am_i")
        .select("id", { count: "exact", head: true })
        .eq("category", category)
        .eq("status", "published"),

      // Multiple Choice by difficulty
      supabaseAdmin
        .from("trivia_multiple_choice")
        .select("difficulty")
        .eq("category", category)
        .eq("status", "published"),

      // True/False by difficulty
      supabaseAdmin
        .from("trivia_true_false")
        .select("difficulty")
        .eq("category", category)
        .eq("status", "published"),

      // Who Am I by difficulty
      supabaseAdmin
        .from("trivia_who_am_i")
        .select("difficulty")
        .eq("category", category)
        .eq("status", "published"),
    ]);

    const mcCount = mcResult.count || 0;
    const tfCount = tfResult.count || 0;
    const waiCount = waiResult.count || 0;
    const totalAvailable = mcCount + tfCount + waiCount;

    // Calculate difficulty distribution
    const allDifficulties = [
      ...(mcDifficultyResult.data || []).map((q: any) => q.difficulty),
      ...(tfDifficultyResult.data || []).map((q: any) => q.difficulty),
      ...(waiDifficultyResult.data || []).map((q: any) => q.difficulty),
    ];

    const difficultyCounts = {
      Easy: 0,
      Medium: 0,
      Hard: 0,
    };

    for (const diff of allDifficulties) {
      if (!diff) continue;
      const normalized =
        diff.charAt(0).toUpperCase() + diff.slice(1).toLowerCase();
      if (
        normalized === "Easy" ||
        normalized === "Medium" ||
        normalized === "Hard"
      ) {
        difficultyCounts[normalized as keyof typeof difficultyCounts]++;
      }
    }

    // Calculate recent usage (sets created in last 7/30 days for this category)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Count sets created in the time period for this category
    const { count: setsLast7Days } = await supabaseAdmin
      .from("trivia_sets")
      .select("id", { count: "exact", head: true })
      .eq("category", category)
      .gte("created_at", sevenDaysAgo.toISOString());

    const { count: setsLast30Days } = await supabaseAdmin
      .from("trivia_sets")
      .select("id", { count: "exact", head: true })
      .eq("category", category)
      .gte("created_at", thirtyDaysAgo.toISOString());

    const stats: RecipeStats = {
      category,
      theme,
      questionCounts: {
        "multiple-choice": mcCount,
        "true-false": tfCount,
        "who-am-i": waiCount,
      },
      totalAvailable,
      byDifficulty: difficultyCounts,
      recentUsage: {
        last7Days: setsLast7Days || 0,
        last30Days: setsLast30Days || 0,
      },
    };

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error in GET /api/recipes/stats:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    );
  }
}
