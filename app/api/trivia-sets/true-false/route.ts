import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    // Fetch trivia sets
    let query = supabaseAdmin
      .from("sets_trivia_true_false")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });

    // Apply status filter
    if (status === "draft") {
      query = query.eq("status", "draft");
    } else if (status === "published") {
      query = query.eq("status", "published");
    } else if (status === "scheduled") {
      query = query.eq("status", "scheduled");
    }

    const { data, error, count } = await query;

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 },
      );
    }

    // Calculate stats
    const statsQuery = await supabaseAdmin
      .from("sets_trivia_true_false")
      .select("status", { count: "exact" });

    const stats = {
      draft: 0,
      published: 0,
      scheduled: 0,
    };

    if (statsQuery.data) {
      for (const item of statsQuery.data) {
        if (item.status === "draft") stats.draft++;
        else if (item.status === "published") stats.published++;
        else if (item.status === "scheduled") stats.scheduled++;
      }
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      count: count || 0,
      stats,
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
