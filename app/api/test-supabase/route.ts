import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  try {
    // Check if environment variables are set
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing environment variables",
          details: {
            hasSupabaseUrl: !!supabaseUrl,
            hasServiceKey: !!supabaseServiceKey,
            supabaseUrl: supabaseUrl ? "Set" : "Missing",
            serviceKey: supabaseServiceKey ? "Set" : "Missing",
          },
        },
        { status: 500 },
      );
    }

    // Test basic connection
    const { data, error } = await supabaseAdmin
      .from("ingested")
      .select("count")
      .limit(1);

    if (error) {
      return NextResponse.json(
        {
          success: false,
          error: "Database connection failed",
          details: error.message,
          environment: {
            hasSupabaseUrl: !!supabaseUrl,
            hasServiceKey: !!supabaseServiceKey,
          },
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Supabase connection successful",
      data: data,
      environment: {
        hasSupabaseUrl: !!supabaseUrl,
        hasServiceKey: !!supabaseServiceKey,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Test failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
