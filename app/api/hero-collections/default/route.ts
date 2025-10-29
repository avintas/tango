import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

/**
 * GET /api/hero-collections/default
 * Fetches a random hero collection with 7 content items
 *
 * Query params:
 * - exclude: Comma-separated collection IDs to exclude (recently viewed)
 *   Example: ?exclude=1,5,12
 */
export async function GET(request: NextRequest) {
  try {
    // Get exclude list from query params
    const { searchParams } = new URL(request.url);
    const excludeParam = searchParams.get("exclude");
    const excludeIds = excludeParam
      ? excludeParam
          .split(",")
          .map((id) => parseInt(id, 10))
          .filter((id) => !isNaN(id))
      : [];

    // Fetch all active collections (excluding recently viewed)
    // Note: content_items are pre-stored JSONB, so we can't filter by their status here
    // Status filtering should happen when collections are created
    let query = supabaseAdmin
      .from("hero_collections")
      .select("id, title, description, content_items")
      .eq("active", true);

    // Exclude recently viewed collections
    if (excludeIds.length > 0) {
      query = query.not("id", "in", `(${excludeIds.join(",")})`);
    }

    const { data: collections, error: collectionError } = await query;

    if (collectionError || !collections || collections.length === 0) {
      return NextResponse.json(
        {
          error: "No active collections available",
          available_collections: collections?.length || 0,
        },
        { status: 404 },
      );
    }

    // Pick a random collection
    const randomIndex = Math.floor(Math.random() * collections.length);
    const collection = collections[randomIndex];

    // Content is already stored in the collection as JSONB
    const content = Array.isArray(collection.content_items)
      ? collection.content_items
      : [];

    return NextResponse.json({
      collection_id: collection.id,
      collection_name: collection.title,
      description: collection.description,
      content: content,
      count: content.length,
      total_available: collections.length,
    });
  } catch (error) {
    console.error("Error fetching hero collection:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
