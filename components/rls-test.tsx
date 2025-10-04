'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/button';
import { Text } from '@/components/text';

interface TestResult {
  test: string;
  status: 'success' | 'error' | 'pending';
  message: string;
  data?: any;
}

export default function RLSTest() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addResult = (
    test: string,
    status: TestResult['status'],
    message: string,
    data?: any
  ) => {
    setResults(prev => [...prev, { test, status, message, data }]);
  };

  const clearResults = () => {
    setResults([]);
  };

  const runTests = async () => {
    setIsRunning(true);
    clearResults();

    try {
      // Test 1: Check authentication
      addResult(
        'Authentication',
        'pending',
        'Checking authentication status...'
      );
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        addResult(
          'Authentication',
          'error',
          'Not authenticated. Please log in.'
        );
        return;
      }

      addResult('Authentication', 'success', `Authenticated as ${user.email}`, {
        userId: user.id,
      });

      // Test 2: Check user profile
      addResult('User Profile', 'pending', 'Checking user profile...');
      const { data: userProfile, error: profileError } = await supabase
        .from('cms_users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        addResult(
          'User Profile',
          'error',
          `Profile error: ${profileError.message}`
        );
      } else if (!userProfile) {
        addResult(
          'User Profile',
          'error',
          'User profile not found in cms_users table'
        );
      } else {
        addResult(
          'User Profile',
          'success',
          `Profile found - Role: ${userProfile.role}`,
          userProfile
        );
      }

      // Test 3: Test helper functions
      addResult('Helper Functions', 'pending', 'Testing helper functions...');

      const { data: userRole, error: roleError } =
        await supabase.rpc('get_user_role');

      const { data: isAdmin, error: adminError } =
        await supabase.rpc('is_admin');

      if (roleError || adminError) {
        addResult(
          'Helper Functions',
          'error',
          `Helper function error: ${roleError?.message || adminError?.message}`
        );
      } else {
        addResult(
          'Helper Functions',
          'success',
          `Role: ${userRole}, Is Admin: ${isAdmin}`,
          {
            role: userRole,
            isAdmin,
          }
        );
      }

      // Test 4: Test content access
      addResult('Content Access', 'pending', 'Testing content access...');
      const { data: content, error: contentError } = await supabase
        .from('content_items')
        .select('id, title, status, author_id')
        .limit(5);

      if (contentError) {
        addResult(
          'Content Access',
          'error',
          `Content access error: ${contentError.message}`
        );
      } else {
        addResult(
          'Content Access',
          'success',
          `Can access ${content?.length || 0} content items`,
          content
        );
      }

      // Test 5: Test categories access
      addResult('Categories Access', 'pending', 'Testing categories access...');
      const { data: categories, error: categoriesError } = await supabase
        .from('content_categories')
        .select('*');

      if (categoriesError) {
        addResult(
          'Categories Access',
          'error',
          `Categories error: ${categoriesError.message}`
        );
      } else {
        addResult(
          'Categories Access',
          'success',
          `Can access ${categories?.length || 0} categories`,
          categories
        );
      }

      // Test 6: Test media access
      addResult('Media Access', 'pending', 'Testing media access...');
      const { data: media, error: mediaError } = await supabase
        .from('media_library')
        .select('id, filename, file_type')
        .limit(5);

      if (mediaError) {
        addResult(
          'Media Access',
          'error',
          `Media access error: ${mediaError.message}`
        );
      } else {
        addResult(
          'Media Access',
          'success',
          `Can access ${media?.length || 0} media files`,
          media
        );
      }

      // Test 7: Test admin-only access (if user is admin)
      if (
        userProfile?.role &&
        ['admin', 'super_admin'].includes(userProfile.role)
      ) {
        addResult('Admin Access', 'pending', 'Testing admin-only access...');

        const { data: allUsers, error: usersError } = await supabase
          .from('cms_users')
          .select('id, email, name, role, is_active');

        if (usersError) {
          addResult(
            'Admin Access',
            'error',
            `Admin access error: ${usersError.message}`
          );
        } else {
          addResult(
            'Admin Access',
            'success',
            `Can access ${allUsers?.length || 0} user records`,
            allUsers
          );
        }

        // Test activity logs
        addResult('Activity Logs', 'pending', 'Testing activity log access...');
        const { data: activityLogs, error: activityError } = await supabase
          .from('cms_activity_log')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);

        if (activityError) {
          addResult(
            'Activity Logs',
            'error',
            `Activity log error: ${activityError.message}`
          );
        } else {
          addResult(
            'Activity Logs',
            'success',
            `Can access ${activityLogs?.length || 0} activity logs`,
            activityLogs
          );
        }
      } else {
        addResult('Admin Access', 'pending', 'Skipped - User is not admin');
      }
    } catch (error) {
      addResult(
        'General Error',
        'error',
        `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    } finally {
      setIsRunning(false);
    }
  };

  const createTestUser = async () => {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        addResult(
          'Create Test User',
          'error',
          'Must be authenticated to create test user'
        );
        return;
      }

      addResult('Create Test User', 'pending', 'Creating test user profile...');

      const { data, error } = await supabase
        .from('cms_users')
        .insert({
          id: user.id,
          email: user.email,
          name: user.user_metadata?.full_name || 'Test User',
          role: 'super_admin',
          is_active: true,
        })
        .select()
        .single();

      if (error) {
        addResult('Create Test User', 'error', `Error: ${error.message}`);
      } else {
        addResult(
          'Create Test User',
          'success',
          'Test user created successfully',
          data
        );
      }
    } catch (error) {
      addResult(
        'Create Test User',
        'error',
        `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <Text className="text-xl font-semibold text-gray-900">
            RLS Security Tests
          </Text>
          <div className="flex space-x-2">
            <Button outline onClick={clearResults} disabled={isRunning}>
              Clear Results
            </Button>
            <Button color="indigo" onClick={runTests} disabled={isRunning}>
              {isRunning ? 'Running Tests...' : 'Run Security Tests'}
            </Button>
          </div>
        </div>

        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <Text className="text-sm text-yellow-800">
            <strong>Note:</strong> These tests will verify that Row Level
            Security is working correctly. Make sure you&apos;ve run the RLS
            setup script in Supabase first.
          </Text>
        </div>

        <div className="mb-4">
          <Button
            outline
            onClick={createTestUser}
            disabled={isRunning}
            className="mb-2"
          >
            Create Test User Profile
          </Button>
          <Text className="text-xs text-gray-500">
            Use this if you haven&apos;t created a user profile in the cms_users
            table yet
          </Text>
        </div>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          {results.map((result, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${
                result.status === 'success'
                  ? 'bg-green-50 border-green-200'
                  : result.status === 'error'
                    ? 'bg-red-50 border-red-200'
                    : 'bg-yellow-50 border-yellow-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <Text
                  className={`font-medium ${
                    result.status === 'success'
                      ? 'text-green-800'
                      : result.status === 'error'
                        ? 'text-red-800'
                        : 'text-yellow-800'
                  }`}
                >
                  {result.test}
                </Text>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    result.status === 'success'
                      ? 'bg-green-100 text-green-800'
                      : result.status === 'error'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {result.status === 'pending'
                    ? '⏳'
                    : result.status === 'success'
                      ? '✅'
                      : '❌'}
                </span>
              </div>

              <Text
                className={`text-sm ${
                  result.status === 'success'
                    ? 'text-green-700'
                    : result.status === 'error'
                      ? 'text-red-700'
                      : 'text-yellow-700'
                }`}
              >
                {result.message}
              </Text>

              {result.data && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-xs text-gray-600 hover:text-gray-800">
                    View Data (
                    {typeof result.data === 'object'
                      ? Object.keys(result.data).length
                      : 1}{' '}
                    items)
                  </summary>
                  <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <Text className="text-sm text-blue-800">
          <strong>Setup Instructions:</strong>
          <br />
          1. Run the SQL script from <code>supabase-rls-setup.sql</code> in your
          Supabase SQL Editor
          <br />
          2. Create your user profile using the &quot;Create Test User
          Profile&quot; button above
          <br />
          3. Run the security tests to verify everything is working
          <br />
          4. Check the detailed setup guide in <code>RLS-SETUP-GUIDE.md</code>
        </Text>
      </div>
    </div>
  );
}
