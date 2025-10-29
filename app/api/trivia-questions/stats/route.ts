import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin.rpc(
      "get_trivia_question_stats",
    );

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        {
          success: false,
          error: `Failed to fetch stats: ${error.message}`,
        },
        { status: 500 },
      );
    }

    // The RPC returns an array of objects like { status: 'draft', count: 123 }
    // We'll transform it into a simple object: { draft: 123, published: 456 }
    const stats = data.reduce(
      (
        acc: { [key: string]: number },
        item: { status: string; count: number },
      ) => {
        acc[item.status] = item.count;
        return acc;
      },
      {},
    );

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error("Fetch stats error:", error);
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
