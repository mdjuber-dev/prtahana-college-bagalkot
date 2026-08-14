import { useEffect, useState } from 'react';
import { listAdminUsers } from '@/lib/api';
import { ShieldCheck, UserCheck, Mail, Calendar, RefreshCw } from 'lucide-react';

interface AdminUser {
  user_id: string;
  email: string;
  role?: string;
  created_at?: string;
}

export default function AdminUsersPage() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAdmissions = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await listAdminUsers();
      setAdmins(data || []);
    } catch (err: any) {
      setError(err?.message || 'Failed to load admin users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAdmissions();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-primary-700 uppercase tracking-widest">
            <ShieldCheck size={14} /> System Security & Control
          </div>
          <h1 className="text-2xl font-black text-secondary-900">Admin Users</h1>
        </div>
        <button
          onClick={loadAdmissions}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-secondary-700 bg-white border border-secondary-200 hover:bg-secondary-50 transition-colors shadow-sm self-start sm:self-auto"
        >
          <RefreshCw size={14} /> Refresh List
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-semibold">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-4 animate-pulse">
          <div className="h-12 bg-gray-200 rounded-xl" />
          <div className="h-12 bg-gray-200 rounded-xl" />
          <div className="h-12 bg-gray-200 rounded-xl" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-secondary-200/80 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-secondary-100 flex items-center justify-between bg-secondary-50/50">
            <h2 className="font-bold text-secondary-800 text-sm flex items-center gap-2">
              <UserCheck size={16} className="text-primary-600" /> Authorized Administrator Accounts
            </h2>
            <span className="text-xs font-semibold text-secondary-500 bg-white px-2.5 py-1 rounded-full border border-secondary-200">
              Total: {admins.length}
            </span>
          </div>

          {admins.length === 0 ? (
            <div className="p-12 text-center text-secondary-500 text-sm">
              No administrator accounts found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-secondary-50/80 text-secondary-600 text-xs font-bold uppercase tracking-wider border-b border-secondary-200">
                    <th className="py-3.5 px-6">User ID</th>
                    <th className="py-3.5 px-6">Email Address</th>
                    <th className="py-3.5 px-6">Access Role</th>
                    <th className="py-3.5 px-6">Created Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary-100">
                  {admins.map((admin) => (
                    <tr key={admin.user_id} className="hover:bg-primary-50/30 transition-colors">
                      <td className="py-4 px-6 font-mono text-xs text-secondary-500">
                        {admin.user_id}
                      </td>
                      <td className="py-4 px-6 font-medium text-secondary-900 flex items-center gap-2">
                        <Mail size={15} className="text-secondary-400" />
                        {admin.email}
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <ShieldCheck size={12} />
                          {admin.role || 'Super Admin'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-xs text-secondary-500">
                        <span className="inline-flex items-center gap-1.5">
                          <Calendar size={13} className="text-secondary-400" />
                          {admin.created_at ? new Date(admin.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
