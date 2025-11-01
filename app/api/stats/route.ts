import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// GET /api/stats - Fetch stats entries with filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const statsOnly = searchParams.get("stats") === "true";

    if (statsOnly) {
      const { data: allItems } = await supabase
        .from("collection_stats")
        .select("status");

      if (!allItems) {
        return NextResponse.json({
          success: true,
          stats: { unpublished: 0, published: 0, archived: 0 },
        });
      }

      const stats = {
        unpublished: allItems.filter(
          (item) => item.status !== "published" && item.status !== "archived",
        ).length,
        published: allItems.filter((item) => item.status === "published")
          .length,
        archived: allItems.filter((item) => item.status === "archived").length,
      };

      return NextResponse.json({
        success: true,
        stats,
      });
    }

    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    let query = supabase
      .from("collection_stats")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });

    // Apply status filter
    if (status) {
      if (status === "unpublished") {
        query = query.or(
          "status.is.null,and(status.not.eq.published,status.not.eq.archived)",
        );
      } else if (status === "published") {
        query = query.eq("status", "published");
      } else if (status === "archived") {
        query = query.eq("status", "archived");
      }
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error("Error fetching stats:", error);
      return NextResponse.json(
        { success: false, error: "Failed to fetch stats entries" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      data,
      count: count || 0,
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST /api/stats - Create new stats entry
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.stat_text) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required field: stat_text",
        },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("collection_stats")
      .insert([
        {
          stat_text: body.stat_text,
          stat_value: body.stat_value || null,
          stat_category: body.stat_category || null,
          year: body.year || null,
          theme: body.theme || null,
          category: body.category || null,
          attribution: body.attribution || null,
          status: body.status || "draft",
          source_content_id: body.source_content_id || null,
          used_in: body.used_in || null,
          display_order: body.display_order || null,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error creating stat:", error);
      return NextResponse.json(
        { success: false, error: "Failed to create stats entry" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
