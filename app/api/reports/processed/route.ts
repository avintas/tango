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
 * GET /api/reports/processed
 * Get processed content statistics and analytics
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

    // Get total processed content count
    const { count: totalProcessed, error: totalError } = await supabase
      .from('processed_content')
      .select('*', { count: 'exact', head: true });

    if (totalError) {
      throw new Error(`Database error: ${totalError.message}`);
    }

    // Get processed content by type
    const { data: processedByTypeData, error: typeError } = await supabase
      .from('processed_content')
      .select('content_type, status')
      .not('content_type', 'is', null);

    if (typeError) {
      throw new Error(`Database error: ${typeError.message}`);
    }

    // Count processed content by type
    const typeCount: { [key: string]: number } = {};
    processedByTypeData?.forEach(item => {
      typeCount[item.content_type] = (typeCount[item.content_type] || 0) + 1;
    });

    const processedByType = Object.entries(typeCount)
      .map(([type, count]) => ({
        type,
        count,
      }))
      .sort((a, b) => b.count - a.count);

    // Count by status
    const statusCount: { [key: string]: number } = {};
    processedByTypeData?.forEach(item => {
      statusCount[item.status] = (statusCount[item.status] || 0) + 1;
    });

    const processedByStatus = Object.entries(statusCount)
      .map(([status, count]) => ({
        status,
        count,
      }))
      .sort((a, b) => b.count - a.count);

    // Get recent processed content (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: recentData, error: recentError } = await supabase
      .from('processed_content')
      .select('content_type, created_at')
      .gte('created_at', sevenDaysAgo.toISOString())
      .order('created_at', { ascending: false });

    if (recentError) {
      throw new Error(`Database error: ${recentError.message}`);
    }

    // Group recent processed activity by date
    const recentActivity: { [key: string]: number } = {};
    recentData?.forEach(item => {
      const date = new Date(item.created_at).toISOString().split('T')[0];
      recentActivity[date] = (recentActivity[date] || 0) + 1;
    });

    const formattedRecentActivity = Object.entries(recentActivity)
      .map(([date, count]) => ({
        date,
        count,
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json({
      success: true,
      data: {
        totalProcessed: totalProcessed || 0,
        processedByType,
        processedByStatus,
        recentActivity: formattedRecentActivity.slice(0, 7),
        processingRate: 0, // Could calculate based on time periods
        averageQualityScore: 0, // Could calculate if quality scores are available
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
