import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch trivia content from sourced_text table
    // Filter by content_type that contains 'trivia' or look for trivia-related tags
    const { data: triviaContent, error } = await supabase
      .from('sourced_text')
      .select('*')
      .or('content_type.ilike.%trivia%,content_tags.cs.{trivia_source}')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching trivia content:', error);
      return NextResponse.json(
        { error: 'Failed to fetch trivia content' },
        { status: 500 }
      );
    }

    return NextResponse.json({ triviaSets: triviaContent });
  } catch (error) {
    console.error('Error in trivia-sets API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
