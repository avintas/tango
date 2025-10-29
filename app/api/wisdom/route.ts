import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// GET /api/wisdom - Fetch wisdom entries with filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const theme = searchParams.get("theme");
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    let query = supabase
      .from("wisdom")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });

    // Apply filters
    if (status) {
      query = query.eq("status", status);
    }

    if (theme) {
      query = query.eq("theme", theme);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error("Error fetching wisdom:", error);
      return NextResponse.json(
        { success: false, error: "Failed to fetch wisdom entries" },
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

// POST /api/wisdom - Create new wisdom entry
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.title || !body.musing || !body.from_the_box) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: title, musing, from_the_box",
        },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("wisdom")
      .insert([
        {
          title: body.title,
          musing: body.musing,
          from_the_box: body.from_the_box,
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
      console.error("Error creating wisdom:", error);
      return NextResponse.json(
        { success: false, error: "Failed to create wisdom entry" },
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
