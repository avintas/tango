import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      title,
      slug,
      description,
      category,
      tags,
      difficulty,
      question_count,
      question_data,
      status,
      visibility,
    } = body;

    // Validation
    if (!title || !slug) {
      return NextResponse.json(
        {
          success: false,
          error: "Title and slug are required",
        },
        { status: 400 },
      );
    }

    if (
      !question_data ||
      !Array.isArray(question_data) ||
      question_data.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "At least one question is required",
        },
        { status: 400 },
      );
    }

    // Insert into database
    const { data, error } = await supabaseAdmin
      .from("trivia_sets")
      .insert({
        title,
        slug,
        description,
        category,
        tags,
        difficulty,
        question_count,
        question_data,
        status,
        visibility,
      })
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);

      // Handle unique constraint violations
      if (error.code === "23505") {
        if (error.message.includes("slug")) {
          return NextResponse.json(
            {
              success: false,
              error:
                "A trivia set with this slug already exists. Please use a different name.",
            },
            { status: 409 },
          );
        }
      }

      return NextResponse.json(
        {
          success: false,
          error: `Failed to save trivia set: ${error.message}`,
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Save trivia set error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const visibility = searchParams.get("visibility");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");
    const id = searchParams.get("id");

    if (id) {
      const { data, error } = await supabaseAdmin
        .from("trivia_sets")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Database error:", error);
        return NextResponse.json(
          {
            success: false,
            error: `Trivia set not found: ${error.message}`,
          },
          { status: 404 },
        );
      }

      return NextResponse.json({
        success: true,
        data,
      });
    }

    let query = supabaseAdmin
      .from("trivia_sets")
      .select("*", { count: "exact" });

    // Apply filters
    if (status) {
      query = query.eq("status", status);
    }

    if (visibility) {
      query = query.eq("visibility", visibility);
    }

    // Apply pagination and ordering
    query = query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        {
          success: false,
          error: `Failed to fetch trivia sets: ${error.message}`,
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      data,
      total: count || 0,
    });
  } catch (error) {
    console.error("Fetch trivia sets error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Trivia set ID is required" },
        { status: 400 },
      );
    }

    const body = await request.json();
    const {
      title,
      slug,
      description,
      category,
      tags,
      difficulty,
      question_count,
      question_data,
      status,
      visibility,
    } = body;

    // Validation
    if (!title || !slug) {
      return NextResponse.json(
        {
          success: false,
          error: "Title and slug are required",
        },
        { status: 400 },
      );
    }

    // Update in database
    const { data, error } = await supabaseAdmin
      .from("trivia_sets")
      .update({
        title,
        slug,
        description,
        category,
        tags,
        difficulty,
        question_count,
        question_data,
        status,
        visibility,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      if (error.code === "23505") {
        if (error.message.includes("slug")) {
          return NextResponse.json(
            {
              success: false,
              error:
                "A trivia set with this slug already exists. Please use a different name.",
            },
            { status: 409 },
          );
        }
      }
      return NextResponse.json(
        {
          success: false,
          error: `Failed to update trivia set: ${error.message}`,
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Update trivia set error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Trivia set ID is required" },
        { status: 400 },
      );
    }

    const { status } = await request.json();

    if (!status) {
      return NextResponse.json(
        { success: false, error: "Status is required for patching" },
        { status: 400 },
      );
    }

    const { data, error } = await supabaseAdmin
      .from("trivia_sets")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Database patch error:", error);
      return NextResponse.json(
        {
          success: false,
          error: `Failed to update trivia set status: ${error.message}`,
        },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Patch trivia set error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
