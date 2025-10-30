import { supabaseAdmin } from "@/lib/supabase-admin";
import { NextResponse } from "next/server";
import { UniContent } from "@/lib/content-types";

interface SaveRequest {
  itemsToSave: UniContent[];
  sourceContentId: string | null;
  createdBy: string | null;
}

export async function POST(req: Request) {
  try {
    const { itemsToSave, sourceContentId, createdBy }: SaveRequest =
      await req.json();

    if (
      !itemsToSave ||
      !Array.isArray(itemsToSave) ||
      itemsToSave.length === 0
    ) {
      return NextResponse.json(
        { success: false, error: "No items to save" },
        { status: 400 },
      );
    }

    // Determine content type from first item
    const contentType = itemsToSave[0].content_type;

    // Route to the appropriate dedicated table based on content type
    let tableName: string;
    let recordsToInsert: any[];

    switch (contentType) {
      case "statistics":
      case "statistic": // Handle both singular and plural
        tableName = "stats";
        recordsToInsert = itemsToSave.map((item) => ({
          stat_text: item.content_text,
          stat_value: item.stat_value || null,
          stat_category: item.stat_category || null,
          year: item.year || null,
          theme: item.theme || null,
          category: item.category || null,
          attribution: item.attribution || null,
          status: "draft",
          source_content_id: sourceContentId ? Number(sourceContentId) : null,
        }));
        break;

      case "motivational":
        tableName = "motivational";
        recordsToInsert = itemsToSave.map((item) => ({
          quote: item.content_text,
          context: item.context || null,
          theme: item.theme || null,
          category: item.category || null,
          attribution: item.attribution || null,
          status: "draft",
          source_content_id: sourceContentId ? Number(sourceContentId) : null,
        }));
        break;

      case "greetings":
      case "greeting": // Handle both singular and plural
        tableName = "collection_greetings";
        recordsToInsert = itemsToSave.map((item) => ({
          greeting_text: item.content_text,
          attribution: item.attribution || null,
          status: "draft",
          source_content_id: sourceContentId ? Number(sourceContentId) : null,
        }));
        break;

      case "penalty-box-philosopher":
      case "wisdom":
        tableName = "wisdom";
        recordsToInsert = itemsToSave.map((item) => ({
          title: item.content_title || "Untitled",
          musing: item.musings || item.content_text,
          from_the_box: item.from_the_box || "",
          theme: item.theme || null,
          category: item.category || null,
          attribution: item.attribution || "Penalty Box Philosopher",
          status: "draft",
          source_content_id: sourceContentId ? Number(sourceContentId) : null,
        }));
        break;

      default:
        return NextResponse.json(
          {
            success: false,
            error: `Unsupported content type: ${contentType}. Expected: statistics, motivational, greetings, wisdom, or penalty-box-philosopher`,
          },
          { status: 400 },
        );
    }

    // Insert into the appropriate dedicated table
    const { data, error, count } = await supabaseAdmin
      .from(tableName)
      .insert(recordsToInsert)
      .select();

    if (error) {
      console.error(`Supabase error (${tableName} table):`, error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 },
      );
    }

    // After successful insertion, track usage if sourceContentId is provided
    if (sourceContentId && itemsToSave.length > 0) {
      const { error: rpcError } = await supabaseAdmin.rpc(
        "append_to_used_for",
        {
          target_id: Number(sourceContentId),
          usage_type: contentType,
        },
      );

      if (rpcError) {
        console.warn(
          `Content saved to ${tableName} (Count: ${count}), but failed to track usage for source ID ${sourceContentId}:`,
          rpcError.message,
        );
        // Do not block success response if only tracking fails
      }
    }

    return NextResponse.json({
      success: true,
      data,
      count,
      table: tableName, // Include which table was used for transparency
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}
