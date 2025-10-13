import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { CreateContentProcessed } from '@/lib/supabase';

// Helper function to get user from request
async function getUserFromRequest(request: NextRequest) {
  const token = request.headers.get('authorization')?.split(' ')[1];
  if (!token) return null;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

// GET: Fetch content_processed items
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const contentType = searchParams.get('contentType');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '20');

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const token = request.headers.get('authorization')?.split(' ')[1];

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: token ? { Authorization: `Bearer ${token}` } : {} },
    });

    let query = supabase
      .from('content_processed')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (contentType) {
      query = query.eq('content_type', contentType);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      data: data || [],
    });
  } catch (error) {
    console.error('Error fetching content_processed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// POST: Create new content_processed item
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body: CreateContentProcessed = await request.json();
    const { title, content_type, markdown_content, status, published_at } =
      body;

    // Validation
    if (!title || !content_type || !markdown_content) {
      return NextResponse.json(
        {
          success: false,
          error: 'Title, content_type, and markdown_content are required',
        },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const token = request.headers.get('authorization')?.split(' ')[1];

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    const insertData: any = {
      title: title.trim(),
      content_type,
      markdown_content: markdown_content.trim(),
      status: status || 'draft',
      created_by: user.id,
    };

    if (published_at) {
      insertData.published_at = published_at;
    } else if (status === 'published') {
      insertData.published_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('content_processed')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'Content saved successfully',
    });
  } catch (error) {
    console.error('Error creating content_processed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// PATCH: Update content_processed item (e.g., publish)
export async function PATCH(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, status, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID is required' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const token = request.headers.get('authorization')?.split(' ')[1];

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    const updateData: any = { ...updates };

    if (status === 'published' && !updateData.published_at) {
      updateData.published_at = new Date().toISOString();
    }

    if (status) {
      updateData.status = status;
    }

    const { data, error } = await supabase
      .from('content_processed')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'Content updated successfully',
    });
  } catch (error) {
    console.error('Error updating content_processed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
