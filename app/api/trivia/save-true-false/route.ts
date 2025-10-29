import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

interface ParsedQuestion {
  question_text: string;
  theme?: string;
  tags?: string[];
  correct_answer: string;
  wrong_answers: string[];
  question_type: string;
  explanation?: string;
}

/**
 * Parse True/False questions from Markdown
 * Supports multiple formats:
 *
 * Format 1 (Structured):
 * Question 1:
 * statement: [statement]
 * is_true: TRUE/FALSE
 * correction: [correction if false]
 *
 * Format 2 (Simple):
 * **Question 1:** [statement]
 * **Answer:** True/False
 * **Explanation:** [optional]
 */
function parseTrueFalse(content: string): ParsedQuestion[] {
  const questions: ParsedQuestion[] = [];

  // Try to detect which format we're dealing with
  const hasStructuredFormat =
    /statement:/i.test(content) && /is_true:/i.test(content);

  if (hasStructuredFormat) {
    // Parse structured format
    const questionBlocks = content
      .split(/Question \d+:/i)
      .filter((block) => block.trim());

    for (const block of questionBlocks) {
      const lines = block
        .trim()
        .split("\n")
        .filter((line) => line.trim());

      let statement = "";
      let theme = "";
      let tags: string[] = [];
      let isTrue = "";
      let correction = "";

      for (const line of lines) {
        const trimmed = line.trim();

        // Extract statement
        if (trimmed.match(/^statement:/i)) {
          statement = trimmed.replace(/^statement:/i, "").trim();
        }

        // Extract theme
        if (trimmed.match(/^theme:/i)) {
          theme = trimmed.replace(/^theme:/i, "").trim();
        }

        // Extract tags
        if (trimmed.match(/^tags:/i)) {
          tags = trimmed
            .replace(/^tags:/i, "")
            .trim()
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean);
        }

        // Extract is_true
        if (trimmed.match(/^is_true:/i)) {
          isTrue = trimmed
            .replace(/^is_true:/i, "")
            .trim()
            .toUpperCase();
        }

        // Extract correction
        if (trimmed.match(/^correction:/i)) {
          correction = trimmed.replace(/^correction:/i, "").trim();
        }
      }

      if (statement && (isTrue === "TRUE" || isTrue === "FALSE")) {
        const correctAnswer = isTrue === "TRUE" ? "True" : "False";
        const wrongAnswer = isTrue === "TRUE" ? "False" : "True";

        questions.push({
          question_text: statement,
          theme: theme || undefined,
          tags: tags.length > 0 ? tags : undefined,
          correct_answer: correctAnswer,
          wrong_answers: [wrongAnswer],
          question_type: "true-false",
          explanation: correction || undefined,
        });
      }
    }
  } else {
    // Parse simple format
    const questionBlocks = content.split("---").filter((block) => block.trim());

    for (const block of questionBlocks) {
      const lines = block
        .trim()
        .split("\n")
        .filter((line) => line.trim());

      let question_text = "";
      let theme = "";
      let tags: string[] = [];
      let answer = "";
      let explanation = "";

      for (const line of lines) {
        const trimmed = line.trim();

        // Extract question
        if (trimmed.startsWith("**Question")) {
          question_text = trimmed.replace(/\*\*Question \d+:\*\*/, "").trim();
        }

        // Extract theme
        if (trimmed.startsWith("**Theme:**")) {
          theme = trimmed.replace("**Theme:**", "").trim();
        }

        // Extract tags
        if (trimmed.startsWith("**Tags:**")) {
          tags = trimmed
            .replace("**Tags:**", "")
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean);
        }

        // Extract answer
        if (trimmed.startsWith("**Answer:**")) {
          answer = trimmed.replace("**Answer:**", "").trim().toLowerCase();
        }

        // Extract explanation (optional)
        if (
          trimmed.startsWith("**Explanation:**") ||
          trimmed.startsWith("**Correction:**")
        ) {
          explanation = trimmed
            .replace(/\*\*(Explanation|Correction):\*\*/i, "")
            .trim();
        }
      }

      if (question_text && (answer === "true" || answer === "false")) {
        const correctAnswer = answer === "true" ? "True" : "False";
        const wrongAnswer = answer === "true" ? "False" : "True";

        questions.push({
          question_text,
          theme: theme || undefined,
          tags: tags.length > 0 ? tags : undefined,
          correct_answer: correctAnswer,
          wrong_answers: [wrongAnswer],
          question_type: "true-false",
          explanation: explanation || undefined,
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

    const parsedQuestions = parseTrueFalse(contentToParse);

    if (parsedQuestions.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            "No valid True/False questions found. Expected format with statement, is_true, and correction fields.",
        },
        { status: 400 },
      );
    }

    // Save to database
    const { data, error } = await supabaseAdmin
      .from("trivia_questions")
      .insert(
        parsedQuestions.map((q) => ({
          question_text: q.question_text,
          theme: q.theme,
          tags: q.tags,
          correct_answer: q.correct_answer,
          wrong_answers: q.wrong_answers,
          question_type: q.question_type,
          status: "draft",
          created_by: createdBy || null,
          // Note: explanation/correction field would need to be added to trivia_questions table
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
          usage_type: "tf",
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
    console.error("Save True/False trivia error:", error);

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
