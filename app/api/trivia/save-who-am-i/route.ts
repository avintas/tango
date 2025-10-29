import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

interface ParsedQuestion {
  question_text: string;
  theme?: string;
  tags?: string[];
  correct_answer: string;
  wrong_answers: string[];
  question_type: string;
}

/**
 * Parse Who Am I questions from Markdown
 * Flexible format - handles both:
 * 1. Simple: **Question 1:** I am... **Answer:** [answer]
 * 2. With options: **Question 1:** I am... A) B) C) D) **Correct Answer:** A
 */
function parseWhoAmI(content: string): ParsedQuestion[] {
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
    let answer = "";
    const options: { [key: string]: string } = {};
    let correctAnswerKey = "";

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

      // Extract options if present (A, B, C, D)
      const optionMatch = trimmed.match(/^([A-D])\)\s*(.+)$/);
      if (optionMatch) {
        options[optionMatch[1]] = optionMatch[2].trim();
      }

      // Extract answer - could be direct text or letter reference
      if (trimmed.startsWith("**Answer:**")) {
        answer = trimmed.replace("**Answer:**", "").trim();
      } else if (trimmed.startsWith("**Correct Answer:**")) {
        const extracted = trimmed
          .replace("**Correct Answer:**", "")
          .trim()
          .toUpperCase();

        // If it's a letter (A, B, C, D), it's referencing an option
        if (/^[A-D]$/.test(extracted) && Object.keys(options).length > 0) {
          correctAnswerKey = extracted;
          answer = options[extracted] || "";
        } else {
          answer = extracted;
        }
      }
    }

    // If we have options and a letter key, get the actual answer text
    if (correctAnswerKey && options[correctAnswerKey]) {
      answer = options[correctAnswerKey];
    }

    if (question_text && answer) {
      questions.push({
        question_text,
        theme: theme || undefined,
        tags: tags.length > 0 ? tags : undefined,
        correct_answer: answer,
        wrong_answers: [], // Who Am I questions don't need wrong answers
        question_type: "who-am-i",
      });
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

    const parsedQuestions = parseWhoAmI(contentToParse);

    if (parsedQuestions.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            "No valid Who Am I questions found. Expected format: **Question N:** [question], **Answer:** [answer]",
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
          usage_type: "whoami",
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
    console.error("Save Who Am I trivia error:", error);

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
