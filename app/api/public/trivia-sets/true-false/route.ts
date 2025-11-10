import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Force dynamic rendering (disable static optimization)
export const dynamic = "force-dynamic";

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
// GET /api/public/trivia-sets/true-false
// =============================================================================
// Public API: List published true/false trivia sets
// Query params:
//   - limit (optional, default: 20)
//   - offset (optional, default: 0)
//   - category (optional) - filter by category
//   - theme (optional) - filter by theme
//   - difficulty (optional) - filter by difficulty
// No authentication required
// Only returns published sets with Public visibility
// CORS enabled
// =============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");
    const category = searchParams.get("category");
    const theme = searchParams.get("theme");
    const difficulty = searchParams.get("difficulty");

    // Build query - only published sets with Public visibility
    let query = supabaseAdmin
      .from("sets_trivia_true_false")
      .select("*", { count: "exact" })
      .eq("status", "published")
      .eq("visibility", "Public")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (category) {
      query = query.eq("category", category);
    }
    if (theme) {
      query = query.eq("theme", theme);
    }
    if (difficulty) {
      query = query.eq("difficulty", difficulty);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        {
          status: 500,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET",
            "Access-Control-Allow-Headers": "Content-Type",
          },
        },
      );
    }

    // Return public-safe data
    const publicData = (data || []).map((set) => ({
      id: set.id,
      title: set.title,
      slug: set.slug,
      description: set.description,
      category: set.category,
      theme: set.theme,
      difficulty: set.difficulty,
      tags: set.tags || [],
      question_count: set.question_count,
      created_at: set.created_at,
      published_at: set.published_at,
      // Note: question_data is included but can be large - consider excluding it from list view
    }));

    return NextResponse.json(
      {
        success: true,
        data: publicData,
        count: count || 0,
        limit,
        offset,
      },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      },
    );
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      },
    );
  }
}
