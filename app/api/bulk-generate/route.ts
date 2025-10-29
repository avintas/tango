import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { ContentType } from "@/components/content-type-selector";

export async function POST(request: NextRequest) {
  try {
    const { sourceContentId } = await request.json();

    if (!sourceContentId) {
      return NextResponse.json(
        { success: false, error: "Source Content ID is required" },
        { status: 400 },
      );
    }

    // 1. Verify that the source content is in a 'ready' state from the 'ingested' table
    const { data: content, error: contentError } = await supabaseAdmin
      .from("ingested")
      .select("status")
      .eq("id", sourceContentId)
      .single();

    if (contentError || !content) {
      return NextResponse.json(
        { success: false, error: "Ingested content not found" },
        { status: 404 },
      );
    }

    if (content.status === "processing") {
      return NextResponse.json(
        { success: false, error: "This content is already being processed." },
        { status: 409 },
      );
    }

    // 2. Update the ingested content status to 'processing'
    const { error: updateError } = await supabaseAdmin
      .from("ingested")
      .update({ status: "processing" })
      .eq("id", sourceContentId);

    if (updateError) {
      throw new Error(
        `Failed to update ingested content status: ${updateError.message}`,
      );
    }

    // 3. Define the 7 content types to be generated
    const contentTypesToGenerate: ContentType[] = [
      "multiple-choice",
      "true-false",
      "who-am-i",
      "stats",
      "motivational",
      "greetings",
      "penalty-box-philosopher",
    ];

    // 4. Create a job for each content type
    const jobsToInsert = contentTypesToGenerate.map((type) => ({
      source_content_id: sourceContentId,
      content_type: type,
      status: "pending",
    }));

    const { data: jobs, error: jobsError } = await supabaseAdmin
      .from("generation_jobs")
      .insert(jobsToInsert)
      .select();

    if (jobsError) {
      // If creating jobs fails, we should ideally revert the status of the ingested content.
      // For now, we'll log the error and return a failure response.
      console.error("Failed to insert generation jobs:", jobsError);
      await supabaseAdmin
        .from("ingested")
        .update({ status: "failed" }) // Or back to 'ready'
        .eq("id", sourceContentId);
      throw new Error(`Failed to create generation jobs: ${jobsError.message}`);
    }

    return NextResponse.json({ success: true, data: jobs });
  } catch (error) {
    console.error("Bulk generation initiation failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
