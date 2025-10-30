import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import type { CreateContentProcessed } from "@/lib/supabase";

// GET: Fetch content_processed items
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const contentType = searchParams.get("contentType");
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "20");

    let query = supabaseAdmin
      .from("content_processed")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (contentType) {
      query = query.eq("content_type", contentType);
    }

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      data: data || [],
    });
  } catch (error) {
    console.error("Error fetching content_processed:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// POST: Create new content_processed item
export async function POST(request: NextRequest) {
  try {
    const body: CreateContentProcessed = await request.json();
    const { title, content_type, markdown_content, status } = body;

    // Validation
    if (!title || !content_type || !markdown_content) {
      return NextResponse.json(
        {
          success: false,
          error: "Title, content_type, and markdown_content are required",
        },
        { status: 400 },
      );
    }

    const insertData: any = {
      title: title.trim(),
      content_type,
      markdown_content: markdown_content.trim(),
      status: status || "draft",
    };

    const { data, error } = await supabaseAdmin
      .from("content_processed")
      .insert(insertData)
      .select()
      .single();

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      data,
      message: "Content saved successfully",
    });
  } catch (error) {
    console.error("Error creating content_processed:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// PATCH: Update content_processed item (e.g., publish)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID is required" },
        { status: 400 },
      );
    }

    const updateData: any = { ...updates };

    if (status) {
      updateData.status = status;
    }

    const { data, error } = await supabaseAdmin
      .from("content_processed")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      data,
      message: "Content updated successfully",
    });
  } catch (error) {
    console.error("Error updating content_processed:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
