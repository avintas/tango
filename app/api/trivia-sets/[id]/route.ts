import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params;

    // Fetch specific trivia content from sourced_text table
    const { data: triviaSet, error } = await supabase
      .from('sourced_text')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching trivia set:', error);
      return NextResponse.json(
        { error: 'Trivia set not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ triviaSet });
  } catch (error) {
    console.error('Error in trivia-set API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
