import { Navigate } from 'react-router-dom';
import { useAuthContext } from '../../core/auth/use-auth-context';

// Public route wrapper - redirects to dashboard if already authenticated
export default function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuthContext();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
