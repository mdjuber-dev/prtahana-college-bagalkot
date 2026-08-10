import { Link, NavLink, Outlet } from 'react-router-dom';
import { useState } from 'react';
import { supabase } from '@/lib/supabase-config';
import {
  BarChart3, BookOpen, Building2, FileText, GalleryHorizontal, GraduationCap,
  Home, Inbox, LayoutDashboard, LogOut, Menu, MessageSquare,
  Settings, Trophy, Users, X,
} from 'lucide-react';

function Sidebar() {
  const links = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/admissions', label: 'Admissions', icon: GraduationCap },
    { to: '/admin/enquiries', label: 'Enquiries', icon: Inbox },
    { to: '/admin/cms/site-config', label: 'Website CMS', icon: Settings },
    { to: '/admin/cms/site-config#home', label: 'Home Page', icon: Home },
    { to: '/admin/cms/site-config#about', label: 'About College', icon: Building2 },
    { to: '/admin/cms/site-config#courses', label: 'Courses', icon: BookOpen },
    { to: '/admin/cms/site-config#fees', label: 'Fee Structure', icon: FileText },
    { to: '/admin/cms/site-config#achievements', label: 'Achievements', icon: Trophy },
    { to: '/admin/cms/site-config#gallery', label: 'Gallery', icon: GalleryHorizontal },
    { to: '/admin/cms/site-config#transport', label: 'Transport', icon: Building2 },
    { to: '/admin/cms/site-config#hostel', label: 'Hostel', icon: Building2 },
    { to: '/admin/cms/site-config#pamphlet', label: 'Pamphlet', icon: FileText },
    { to: '/admin/cms/site-config#leadership', label: 'Leadership', icon: Users },
    { to: '/admin/cms/site-config#contact', label: 'Contact Information', icon: MessageSquare },
    { to: '/admin/cms/site-config#chatbot', label: 'Chatbot', icon: MessageSquare },
    { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
    { to: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-72 bg-primary-950 text-white border-r border-primary-900 h-screen sticky top-0 overflow-y-auto">
      <div className="p-4 border-b">
        <Link to="/" className="font-bold text-lg">Prarthana CMS</Link>
        <p className="text-xs text-primary-200">Secure website control</p>
      </div>
      <nav className="p-4 space-y-1">
        {links.map((l) => (
          <NavLink key={l.to} to={l.to} className={({ isActive }) => `flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${isActive ? 'bg-white text-primary-950 font-semibold' : 'text-primary-100 hover:bg-primary-900'}`}>
            <l.icon size={16} />
            <span>{l.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await supabase?.auth.signOut();
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <div className="hidden md:block"><Sidebar /></div>
        {sidebarOpen && (
          <div className="fixed inset-0 z-[100] md:hidden">
            <button className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} aria-label="Close admin menu" />
            <div className="relative w-72 max-w-[85vw]">
              <button className="absolute top-3 right-3 z-10 text-white" onClick={() => setSidebarOpen(false)} aria-label="Close admin menu"><X size={20} /></button>
              <Sidebar />
            </div>
          </div>
        )}
        <div className="flex-1">
          <header className="flex items-center justify-between p-4 bg-white border-b">
            <div className="flex items-center gap-3">
              <button className="md:hidden p-2 border rounded-lg" onClick={() => setSidebarOpen((s) => !s)} aria-label="Open admin menu"><Menu size={18} /></button>
              <h1 className="text-lg font-semibold">Admin Dashboard</h1>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={handleLogout} className="inline-flex items-center gap-2 px-3 py-2 border rounded-lg text-sm font-semibold"><LogOut size={16} />Logout</button>
            </div>
          </header>

          <main className="p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
