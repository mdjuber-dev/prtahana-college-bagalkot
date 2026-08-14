import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { getCurrentAdminAccess } from '@/lib/admin-auth';

type AdminAccessState = 'loading' | 'authorized' | 'guest' | 'unauthorized';

export default function AdminRoute() {
  const [accessState, setAccessState] = useState<AdminAccessState>('loading');
  const location = useLocation();

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const access = await getCurrentAdminAccess();
        if (!mounted) return;

        if (access.status === 'authorized') {
          setAccessState('authorized');
          return;
        }

        if (access.status === 'unauthorized') {
          if (mounted) setAccessState('unauthorized');
          return;
        }

        if (access.status === 'error') {
          console.error('AdminRoute admin verification error:', access.message);
        }

        setAccessState('guest');
      } catch (err) {
        console.error('AdminRoute unexpected:', err);
        if (mounted) setAccessState('guest');
      }
    })();

    return () => { mounted = false; };
  }, [location.pathname]);

  if (accessState === 'loading') return <div className="p-6">Checking admin session...</div>;

  if (accessState === 'authorized') return <Outlet />;

  if (accessState === 'unauthorized') {
    return <Navigate to="/admin/login" state={{ unauthorized: true }} replace />;
  }

  return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />;
}
