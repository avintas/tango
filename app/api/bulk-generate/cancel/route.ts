import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: NextRequest) {
  try {
    const { sourceContentId } = await request.json();

    if (!sourceContentId) {
      return NextResponse.json(
        { success: false, error: "Missing sourceContentId" },
        { status: 400 },
      );
    }

    // Cancel all pending jobs for this source content
    const { data: cancelledJobs, error: cancelError } = await supabaseAdmin
      .from("generation_jobs")
      .update({ status: "cancelled" })
      .eq("source_content_id", sourceContentId)
      .in("status", ["pending", "in_progress"])
      .select();

    if (cancelError) {
      console.error("Error cancelling jobs:", cancelError);
      return NextResponse.json(
        { success: false, error: cancelError.message },
        { status: 500 },
      );
    }

    // Reset the ingested content status back to 'ready'
    const { error: updateError } = await supabaseAdmin
      .from("ingested")
      .update({ status: "ready" })
      .eq("id", sourceContentId);

    if (updateError) {
      console.error("Error updating ingested content status:", updateError);
      return NextResponse.json(
        { success: false, error: updateError.message },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      cancelledCount: cancelledJobs?.length || 0,
    });
  } catch (error) {
    console.error("Error in cancel endpoint:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
