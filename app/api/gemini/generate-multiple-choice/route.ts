import { NextResponse } from "next/server";
import { generateMultipleChoice } from "@/lib/gemini-multiple-choice";
import { TriviaQuestion } from "@/lib/content-types";

function formatContentForDisplay(data: TriviaQuestion[]): string {
  if (!data || data.length === 0) return "No questions generated.";
  return data
    .map((q, index) => {
      const options = [q.correct_answer, ...q.wrong_answers].sort(
        () => Math.random() - 0.5,
      );
      const optionsString = options
        .map((opt, i) => `${String.fromCharCode(65 + i)}) ${opt}`)
        .join("\n");
      const answerLetter = String.fromCharCode(
        65 + options.indexOf(q.correct_answer),
      );

      return `**Question ${index + 1}:** ${q.question_text}\n\n${optionsString}\n\n**Correct Answer:** ${answerLetter}\n\n**Explanation:** ${q.explanation}`;
    })
    .join("\n\n---\n\n");
}

export async function POST(req: Request) {
  try {
    const { sourceContent, customPrompt } = await req.json();

    const result = await generateMultipleChoice({
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
