'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface SystemStatus {
  apiConfigured: boolean;
  apiStatus: 'configured' | 'not-configured' | 'testing' | 'error';
  sourceItemsCount: number;
  triviaSetsCount: number;
  loading: boolean;
  error: string | null;
}

export function useSystemStatus() {
  const [status, setStatus] = useState<SystemStatus>({
    apiConfigured: false,
    apiStatus: 'testing',
    sourceItemsCount: 0,
    triviaSetsCount: 0,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const checkSystemStatus = async () => {
      try {
        // Test Gemini API configuration
        let apiConfigured = false;
        try {
          const response = await fetch('/api/gemini/test', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          const result = await response.json();
          apiConfigured = result.success;
        } catch (apiError) {
          console.log('Gemini API test failed:', apiError);
          apiConfigured = false;
        }

        // Get source items count
        const { count: sourceCount, error: sourceError } = await supabase
          .from('source_content')
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
          apiStatus: apiConfigured ? 'configured' : 'not-configured',
          sourceItemsCount: sourceCount || 0,
          triviaSetsCount,
          loading: false,
          error: null,
        });
      } catch (error) {
        setStatus(prev => ({
          ...prev,
          apiStatus: 'error',
          loading: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        }));
      }
    };

    checkSystemStatus();
  }, []);

  return status;
}
