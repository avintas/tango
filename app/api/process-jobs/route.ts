import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { ContentType } from "@/components/content-type-selector";

// Helper function to introduce a delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper function to convert content type to badge key for used_for tracking
const getBadgeKey = (contentType: ContentType): string => {
  const badgeKeyMap: Record<ContentType, string> = {
    "multiple-choice": "mc",
    "true-false": "tf",
    "who-am-i": "whoami",
    stats: "stats",
    motivational: "motivational",
    greetings: "greetings",
    "penalty-box-philosopher": "pbp",
    wisdom: "wisdom",
  };
  return badgeKeyMap[contentType];
};

// Helper function to get the correct Gemini generation endpoint
const getApiEndpoint = (contentType: ContentType): string => {
  const endpointMap: Record<ContentType, string> = {
    "multiple-choice": "/api/gemini/generate-multiple-choice",
    "true-false": "/api/gemini/generate-true-false",
    "who-am-i": "/api/gemini/generate-who-am-i",
    stats: "/api/gemini/generate-stats",
    motivational: "/api/gemini/generate-motivational",
    greetings: "/api/gemini/generate-greetings",
    "penalty-box-philosopher": "/api/gemini/generate-penalty-box-philosopher",
    wisdom: "", // Wisdom is not generated this way
  };
  return endpointMap[contentType];
};

// Helper function to get the correct save endpoint
const getSaveEndpoint = (contentType: ContentType): string => {
  const triviaTypes: ContentType[] = [
    "multiple-choice",
    "true-false",
    "who-am-i",
  ];
  if (triviaTypes.includes(contentType)) return "/api/trivia/save";

  const uniContentTypes: ContentType[] = [
    "stats",
    "motivational",
    "greetings",
    "penalty-box-philosopher",
    "wisdom",
  ];
  if (uniContentTypes.includes(contentType)) return "/api/uni-content/save";

  return "";
};

export async function POST(request: NextRequest) {
  // We can add auth checks here later to ensure this is called by a trusted source (e.g., a cron job service)
  console.log("Processing job queue...");

  try {
    // 1. Find the next pending job
    const { data: job, error: findError } = await supabaseAdmin
      .from("generation_jobs")
      .select("*, ingested(*)")
      .eq("status", "pending")
      .order("created_at", { ascending: true })
      .limit(1)
      .single();

    if (findError || !job) {
      if (findError && findError.code !== "PGRST116") {
        // PGRST116 = no rows returned, which is not an error here
        console.error("Error finding pending job:", findError);
      }
      return NextResponse.json({
        success: true,
        message: "No pending jobs to process.",
      });
    }

    // 2. Mark the job as 'in_progress'
    await supabaseAdmin
      .from("generation_jobs")
      .update({ status: "in_progress", attempts: (job.attempts || 0) + 1 })
      .eq("id", job.id);

    const { ingested: source_content, content_type } = job;
    if (!source_content) {
      throw new Error("Job is missing source content.");
    }

    // 3. Find the correct prompt for this content type
    const { data: prompt, error: promptError } = await supabaseAdmin
      .from("prompts")
      .select("prompt_content")
      .eq("content_type", content_type)
      .eq("is_active", true)
      .limit(1)
      .single();

    if (promptError || !prompt) {
      throw new Error(
        `No active prompt found for content type: ${content_type}`,
      );
    }

    // 4. Call the appropriate Gemini generation API
    // This is a mock of the internal API call. In a real scenario, you'd refactor the generation logic into a shared lib function.
    const generationEndpoint = getApiEndpoint(content_type as ContentType);
    if (!generationEndpoint)
      throw new Error(`No generation endpoint for ${content_type}`);

    // For this to work, the base URL must be set in an environment variable, e.g., NEXT_PUBLIC_API_URL
    const generationResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}${generationEndpoint}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceContent: source_content.content_text,
          customPrompt: prompt.prompt_content,
        }),
      },
    );
    const generationResult = await generationResponse.json();

    if (!generationResult.success) {
      throw new Error(`Content generation failed: ${generationResult.error}`);
    }

    // 5. Save the generated content
    const saveEndpoint = getSaveEndpoint(content_type as ContentType);
    if (!saveEndpoint) throw new Error(`No save endpoint for ${content_type}`);

    const saveResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}${saveEndpoint}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemsToSave: generationResult.data.structuredDataForSaving,
          sourceContentId: source_content.id,
          // createdBy: source_content.user_id, // Assuming a user_id is on source_content
        }),
      },
    );
    const saveResult = await saveResponse.json();

    if (!saveResult.success) {
      throw new Error(`Failed to save content: ${saveResult.error}`);
    }

    // 6. Mark the job as 'completed'
    await supabaseAdmin
      .from("generation_jobs")
      .update({ status: "completed" })
      .eq("id", job.id);

    // 6.5. Update the used_for array in the ingested content
    const badgeKey = getBadgeKey(content_type as ContentType);
    const currentUsedFor = source_content.used_for || [];
    if (!currentUsedFor.includes(badgeKey)) {
      await supabaseAdmin
        .from("ingested")
        .update({ used_for: [...currentUsedFor, badgeKey] })
        .eq("id", source_content.id);
    }

    // 7. Check if all jobs for this source content are done
    const { count: remainingJobs } = await supabaseAdmin
      .from("generation_jobs")
      .select("*", { count: "exact", head: true })
      .eq("source_content_id", source_content.id)
      .in("status", ["pending", "in_progress"]);

    if (remainingJobs === 0) {
      await supabaseAdmin
        .from("ingested")
        .update({ status: "completed" })
        .eq("id", source_content.id);
    }

    // 8. Introduce the delay to space out API calls
    await delay(20000); // 20-second delay

    return NextResponse.json({
      success: true,
      message: `Job ${job.id} processed successfully.`,
    });
  } catch (error) {
    console.error("Job processing failed:", error);
    // If a job object was fetched, mark it as failed
    if (error && "job" in locals && locals.job) {
      await supabaseAdmin
        .from("generation_jobs")
        .update({
          status: "failed",
          error_message:
            error instanceof Error ? error.message : "Unknown error",
        })
        .eq("id", (locals.job as any).id);
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// A helper object to pass the job around in the catch block
const locals: { job?: any } = {};
