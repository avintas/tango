import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabaseAdmin
      .from("trivia_questions")
      .select("category");

    if (error) {
      console.error("Supabase error fetching categories:", error);
      throw new Error(error.message);
    }

    if (!data) {
      return NextResponse.json({});
    }

    const categoryCounts = data.reduce(
      (acc: { [key: string]: number }, item: { category: string | null }) => {
        if (item.category) {
          acc[item.category] = (acc[item.category] || 0) + 1;
        }
        return acc;
      },
      {},
    );

    return NextResponse.json(categoryCounts);
  } catch (error) {
    console.error("Error fetching category stats:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      },
      { status: 500 },
    );
  }
}
