import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabase-config';

type AdminAccessState = 'loading' | 'authorized' | 'guest' | 'unauthorized';

export default function AdminRoute() {
  const [accessState, setAccessState] = useState<AdminAccessState>('loading');
  const location = useLocation();

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!supabase) {
        if (mounted) setAccessState('guest');
        return;
      }
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        if (mounted) setAccessState('guest');
        return;
      }

      try {
        const { data, error } = await supabase.from('admin_users').select('user_id').eq('user_id', user.id).limit(1).maybeSingle();
        if (error) {
          console.error('AdminRoute admin_users query error:', error.message);
        }
        if (!mounted) return;

        if (data?.user_id) {
          setAccessState('authorized');
          return;
        }

        await supabase.auth.signOut();
        setAccessState('unauthorized');
      } catch (err) {
        console.error('AdminRoute unexpected:', err);
        if (mounted) setAccessState('guest');
      }
    })();
    return () => { mounted = false; };
  }, [location]);

  if (accessState === 'loading') return <div className="p-6">Checking admin session…</div>;

  if (accessState === 'authorized') return <Outlet />;

  if (accessState === 'unauthorized') {
    return <Navigate to="/admin/login" state={{ unauthorized: true }} replace />;
  }

  return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />;
}
