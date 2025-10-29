import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

/**
 * GET /api/prompts
 * Get all prompts with pagination
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Get total count
    const { count } = await supabaseAdmin
      .from("prompts")
      .select("*", { count: "exact", head: true });

    // Get paginated data
    const { data, error } = await supabaseAdmin
      .from("prompts")
      .select("*")
      .order("id", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      total: count || 0,
    });
  } catch (error) {
    console.error("Error fetching prompts:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

/**
 * POST /api/prompts
 * Create new prompt
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt_content, content_type, created_by } = body;

    if (!prompt_content?.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "Prompt content is required",
        },
        { status: 400 },
      );
    }

    // Validate content_type
    const validTypes = [
      "multiple-choice",
      "true-false",
      "who-am-i",
      "statistics",
      "motivational",
      "greetings",
      "penalty-box-philosopher",
    ];
    if (!content_type || !validTypes.includes(content_type)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid content_type. Must be one of: ${validTypes.join(", ")}`,
        },
        { status: 400 },
      );
    }

    const { data, error } = await supabaseAdmin
      .from("prompts")
      .insert({
        prompt_content: prompt_content.trim(),
        content_type: content_type,
        created_by: created_by,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      data,
      message: "Prompt created successfully",
    });
  } catch (error) {
    console.error("Error creating prompt:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
