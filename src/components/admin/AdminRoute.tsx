import { useCallback, useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Loader2, RefreshCw, ShieldAlert } from 'lucide-react';
import { getAdminToken } from '@/lib/api';
import { getCurrentAdminAccess } from '@/lib/admin-auth';

type AdminAccessState = 'loading' | 'authorized' | 'guest' | 'unauthorized' | 'error';

export default function AdminRoute() {
  const [accessState, setAccessState] = useState<AdminAccessState>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [attempt, setAttempt] = useState(0);
  const location = useLocation();

  useEffect(() => {
    let mounted = true;

    (async () => {
      setAccessState('loading');
      try {
        const access = await getCurrentAdminAccess();
        if (!mounted) return;

        if (access.status === 'authorized') {
          setAccessState('authorized');
          return;
        }

        if (access.status === 'unauthorized') {
          setAccessState('unauthorized');
          return;
        }

        if (access.status === 'error') {
          // The stored token is still present and was never rejected — the backend
          // was simply unreachable. Offer a retry instead of destroying the session.
          console.error('AdminRoute admin verification error:', access.message);
          setErrorMessage(access.message);
          setAccessState(getAdminToken() ? 'error' : 'guest');
          return;
        }

        setAccessState('guest');
      } catch (err) {
        console.error('AdminRoute unexpected:', err);
        if (!mounted) return;
        setErrorMessage(err instanceof Error ? err.message : 'Unexpected error verifying session.');
        setAccessState(getAdminToken() ? 'error' : 'guest');
      }
    })();

    return () => { mounted = false; };
  }, [location.pathname, attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  if (accessState === 'loading') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="flex items-center gap-3 text-slate-700 text-sm font-semibold">
          <Loader2 className="animate-spin text-primary-700" size={18} />
          Verifying admin session…
        </div>
      </div>
    );
  }

  if (accessState === 'authorized') return <Outlet />;

  if (accessState === 'error') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-lg text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <ShieldAlert size={24} />
          </div>
          <h1 className="text-lg font-bold text-slate-900">Could not verify your session</h1>
          <p className="mt-2 text-sm text-slate-700">{errorMessage}</p>
          <p className="mt-2 text-xs text-slate-600">
            Your session has not been signed out. This is usually a temporary connection issue.
          </p>
          <div className="mt-5 flex items-center justify-center gap-3">
            <button
              onClick={retry}
              className="inline-flex items-center gap-2 rounded-xl bg-primary-700 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-primary-800"
            >
              <RefreshCw size={15} /> Retry
            </button>
            <a
              href="/admin/login"
              className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-800 transition-colors hover:bg-slate-50"
            >
              Back to login
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (accessState === 'unauthorized') {
    return <Navigate to="/admin/login" state={{ unauthorized: true }} replace />;
  }

  return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />;
}
