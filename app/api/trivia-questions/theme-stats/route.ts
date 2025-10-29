import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");

  if (!category) {
    return NextResponse.json(
      { error: "Category parameter is required" },
      { status: 400 },
    );
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("trivia_questions")
      .select("theme")
      .eq("category", category);

    if (error) {
      console.error("Supabase error fetching themes:", error);
      throw new Error(error.message);
    }

    if (!data) {
      return NextResponse.json({});
    }

    const themeCounts = data.reduce(
      (acc: { [key: string]: number }, item: { theme: string | null }) => {
        if (item.theme) {
          acc[item.theme] = (acc[item.theme] || 0) + 1;
        }
        return acc;
      },
      {},
    );

    // Also include a total count for the category
    themeCounts["All Themes"] = data.length;

    return NextResponse.json(themeCounts);
  } catch (error) {
    console.error("Error fetching theme stats:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      },
      { status: 500 },
    );
  }
}
