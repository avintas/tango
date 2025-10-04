'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface ConnectionStatus {
  status: 'connected' | 'connecting' | 'error';
  message: string;
  responseTime?: number;
}

export default function SupabaseStatus() {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    status: 'connecting',
    message: 'Checking connection...',
  });

  useEffect(() => {
    const checkConnection = async () => {
      const startTime = Date.now();

      try {
        // Simple query to test connection
        const { data, error } = await supabase
          .from('content_categories')
          .select('count')
          .limit(1);

        const responseTime = Date.now() - startTime;

        if (error) {
          setConnectionStatus({
            status: 'error',
            message: `Database error: ${error.message}`,
            responseTime,
          });
        } else {
          setConnectionStatus({
            status: 'connected',
            message: `Connected (${responseTime}ms)`,
            responseTime,
          });
        }
      } catch (err) {
        const responseTime = Date.now() - startTime;
        setConnectionStatus({
          status: 'error',
          message: 'Connection failed',
          responseTime,
        });
      }
    };

    checkConnection();

    // Check connection every 30 seconds
    const interval = setInterval(checkConnection, 30000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    switch (connectionStatus.status) {
      case 'connected':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20';
      case 'connecting':
        return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20';
      case 'error':
        return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20';
    }
  };

  const getStatusIcon = () => {
    switch (connectionStatus.status) {
      case 'connected':
        return (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        );
      case 'connecting':
        return (
          <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        );
      case 'error':
        return (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        );
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <div
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}
      >
        {getStatusIcon()}
        <span className="ml-1">Supabase</span>
      </div>
      <span className="text-xs text-gray-500 dark:text-gray-400">
        {connectionStatus.message}
      </span>
    </div>
  );
}
