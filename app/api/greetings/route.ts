import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// GET /api/greetings - Fetch greeting entries with filters or stats
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const statsOnly = searchParams.get("stats") === "true";

    // If stats requested, return counts by status
    if (statsOnly) {
      // Get all items and count by status in memory (simpler and more reliable)
      const { data: allItems } = await supabase
        .from("collection_greetings")
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

    // Regular fetch with filters
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    let query = supabase
      .from("collection_greetings")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });

    // Apply status filters
    if (status) {
      if (status === "unpublished") {
        // Unpublished = anything that is NOT published and NOT archived
        // This includes NULL, "draft", or any other status
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
      console.error("Error fetching greetings:", error);
      return NextResponse.json(
        { success: false, error: "Failed to fetch greeting entries" },
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

// POST /api/greetings - Create new greeting entry
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.greeting_text) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required field: greeting_text",
        },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("collection_greetings")
      .insert([
        {
          greeting_text: body.greeting_text,
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
      console.error("Error creating greeting:", error);
      return NextResponse.json(
        { success: false, error: "Failed to create greeting entry" },
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
