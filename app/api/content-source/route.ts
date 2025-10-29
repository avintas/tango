import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { CreateIngestedContent } from "@/lib/supabase";

/**
 * GET /api/content-source
 * Get all ingested content entries
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    let query = supabaseAdmin.from("ingested").select("*", { count: "exact" });

    // Apply status filter if provided
    if (status) {
      query = query.eq("status", status);
    }

    // Apply search filter if provided
    if (search) {
      // Assuming you want to search in 'title' and 'content_text' fields
      query = query.or(
        `title.ilike.%${search}%,content_text.ilike.%${search}%`,
      );
    }

    // Apply ordering, pagination, and execute the combined query
    const { data, error, count } = await query
      .order("id", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      data,
      count: count || 0,
    });
  } catch (error) {
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
 * POST /api/content-source
 * Create new ingested content entry
 */
export async function POST(request: NextRequest) {
  try {
    const body: CreateIngestedContent = await request.json();
    const { content_text, word_count, char_count, used_for } = body;

    if (!content_text?.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "Content text is required",
        },
        { status: 400 },
      );
    }

    // Auto-generate a title from the first 10 words of the content
    const title = content_text.split(" ").slice(0, 10).join(" ") + "...";

    const { data, error } = await supabaseAdmin
      .from("ingested")
      .insert({
        title,
        content_text: content_text.trim(),
        word_count,
        char_count,
        used_for: used_for || [],
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      data,
      message: "Content created successfully",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
