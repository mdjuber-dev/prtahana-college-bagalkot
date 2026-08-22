import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ApiError, clearAdminToken, getCurrentAdmin } from '@/lib/api';
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
            <span className="block font-extrabold text-sm text-white tracking-tight leading-tight truncate">
              Prarthana PU
            </span>
            <span className="block text-[10px] text-amber-300 font-bold uppercase tracking-[0.12em] leading-tight">
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
      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto custom-scrollbar">
        {navGroups.map((group) => (
          <div key={group.groupName} className="space-y-1">
            <div className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-amber-300">
              {group.groupName}
            </div>
            {group.items.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                onClick={onCloseMobile}
                end={l.to === '/admin/careers'}
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-primary-600 text-white shadow-md shadow-primary-950/40'
                      : 'text-slate-200 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <l.icon
                      size={18}
                      className={`shrink-0 ${isActive ? 'text-white' : 'text-amber-300 group-hover:text-amber-200'}`}
                      aria-hidden="true"
                    />
                    <span className="truncate">{l.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Bottom Sidebar: Admin Profile & Logout */}
      <div className="p-4 border-t border-slate-800 bg-slate-950">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-primary-700 border border-primary-500 flex items-center justify-center text-white shrink-0">
              <User size={16} aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">{adminEmail || 'Administrator'}</p>
              <p className="text-[10px] text-emerald-300 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" aria-hidden="true" /> Signed in
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              clearAdminToken();
              window.location.href = '/admin/login';
            }}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-rose-600 transition-colors"
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

/** Flat, searchable index of every destination in the admin portal. */
const ADMIN_DESTINATIONS: { to: string; label: string; group: string; icon: any }[] = [
  { to: '/admin/dashboard', label: 'Dashboard', group: 'Overview', icon: LayoutDashboard },
  { to: '/admin/announcements', label: 'Announcements', group: 'Content Management', icon: Megaphone },
  { to: '/admin/cms/site-config', label: 'Site CMS', group: 'Content Management', icon: Settings },
  { to: '/admin/media-library', label: 'Media Library', group: 'Content Management', icon: GalleryHorizontal },
  { to: '/admin/admissions', label: 'Admissions', group: 'Admissions & Leads', icon: GraduationCap },
  { to: '/admin/enquiries', label: 'Enquiries', group: 'Admissions & Leads', icon: Inbox },
  { to: '/admin/careers', label: 'Career Jobs', group: 'Careers & HR', icon: Briefcase },
  { to: '/admin/careers/applications', label: 'Applications', group: 'Careers & HR', icon: FileText },
  { to: '/admin/analytics', label: 'Dashboard Config', group: 'System & Config', icon: BarChart3 },
  { to: '/admin/admin-users', label: 'Admin Users', group: 'System & Config', icon: Users },
  { to: '/admin/settings', label: 'Settings', group: 'System & Config', icon: Sliders },
];

/** Working quick-navigation search (replaces the previous non-functional input). */
function AdminQuickSearch() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ADMIN_DESTINATIONS;
    return ADMIN_DESTINATIONS.filter(
      (d) => d.label.toLowerCase().includes(q) || d.group.toLowerCase().includes(q),
    );
  }, [query]);

  useEffect(() => { setHighlight(0); }, [query]);

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const go = (to: string) => {
    navigate(to);
    setQuery('');
    setOpen(false);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setHighlight((i) => Math.min(i + 1, results.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setHighlight((i) => Math.max(i - 1, 0));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      if (results[highlight]) go(results[highlight].to);
    } else if (event.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative hidden md:block">
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 border border-slate-300 w-64 focus-within:ring-2 focus-within:ring-primary-500/30 focus-within:border-primary-600 transition-all">
        <Search size={14} className="text-slate-600 shrink-0" aria-hidden="true" />
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Search admin portal…"
          aria-label="Search admin portal"
          role="combobox"
          aria-expanded={open}
          aria-controls="admin-quick-search-results"
          className="bg-transparent border-none outline-none text-xs text-slate-900 w-full placeholder-slate-500 font-medium"
        />
      </div>

      {open && (
        <ul
          id="admin-quick-search-results"
          role="listbox"
          className="absolute right-0 mt-2 w-72 max-h-80 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl z-50"
        >
          {results.length === 0 && (
            <li className="px-3 py-2.5 text-xs font-medium text-slate-600">No matching admin section.</li>
          )}
          {results.map((d, index) => (
            <li key={d.to} role="option" aria-selected={index === highlight}>
              <button
                type="button"
                onMouseEnter={() => setHighlight(index)}
                onClick={() => go(d.to)}
                className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left transition-colors ${
                  index === highlight ? 'bg-primary-50' : 'hover:bg-slate-50'
                }`}
              >
                <d.icon size={15} className="shrink-0 text-primary-700" aria-hidden="true" />
                <span className="text-xs font-bold text-slate-900">{d.label}</span>
                <span className="ml-auto text-[10px] font-semibold text-slate-500">{d.group}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    getCurrentAdmin()
      .then((res) => {
        if (mounted && res?.user?.email) setAdminEmail(res.user.email);
      })
      .catch((err) => {
        // Only a rejected session signs the admin out. Network/5xx failures are
        // transient and must not destroy a valid token.
        const status = err instanceof ApiError ? err.status : -1;
        if (status === 401 || status === 403) {
          clearAdminToken();
          navigate('/admin/login');
        } else {
          console.error('AdminLayout could not load the admin profile:', err);
        }
      });
    return () => { mounted = false; };
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
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Open Navigation Menu"
            >
              <Menu size={20} />
            </button>

            <div className="min-w-0">
              {/* Breadcrumb */}
              <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                <Link to="/admin/dashboard" className="hover:text-primary-700 transition-colors">Admin Portal</Link>
                <ChevronRight size={12} className="text-slate-500" aria-hidden="true" />
                <span className="text-slate-900 font-bold truncate">{getPageTitle()}</span>
              </nav>
              <h1 className="text-base font-extrabold text-slate-900 hidden sm:block tracking-tight truncate">
                {getPageTitle()}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Working quick-navigation search */}
            <AdminQuickSearch />

            {/* Announcements shortcut (previously a non-functional bell) */}
            <Link
              to="/admin/announcements"
              className="p-2 rounded-xl text-slate-600 hover:text-primary-800 hover:bg-slate-100 transition-colors"
              title="Manage announcements"
              aria-label="Manage announcements"
            >
              <Bell size={18} />
            </Link>

            <div className="h-6 w-px bg-slate-200 hidden sm:block" aria-hidden="true" />

            {/* Admin Avatar & Role */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
                <div className="w-6 h-6 rounded-full bg-primary-900 text-white flex items-center justify-center">
                  <User size={13} aria-hidden="true" />
                </div>
                <div className="text-left">
                  <span className="block text-xs font-bold text-slate-900 leading-tight truncate max-w-[130px]">
                    {adminEmail ? adminEmail.split('@')[0] : 'Administrator'}
                  </span>
                  <span className="block text-[10px] font-semibold text-emerald-700 leading-tight">Signed in</span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
              >
                <LogOut size={14} aria-hidden="true" />
                <span className="hidden sm:inline">Sign Out</span>
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
