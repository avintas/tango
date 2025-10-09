import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

// Helper function to get user from request
async function getUserFromRequest(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

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

  return user;
}

/**
 * GET /api/reports/tags
 * Get tag usage statistics and analytics
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });

    // Get total number of active tags
    const { data: tagsData, error: tagsError } = await supabase
      .from('content_tags')
      .select('id, label, color, usage_count')
      .eq('is_active', true)
      .order('usage_count', { ascending: false });

    if (tagsError) {
      throw new Error(`Database error: ${tagsError.message}`);
    }

    // Get tag usage from sourced_text content_tags
    const { data: contentData, error: contentError } = await supabase
      .from('sourced_text')
      .select('content_tags')
      .not('content_tags', 'is', null);

    if (contentError) {
      throw new Error(`Database error: ${contentError.message}`);
    }

    // Count tag usage from content
    const tagUsageCount: { [key: string]: number } = {};

    contentData?.forEach(item => {
      if (item.content_tags && Array.isArray(item.content_tags)) {
        item.content_tags.forEach((tag: string) => {
          tagUsageCount[tag] = (tagUsageCount[tag] || 0) + 1;
        });
      }
    });

    // Combine tag data with usage counts
    const tagsByUsage = (tagsData || [])
      .map(tag => ({
        label: tag.label,
        count: tagUsageCount[tag.label] || tag.usage_count || 0,
        color: tag.color,
      }))
      .sort((a, b) => b.count - a.count);

    return NextResponse.json({
      success: true,
      data: {
        totalTags: tagsData?.length || 0,
        tagsByUsage,
        totalUsage: Object.values(tagUsageCount).reduce(
          (sum, count) => sum + count,
          0
        ),
      },
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
