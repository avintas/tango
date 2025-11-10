import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

interface ParsedQuestion {
  question_text: string;
  theme?: string;
  tags?: string[];
  correct_answer: string;
  wrong_answers: string[];
  question_type: string;
  difficulty?: string;
}

/**
 * Parse multiple-choice questions from Markdown
 * Expected format:
 * **Question 1:** [question text]
 * A) [option]
 * B) [option]
 * C) [option]
 * D) [option]
 * **Correct Answer:** A
 * ---
 */
function parseMultipleChoice(content: string): ParsedQuestion[] {
  const questions: ParsedQuestion[] = [];
  const questionBlocks = content.split("---").filter((block) => block.trim());

  for (const block of questionBlocks) {
    const lines = block
      .trim()
      .split("\n")
      .filter((line) => line.trim());

    let question_text = "";
    let theme = "";
    let tags: string[] = [];
    let difficulty: string | undefined = undefined;
    let correctAnswer = "";
    const options: { [key: string]: string } = {};

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Extract question
      if (line.startsWith("**Question")) {
        question_text = line.replace(/\*\*Question \d+:\*\*/, "").trim();
      }

      // Extract theme
      if (line.startsWith("**Theme:**")) {
        theme = line.replace("**Theme:**", "").trim();
      }

      // Extract tags
      if (line.startsWith("**Tags:**")) {
        tags = line
          .replace("**Tags:**", "")
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean);
      }

      // Extract difficulty
      if (line.startsWith("**Difficulty:**")) {
        const diffValue = line
          .replace("**Difficulty:**", "")
          .trim()
          .toLowerCase();
        // Normalize to capitalized format
        if (diffValue === "easy") difficulty = "Easy";
        else if (diffValue === "medium") difficulty = "Medium";
        else if (diffValue === "hard") difficulty = "Hard";
      }

      // Extract options (A, B, C, D)
      const optionMatch = line.match(/^([A-D])\)\s*(.+)$/);
      if (optionMatch) {
        options[optionMatch[1]] = optionMatch[2].trim();
      }

      // Extract correct answer
      if (line.startsWith("**Correct Answer:**")) {
        correctAnswer = line
          .replace("**Correct Answer:**", "")
          .trim()
          .toUpperCase();
      }
    }

    // Build the question object - must have 4 options
    if (question_text && correctAnswer && Object.keys(options).length === 4) {
      const correctText = options[correctAnswer];
      const wrongAnswers = Object.entries(options)
        .filter(([key]) => key !== correctAnswer)
        .map(([, value]) => value);

      if (correctText && wrongAnswers.length === 3) {
        questions.push({
          question_text,
          theme: theme || undefined,
          tags: tags.length > 0 ? tags : undefined,
          correct_answer: correctText,
          wrong_answers: wrongAnswers,
          question_type: "multiple-choice",
          difficulty: difficulty,
        });
      }
    }
  }

  return questions;
}

export async function POST(request: NextRequest) {
  try {
    const { content, generatedContent, sourceContentId, createdBy } =
      await request.json();

    // Accept either 'content' or 'generatedContent' for backwards compatibility
    const contentToParse = generatedContent || content;

    if (!contentToParse) {
      return NextResponse.json(
        {
          success: false,
          error: "Content is required",
        },
        { status: 400 },
      );
    }

    const parsedQuestions = parseMultipleChoice(contentToParse);

    if (parsedQuestions.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            "No valid multiple-choice questions found. Expected format: **Question N:**, options A-D, **Correct Answer:** [letter]",
        },
        { status: 400 },
      );
    }

    // Save to dedicated trivia_multiple_choice table
    const { data, error } = await supabaseAdmin
      .from("trivia_multiple_choice")
      .insert(
        parsedQuestions.map((q) => ({
          question_text: q.question_text,
          correct_answer: q.correct_answer,
          wrong_answers: q.wrong_answers,
          explanation: null, // Can be added later via CMS
          theme: q.theme || null,
          tags: q.tags || null,
          difficulty: q.difficulty || null,
          status: "draft",
          source_content_id: sourceContentId ? parseInt(sourceContentId) : null,
        })),
      )
      .select();

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        {
          success: false,
          error: `Failed to save to database: ${error.message}`,
        },
        { status: 500 },
      );
    }

    // Update source content usage tracking
    if (sourceContentId) {
      await supabaseAdmin
        .rpc("append_used_for", {
          content_id: parseInt(sourceContentId),
          usage_type: "mc",
        })
        .then((result) => {
          if (result.error) {
            console.error("Failed to update usage tracking:", result.error);
            // Don't fail the whole request if tracking fails
          }
        });
    }

    return NextResponse.json({
      success: true,
      count: parsedQuestions.length,
      questions: data,
    });
  } catch (error) {
    console.error("Save multiple-choice trivia error:", error);

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
