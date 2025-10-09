'use client';

import { useAuth } from '@/lib/auth-context';
import LoginForm from '@/components/auth/login-form';
import { Text } from '@/components/text';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  console.log('ProtectedRoute render:', { user, loading });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <Text className="mt-4 text-gray-600 dark:text-gray-400">
            Loading...
          </Text>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('No user found, showing login form');
    return <LoginForm />;
  }

  console.log('User authenticated, showing protected content');
  return <>{children}</>;
}
