import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

/**
 * GET /api/content-source/[id]
 * Get single ingested content entry by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);

    if (isNaN(id)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid ID format",
        },
        { status: 400 },
      );
    }

    const { data, error } = await supabaseAdmin
      .from("ingested")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return NextResponse.json(
        {
          success: false,
          error: "Ingested content not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Error in GET /api/content-source/[id]:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/content-source/[id]
 * Partial update (typically for status changes)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);

    if (isNaN(id)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid ID format",
        },
        { status: 400 },
      );
    }

    const body = await request.json();

    // Prepare update object
    const updates: any = {};

    // Handle status changes
    if (body.status !== undefined) {
      updates.status = body.status;
    }

    // Handle other fields if needed
    if (body.title !== undefined) {
      updates.title = body.title;
    }

    if (body.themes !== undefined) {
      updates.themes = body.themes;
    }

    if (body.used_for !== undefined) {
      updates.used_for = body.used_for;
    }

    const { data, error } = await supabaseAdmin
      .from("ingested")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error || !data) {
      console.error("Error updating ingested content:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to update ingested content",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Error in PATCH /api/content-source/[id]:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/content-source/[id]
 * Delete ingested content entry
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);

    if (isNaN(id)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid ID format",
        },
        { status: 400 },
      );
    }

    const { error } = await supabaseAdmin
      .from("ingested")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting ingested content:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to delete ingested content",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Error in DELETE /api/content-source/[id]:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    );
  }
}
