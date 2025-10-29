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

    const recordsToInsert = itemsToSave.map((item) => ({
      content_type: item.content_type,
      content_text: item.content_text,
      theme: item.theme || null,
      attribution: item.attribution || null,
      category: item.category || null,
      source_content_id: sourceContentId ? Number(sourceContentId) : null,
      // created_by is not in the schema, but is kept for potential future use
    }));

    const { data, error, count } = await supabaseAdmin
      .from("content")
      .insert(recordsToInsert)
      .select();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 },
      );
    }

    // After successful insertion, track usage if sourceContentId is provided
    // This assumes all items came from the same source.
    if (sourceContentId && itemsToSave.length > 0) {
      // The content_type is the same for all items in a single batch.
      const dbContentType = itemsToSave[0].content_type;

      const { error: rpcError } = await supabaseAdmin.rpc(
        "append_to_used_for",
        {
          target_id: Number(sourceContentId),
          usage_type: dbContentType,
        },
      );

      if (rpcError) {
        console.warn(
          `Content saved (Count: ${count}), but failed to track usage for source ID ${sourceContentId}:`,
          rpcError.message,
        );
        // Do not block success response if only tracking fails
      }
    }

    return NextResponse.json({
      success: true,
      data,
      count,
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}
