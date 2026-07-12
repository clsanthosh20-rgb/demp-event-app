import { type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Spinner } from '@demp/ui';

interface ProtectedRouteProps {
  children: ReactNode;
  roles?: string[];
}

function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="glass-strong rounded-xl p-8 flex flex-col items-center gap-3">
          <Spinner size="lg" />
          <p className="text-sm text-white/50">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;

  return <>{children}</>;
}

export { ProtectedRoute };
