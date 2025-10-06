import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { processed_text, word_count, processing_time_ms } = body;

    if (!processed_text) {
      return NextResponse.json(
        {
          success: false,
          error: 'processed_text is required',
        },
        { status: 400 }
      );
    }

    // Use service role key for server-side operations
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Update with processed text
    const { data, error } = await supabase
      .from('source_content')
      .update({
        processed_text,
        word_count: word_count || null,
        processing_time_ms: processing_time_ms || null,
        processed_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'Text processed successfully',
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
