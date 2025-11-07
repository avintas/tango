import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

/**
 * GET /api/trivia-questions/themes-categories
 * Fetch available themes and categories from all trivia question tables
 */
export async function GET() {
  try {
    // Fetch from all three trivia tables in parallel
    const [mcResult, tfResult, waiResult] = await Promise.all([
      supabaseAdmin
        .from("trivia_multiple_choice")
        .select("theme, category")
        .eq("status", "published"),
      supabaseAdmin
        .from("trivia_true_false")
        .select("theme, category")
        .eq("status", "published"),
      supabaseAdmin
        .from("trivia_who_am_i")
        .select("theme, category")
        .eq("status", "published"),
    ]);

    // Combine all results
    const allQuestions = [
      ...(mcResult.data || []),
      ...(tfResult.data || []),
      ...(waiResult.data || []),
    ];

    // Extract unique themes and categories
    const themes = new Set<string>();
    const categories = new Set<string>();

    allQuestions.forEach((q: any) => {
      if (q.theme) themes.add(q.theme);
      if (q.category) categories.add(q.category);
    });

    return NextResponse.json({
      success: true,
      data: {
        themes: Array.from(themes),
        categories: Array.from(categories),
      },
    });
  } catch (error) {
    console.error("Error fetching themes/categories:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
