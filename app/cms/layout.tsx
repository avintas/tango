import AppShell from '@/components/app-shell';
import { AuthProvider } from '@/lib/auth-context';
import ProtectedRoute from '@/components/auth/protected-route';

export default function CMSLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <AppShell title="">{children}</AppShell>
      </ProtectedRoute>
    </AuthProvider>
  );
}
