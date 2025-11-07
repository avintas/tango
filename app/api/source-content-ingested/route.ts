import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

/**
 * GET /api/source-content-ingested
 * Get source_content_ingested content with filtering and pagination
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    // If ID is provided, fetch single item by ID
    if (id) {
      const { data, error } = await supabaseAdmin
        .from("source_content_ingested")
        .select("*")
        .eq("id", parseInt(id))
        .single();

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      return NextResponse.json({
        success: true,
        data: data || null,
      });
    }

    const limit = parseInt(searchParams.get("limit") || "12", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);
    const search = searchParams.get("search");
    const theme = searchParams.get("theme");
    const category = searchParams.get("category");
    const status = searchParams.get("status");

    let query = supabaseAdmin
      .from("source_content_ingested")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });

    // Apply filters
    if (theme) {
      query = query.eq("theme", theme);
    }

    if (category) {
      query = query.eq("category", category);
    }

    if (status) {
      query = query.eq("ingestion_status", status);
    }

    // Apply search filter
    if (search) {
      query = query.or(
        `title.ilike.%${search}%,content_text.ilike.%${search}%,summary.ilike.%${search}%`,
      );
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      count: count || 0,
    });
  } catch (error) {
    console.error("Error fetching source content ingested:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
