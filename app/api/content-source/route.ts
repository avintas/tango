import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { CreateContentSource } from '@/lib/supabase';

// Helper function to get authenticated Supabase client
async function getAuthenticatedSupabase(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return { supabase, user };
}

/**
 * GET /api/content-source
 * Get all content source entries
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await getAuthenticatedSupabase(request);
    if (!authResult) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { supabase } = authResult;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');

    const { data, error } = await supabase
      .from('content_source')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      data,
      count: data?.length || 0,
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

/**
 * POST /api/content-source
 * Create new content source entry
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await getAuthenticatedSupabase(request);
    if (!authResult) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { supabase, user } = authResult;
    const body: CreateContentSource = await request.json();
    const { processed_content, word_count, char_count } = body;

    if (!processed_content?.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Processed content is required',
        },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('content_source')
      .insert({
        processed_content: processed_content.trim(),
        word_count,
        char_count,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'Content source created successfully',
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
