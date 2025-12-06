import { ReactNode, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { UserRole } from '@decolaweb/shared';
import { Loading } from '@/components/ui';

interface ProtectedRouteProps {
  children: ReactNode;
  requireRole?: UserRole;
}

export function ProtectedRoute({ children, requireRole }: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isLoading) {
    return <Loading />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (requireRole && user.role !== requireRole) {
    // Se o usuário não tem a role necessária, redireciona para sua área
    const redirectPath = user.role === UserRole.ADMIN ? '/admin/clientes' : '/app/dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
}

