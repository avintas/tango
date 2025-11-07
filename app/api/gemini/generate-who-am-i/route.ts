import { NextResponse } from "next/server";
import { generateWhoAmI } from "@/gemini";
import { TriviaQuestion } from "@/lib/types";

function formatContentForDisplay(data: TriviaQuestion[]): string {
  if (!data || data.length === 0) return "No questions generated.";
  return data
    .map((q, index) => {
      return `**Question ${index + 1}:** ${q.question_text}\n\n**Answer:** ${q.correct_answer}\n\n**Explanation:** ${q.explanation}`;
    })
    .join("\n\n---\n\n");
}

export async function POST(req: Request) {
  try {
    const { sourceContent, customPrompt } = await req.json();

    const result = await generateWhoAmI({
      sourceContent,
      customPrompt,
    });

    if (!result.success || !result.data) {
      return NextResponse.json(
        { success: false, error: result.error || "Generation failed" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        generatedContentForDisplay: formatContentForDisplay(result.data),
        structuredDataForSaving: result.data,
      },
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 },
    );
  }
}
