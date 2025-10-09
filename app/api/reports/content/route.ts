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
 * GET /api/reports/content
 * Get content statistics and analytics
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

    // Get total content count
    const { count: totalContent, error: totalError } = await supabase
      .from('sourced_text')
      .select('*', { count: 'exact', head: true });

    if (totalError) {
      throw new Error(`Database error: ${totalError.message}`);
    }

    // Get content by type
    const { data: contentByTypeData, error: typeError } = await supabase
      .from('sourced_text')
      .select('content_type')
      .not('content_type', 'is', null);

    if (typeError) {
      throw new Error(`Database error: ${typeError.message}`);
    }

    // Count content by type
    const typeCount: { [key: string]: number } = {};
    contentByTypeData?.forEach(item => {
      typeCount[item.content_type] = (typeCount[item.content_type] || 0) + 1;
    });

    const contentByType = Object.entries(typeCount)
      .map(([type, count]) => ({
        type,
        count,
      }))
      .sort((a, b) => b.count - a.count);

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: recentData, error: recentError } = await supabase
      .from('sourced_text')
      .select('content_type, created_at')
      .gte('created_at', sevenDaysAgo.toISOString())
      .order('created_at', { ascending: false });

    if (recentError) {
      throw new Error(`Database error: ${recentError.message}`);
    }

    // Group recent activity by date and type
    const recentActivity: { [key: string]: { [key: string]: number } } = {};
    recentData?.forEach(item => {
      const date = new Date(item.created_at).toISOString().split('T')[0];
      if (!recentActivity[date]) {
        recentActivity[date] = {};
      }
      recentActivity[date][item.content_type] =
        (recentActivity[date][item.content_type] || 0) + 1;
    });

    // Format recent activity for display
    const formattedRecentActivity = Object.entries(recentActivity)
      .map(([date, types]) => {
        const totalCount = Object.values(types).reduce(
          (sum, count) => sum + count,
          0
        );
        const mostUsedType = Object.entries(types).sort(
          (a, b) => b[1] - a[1]
        )[0];

        return {
          date,
          type: mostUsedType[0],
          count: totalCount,
        };
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json({
      success: true,
      data: {
        totalContent: totalContent || 0,
        contentByType,
        recentActivity: formattedRecentActivity.slice(0, 7), // Last 7 days
        totalWordCount: 0, // Could be calculated if needed
        averageContentLength: 0, // Could be calculated if needed
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
