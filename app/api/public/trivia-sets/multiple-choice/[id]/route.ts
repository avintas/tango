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
// GET /api/public/trivia-sets/multiple-choice/[id]
// =============================================================================
// Public API: Get a published multiple choice trivia set by ID
// No authentication required
// Only returns published sets
// CORS enabled
// =============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid ID format" },
        { status: 400 },
      );
    }

    // Only fetch published sets
    const { data, error } = await supabaseAdmin
      .from("sets_trivia_multiple_choice")
      .select("*")
      .eq("id", id)
      .eq("status", "published")
      .eq("visibility", "Public")
      .single();

    if (error || !data) {
      return NextResponse.json(
        {
          success: false,
          error: "Trivia set not found or not publicly available",
        },
        { status: 404 },
      );
    }

    // Return public-safe data (exclude internal fields if needed)
    return NextResponse.json(
      {
        success: true,
        data: {
          id: data.id,
          title: data.title,
          slug: data.slug,
          description: data.description,
          category: data.category,
          theme: data.theme,
          difficulty: data.difficulty,
          tags: data.tags || [],
          question_count: data.question_count,
          question_data: data.question_data,
          created_at: data.created_at,
          published_at: data.published_at,
        },
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
