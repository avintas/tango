import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// PUT /api/stats/[id] - Update stats entry
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id, 10);
    const body = await request.json();

    // Build update object with only provided fields
    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (body.stat_text !== undefined) updateData.stat_text = body.stat_text;
    if (body.stat_value !== undefined) updateData.stat_value = body.stat_value;
    if (body.stat_category !== undefined)
      updateData.stat_category = body.stat_category;
    if (body.year !== undefined) updateData.year = body.year;
    if (body.theme !== undefined) updateData.theme = body.theme;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.attribution !== undefined)
      updateData.attribution = body.attribution;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.source_content_id !== undefined)
      updateData.source_content_id = body.source_content_id;
    if (body.used_in !== undefined) updateData.used_in = body.used_in;
    if (body.display_order !== undefined)
      updateData.display_order = body.display_order;
    if (body.published_at !== undefined)
      updateData.published_at = body.published_at;
    if (body.archived_at !== undefined)
      updateData.archived_at = body.archived_at;

    const { data, error } = await supabase
      .from("collection_stats")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating stat:", error);
      return NextResponse.json(
        { success: false, error: "Failed to update stats entry" },
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

// PATCH /api/stats/[id] - Partially update stats (archive/status changes)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id, 10);
    const body = await request.json();

    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    // Handle archive status
    if (body.status === "archived" && !body.archived_at) {
      updateData.status = "archived";
      updateData.archived_at = new Date().toISOString();
    } else if (body.status) {
      updateData.status = body.status;
      if (body.status === "published" && !body.published_at) {
        updateData.published_at = new Date().toISOString();
      }
    }

    const { data, error } = await supabase
      .from("collection_stats")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error patching stat:", error);
      return NextResponse.json(
        { success: false, error: "Failed to update stats status" },
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

// DELETE /api/stats/[id] - Delete stats entry
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id, 10);

    const { error } = await supabase
      .from("collection_stats")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting stat:", error);
      return NextResponse.json(
        { success: false, error: "Failed to delete stats entry" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
