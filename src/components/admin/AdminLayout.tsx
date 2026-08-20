import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { clearAdminToken, getCurrentAdmin } from '@/lib/api';
import { siteConfig } from '@/lib/site-config';
import { getMediaUrl } from '@/lib/media-url';
import {
  BarChart3, Briefcase, ChevronRight, FileText, GalleryHorizontal, GraduationCap,
  Inbox, LayoutDashboard, LogOut, Menu, Megaphone,
  Search, Settings, User, Users, X, Bell, Sliders
} from 'lucide-react';

interface SidebarProps {
  onCloseMobile?: () => void;
  adminEmail?: string;
}

interface NavGroup {
  groupName: string;
  items: { to: string; label: string; icon: any }[];
}

function Sidebar({ onCloseMobile, adminEmail }: SidebarProps) {
  const navGroups: NavGroup[] = [
    {
      groupName: 'Overview',
      items: [
        { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      ],
    },
    {
      groupName: 'Content Management',
      items: [
        { to: '/admin/announcements', label: 'Announcements', icon: Megaphone },
        { to: '/admin/cms/site-config', label: 'Site CMS', icon: Settings },
        { to: '/admin/media-library', label: 'Media Library', icon: GalleryHorizontal },
      ],
    },
    {
      groupName: 'Admissions & Leads',
      items: [
        { to: '/admin/admissions', label: 'Admissions', icon: GraduationCap },
        { to: '/admin/enquiries', label: 'Enquiries', icon: Inbox },
      ],
    },
    {
      groupName: 'Careers & HR',
      items: [
        { to: '/admin/careers', label: 'Career Jobs', icon: Briefcase },
        { to: '/admin/careers/applications', label: 'Applications', icon: FileText },
      ],
    },
    {
      groupName: 'System & Config',
      items: [
        { to: '/admin/analytics', label: 'Dashboard Config', icon: BarChart3 },
        { to: '/admin/admin-users', label: 'Admin Users', icon: Users },
        { to: '/admin/settings', label: 'Settings', icon: Sliders },
      ],
    },
  ];

  return (
    <aside className="w-72 bg-slate-900 text-white flex flex-col h-screen sticky top-0 overflow-y-auto select-none border-r border-slate-800 shadow-2xl">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
        <Link to="/admin/dashboard" onClick={onCloseMobile} className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-white p-1 border border-slate-700 shadow-md group-hover:scale-105 transition-transform shrink-0 flex items-center justify-center overflow-hidden">
            <img
              src={getMediaUrl(siteConfig.logo)}
              alt={siteConfig.name}
              className="w-full h-full object-contain"
            />
          </div>
          <div className="min-w-0">
            <span className="block font-black text-sm text-white tracking-tight leading-tight truncate">
              Prarthana PU
            </span>
            <span className="block text-[10px] text-amber-400 font-black uppercase tracking-wider leading-tight">
              Administration Portal
            </span>
          </div>
        </Link>
        {onCloseMobile && (
          <button onClick={onCloseMobile} className="md:hidden text-slate-300 hover:text-white p-1" aria-label="Close menu">
            <X size={20} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto custom-scrollbar">
        {navGroups.map((group) => (
          <div key={group.groupName} className="space-y-1.5">
            <div className="px-3 pb-1 text-[11px] font-black uppercase tracking-widest text-amber-400/90">
              {group.groupName}
            </div>
            {group.items.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-black transition-all ${
                    isActive
                      ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/50 border-l-4 border-amber-400'
                      : 'text-slate-100 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <l.icon size={18} className="shrink-0 text-amber-300/90" />
                <span className="truncate">{l.label}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Bottom Sidebar: Admin Profile & Logout */}
      <div className="p-4 border-t border-slate-800 bg-slate-950">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-primary-700 border border-primary-500 flex items-center justify-center text-white text-xs font-black shrink-0 overflow-hidden">
              <User size={16} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-black text-white truncate">{adminEmail || 'Administrator'}</p>
              <p className="text-[10px] text-emerald-400 font-extrabold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Super Admin
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              clearAdminToken();
              window.location.href = '/admin/login';
            }}
            className="p-2 rounded-xl text-slate-300 hover:text-rose-400 hover:bg-rose-500/20 transition-colors"
            title="Sign Out"
            aria-label="Sign Out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    getCurrentAdmin()
      .then((res) => {
        if (res?.user?.email) {
          setAdminEmail(res.user.email);
        }
      })
      .catch(() => {
        clearAdminToken();
        navigate('/admin/login');
      });
  }, [navigate]);

  const handleLogout = () => {
    clearAdminToken();
    navigate('/admin/login');
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/admin/announcements')) return 'Announcements & Events CMS';
    if (path.includes('/admin/admissions')) return 'Admissions Management';
    if (path.includes('/admin/enquiries')) return 'Enquiries Pipeline';
    if (path.includes('/admin/careers/applications')) return 'Career Applications';
    if (path.includes('/admin/careers')) return 'Career Opportunities';
    if (path.includes('/admin/cms')) return 'Website Content Management';
    if (path.includes('/admin/media-library')) return 'Institutional Media Library';
    if (path.includes('/admin/analytics')) return 'Dashboard Configuration';
    if (path.includes('/admin/admin-users')) return 'Admin Accounts';
    if (path.includes('/admin/settings')) return 'System Settings';
    return 'College Overview';
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-secondary-900 antialiased flex">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar adminEmail={adminEmail} />
      </div>

      {/* Mobile Drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-secondary-950/70 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl">
            <Sidebar onCloseMobile={() => setSidebarOpen(false)} adminEmail={adminEmail} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-secondary-600 hover:bg-slate-100 transition-colors"
              aria-label="Open Navigation Menu"
            >
              <Menu size={20} />
            </button>

            <div>
              {/* Breadcrumb */}
              <div className="flex items-center gap-1.5 text-xs text-secondary-500 font-semibold">
                <Link to="/admin/dashboard" className="hover:text-primary-600 transition-colors">Admin Portal</Link>
                <ChevronRight size={12} className="text-secondary-400" />
                <span className="text-secondary-900 font-bold">{getPageTitle()}</span>
              </div>
              <h1 className="text-base font-black text-secondary-900 hidden sm:block tracking-tight">{getPageTitle()}</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs text-secondary-500 w-60 focus-within:ring-2 focus-within:ring-primary-500/20 focus-within:border-primary-500 transition-all">
              <Search size={14} className="text-secondary-400 shrink-0" />
              <input
                type="text"
                placeholder="Search admin portal..."
                className="bg-transparent border-none outline-none text-xs text-secondary-900 w-full placeholder-secondary-400 font-medium"
              />
            </div>

            {/* Notification Bell */}
            <button
              className="p-2 rounded-xl text-secondary-500 hover:text-secondary-800 hover:bg-slate-100 relative transition-colors"
              aria-label="Notifications"
            >
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary-600 ring-2 ring-white" />
            </button>

            <div className="h-6 w-px bg-slate-200 hidden sm:block" />

            {/* Admin Avatar & Role */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2.5 bg-slate-50 border border-slate-200/80 px-3 py-1 rounded-xl">
                <div className="w-6 h-6 rounded-full bg-primary-900 text-white flex items-center justify-center text-xs font-bold">
                  <User size={13} />
                </div>
                <div className="text-left">
                  <span className="block text-xs font-bold text-secondary-900 leading-none truncate max-w-[130px]">
                    {adminEmail ? adminEmail.split('@')[0] : 'Administrator'}
                  </span>
                  <span className="block text-[10px] font-semibold text-emerald-600 leading-tight">Super Admin</span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200/80 transition-colors"
              >
                <LogOut size={14} /> Sign Out
              </button>
            </div>
          </div>
        </header>

        {/* Page Content Outlet */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
