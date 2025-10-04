'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function SupabaseTest() {
  const [connectionStatus, setConnectionStatus] = useState<
    'testing' | 'connected' | 'error'
  >('testing');
  const [tables, setTables] = useState<string[]>([]);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    async function testConnection() {
      try {
        // Test basic connection by querying the cms_groups table
        const { data, error } = await supabase
          .from('cms_groups')
          .select('*')
          .limit(5);

        if (error) {
          setConnectionStatus('error');
          setError(error.message);
          return;
        }

        setConnectionStatus('connected');
        setTables(data?.map(item => item.name) || []);
      } catch (err) {
        setConnectionStatus('error');
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    }

    testConnection();
  }, []);

  return (
    <div className="p-6 border rounded-lg bg-white shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Supabase Connection Test</h2>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="font-medium">Status:</span>
          <span
            className={`px-2 py-1 rounded text-sm ${
              connectionStatus === 'connected'
                ? 'bg-green-100 text-green-800'
                : connectionStatus === 'error'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-yellow-100 text-yellow-800'
            }`}
          >
            {connectionStatus === 'testing' && 'Testing...'}
            {connectionStatus === 'connected' && 'Connected ✅'}
            {connectionStatus === 'error' && 'Error ❌'}
          </span>
        </div>

        {connectionStatus === 'connected' && (
          <div>
            <span className="font-medium">CMS Groups found:</span>
            <div className="mt-1">
              {tables.length > 0 ? (
                <ul className="list-disc list-inside text-sm text-gray-600">
                  {tables.map((table, index) => (
                    <li key={index}>{table}</li>
                  ))}
                </ul>
              ) : (
                <span className="text-sm text-gray-500">No groups found</span>
              )}
            </div>
          </div>
        )}

        {connectionStatus === 'error' && (
          <div>
            <span className="font-medium text-red-600">Error:</span>
            <p className="text-sm text-red-600 mt-1">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
