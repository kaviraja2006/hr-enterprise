import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from './auth-context';
import type { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredPermissions?: string[];
  requiredRoles?: string[];
}

export function ProtectedRoute({
  children,
  requiredPermissions,
  requiredRoles,
}: ProtectedRouteProps) {
  const { user, isLoading, hasAnyPermission } = useAuthContext();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role requirements
  if (requiredRoles && requiredRoles.length > 0) {
    const hasRole = requiredRoles.includes(user.roleName);
    if (!hasRole) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // Check permission requirements
  if (requiredPermissions && requiredPermissions.length > 0) {
    if (!hasAnyPermission(requiredPermissions)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <>{children}</>;
}