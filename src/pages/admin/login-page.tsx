import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, ArrowLeft, KeyRound, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase-config';
import { siteConfig } from '@/lib/site-config';

const UNAUTHORIZED_MESSAGE = 'You are not authorized to access the Admin Panel.';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  useEffect(() => {
    const state = location.state as { unauthorized?: boolean } | null;
    if (state?.unauthorized) {
      setError(UNAUTHORIZED_MESSAGE);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.pathname, location.state, navigate]);

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      if (!supabase) {
        setError('Supabase is not configured for this deployment. Please verify environment variables.');
        return;
      }
      const res = await supabase.auth.signInWithPassword({ email, password });
      if (res?.error) {
        setError(res.error.message || 'Invalid email or password');
        return;
      }

      const userId = res.data.user?.id;
      if (!userId) {
        setError('Authentication failed. Please try again.');
        return;
      }

      const { data: adminRecord, error: adminError } = await supabase
        .from('admin_users')
        .select('user_id')
        .eq('user_id', userId)
        .limit(1)
        .maybeSingle();

      if (adminError) {
        console.error('Admin login admin_users query error:', adminError.message);
        await supabase.auth.signOut();
        setError('Unable to verify admin access. Please try again.');
        return;
      }

      if (!adminRecord?.user_id) {
        await supabase.auth.signOut();
        setError(UNAUTHORIZED_MESSAGE);
        return;
      }

      const from = (location.state as { from?: string } | null)?.from || '/admin/dashboard';
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err?.message || 'Login failed. Please check your network connection.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!resetEmail.trim()) return;
    setResetLoading(true);
    setError('');
    try {
      if (!supabase) throw new Error('Supabase not configured');
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail.trim(), {
        redirectTo: `${window.location.origin}/admin/login`,
      });
      if (error) {
        setError(error.message);
      } else {
        setSuccess('Password reset link sent! Check your email inbox for instructions.');
        setResetModalOpen(false);
        setResetEmail('');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to send reset email.');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Subtle glowing background blobs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center mb-4">
          <img
            src={siteConfig.logo}
            alt={`${siteConfig.name} logo`}
            className="w-16 h-16 object-contain"
            width={64}
            height={64}
          />
        </div>
        <h2 className="text-center text-2xl font-extrabold text-white tracking-tight">
          Admin Portal
        </h2>
        <p className="mt-1 text-center text-sm text-slate-400 font-medium">
          {siteConfig.name}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-slate-800/90 backdrop-blur-xl py-8 px-6 shadow-2xl rounded-3xl border border-slate-700/80 sm:px-10">
          {error && (
            <div className="mb-5 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm font-medium">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-5 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm font-medium">
              {success}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Email
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail size={18} />
                </div>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="block w-full pl-10 pr-4 py-3 bg-slate-900/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock size={18} />
                </div>
                <input
                  required
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="block w-full pl-10 pr-11 py-3 bg-slate-900/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-slate-700 bg-slate-900 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-xs text-slate-300 font-medium">
                  Remember session
                </label>
              </div>

              <button
                type="button"
                onClick={() => setResetModalOpen(true)}
                className="text-xs font-semibold text-primary-400 hover:text-primary-300 transition-colors"
              >
                Forgot password?
              </button>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-gradient-primary hover:shadow-glow hover:shadow-primary-600/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Authenticating...
                  </>
                ) : (
                  <>
                    <KeyRound size={18} />
                    Sign In
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-700/60 text-center">
            <a
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
            >
              <ArrowLeft size={14} /> Back to Public Website
            </a>
          </div>
        </div>
      </div>

      {/* Password Reset Modal */}
      {resetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-800 rounded-3xl p-6 md:p-8 max-w-md w-full border border-slate-700 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-2">Reset Admin Password</h3>
            <p className="text-slate-300 text-sm mb-5">
              Enter your registered admin email address below to receive a secure password reset link.
            </p>
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Admin Email Address
                </label>
                <input
                  required
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="block w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="flex-1 py-2.5 px-4 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
                >
                  {resetLoading ? <Loader2 className="animate-spin" size={16} /> : 'Send Reset Link'}
                </button>
                <button
                  type="button"
                  onClick={() => setResetModalOpen(false)}
                  className="py-2.5 px-4 bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold rounded-xl text-sm transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
