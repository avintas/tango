import { NextRequest, NextResponse } from "next/server";
import { analyzeContent } from "@/ideation/lib/analysis";
import type { AnalysisRequest } from "@/ideation/lib/types";

/**
 * POST /api/ideation/analyze
 * Analyze multiple content records using Gemini
 */
export async function POST(request: NextRequest) {
  try {
    const body: AnalysisRequest = await request.json();

    if (!body.contentIds || body.contentIds.length === 0) {
      return NextResponse.json(
        { success: false, error: "At least one content ID is required" },
        { status: 400 },
      );
    }

    if (!body.analysisType) {
      return NextResponse.json(
        { success: false, error: "Analysis type is required" },
        { status: 400 },
      );
    }

    const result = await analyzeContent(body);

    return NextResponse.json({
      success: result.success,
      data: result,
    });
  } catch (error) {
    console.error("Error in ideation analyze API:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
