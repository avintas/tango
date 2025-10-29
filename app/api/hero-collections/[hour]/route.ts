import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

/**
 * GET /api/hero-collections/:id
 * Fetches a specific hero collection by ID (useful for preview/testing)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { hour: string } },
) {
  try {
    const collectionId = parseInt(params.hour, 10); // Keep param name for routing

    // Validate ID
    if (isNaN(collectionId)) {
      return NextResponse.json(
        { error: "Invalid collection ID" },
        { status: 400 },
      );
    }

    // Fetch the specific collection
    const { data: collection, error: collectionError } = await supabaseAdmin
      .from("hero_collections")
      .select("id, title, description, content_items, active")
      .eq("id", collectionId)
      .single();

    if (collectionError || !collection) {
      return NextResponse.json(
        {
          error: "Collection not found",
          id: collectionId,
        },
        { status: 404 },
      );
    }

    // Content is already stored in the collection as JSONB
    const content = Array.isArray(collection.content_items)
      ? collection.content_items
      : [];

    return NextResponse.json({
      collection_id: collection.id,
      collection_name: collection.title,
      description: collection.description,
      active: collection.active,
      content: content,
      count: content.length,
    });
  } catch (error) {
    console.error("Error fetching hero collection:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
