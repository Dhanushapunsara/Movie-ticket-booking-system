import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import type { Role } from '../../types';

/**
 * Guards a group of routes.
 * - not signed in  -> /signin (and comes back here afterwards)
 * - wrong role     -> home page
 */
export default function ProtectedRoute({ roles }: { roles?: Role[] }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/signin" replace state={{ from: location.pathname + location.search }} />;
  }
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}
