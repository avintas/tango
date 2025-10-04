'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface SystemStatus {
  apiConfigured: boolean;
  sourceItemsCount: number;
  triviaSetsCount: number;
  loading: boolean;
  error: string | null;
}

export function useSystemStatus() {
  const [status, setStatus] = useState<SystemStatus>({
    apiConfigured: false,
    sourceItemsCount: 0,
    triviaSetsCount: 0,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const checkSystemStatus = async () => {
      try {
        // Check if Gemini API key is configured
        const apiConfigured =
          !!process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
          !!process.env.GEMINI_API_KEY;

        // Get source items count
        const { count: sourceCount, error: sourceError } = await supabase
          .from('content_items')
          .select('*', { count: 'exact', head: true })
          .eq('metadata->>type', 'source_material');

        if (sourceError) {
          throw new Error(`Source count error: ${sourceError.message}`);
        }

        // Get trivia sets count (for now, we'll use a placeholder until we create trivia_questions table)
        // TODO: Replace with real trivia questions count when table is created
        const triviaSetsCount = 0;

        setStatus({
          apiConfigured,
          sourceItemsCount: sourceCount || 0,
          triviaSetsCount,
          loading: false,
          error: null,
        });
      } catch (error) {
        setStatus(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        }));
      }
    };

    checkSystemStatus();
  }, []);

  return status;
}
