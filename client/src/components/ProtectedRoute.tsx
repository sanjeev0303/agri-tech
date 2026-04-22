import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';

interface ProtectedRouteProps {
  allowedRoles: Array<'superadmin' | 'provider' | 'labour' | 'user'>;
}

export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user && !allowedRoles.includes(user.role)) {
    // Redirect based on role if they try to access something unauthorized
    if (user.role === 'superadmin') return <Navigate to="/dashboard/admin" replace />;
    if (user.role === 'provider') return <Navigate to="/dashboard/provider" replace />;
    if (user.role === 'labour') return <Navigate to="/dashboard/labour" replace />;
    return <Navigate to="/dashboard/user" replace />;
  }

  return <Outlet />;
};
