import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCMS } from '@/lib/cms-context';
import { cn } from '@/lib/utils';
import { getMediaUrl } from '@/lib/media-url';

export default function Navbar() {
  const cms = useCMS();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const config = cms.siteConfig;
  const navItemsWithAnnouncements = cms.navItems.some((item) => item.path === '/announcements')
    ? cms.navItems
    : [...cms.navItems, { label: 'Announcements', path: '/announcements' }];
  const navItemsWithCareers = navItemsWithAnnouncements.some((item) => item.path === '/careers')
    ? navItemsWithAnnouncements
    : [...navItemsWithAnnouncements, { label: 'Careers', path: '/careers' }];
  const navOrder = ['/', '/about', '/courses', '/achievements', '/announcements', '/gallery', '/fee-structure', '/transport', '/contact', '/careers'];
  const items = navItemsWithCareers
    .filter((item) => item.path !== '/admission')
    .sort((a, b) => {
      const aIndex = navOrder.indexOf(a.path);
      const bIndex = navOrder.indexOf(b.path);
      return (aIndex === -1 ? navOrder.length : aIndex) - (bIndex === -1 ? navOrder.length : bIndex);
    });

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out',
        scrolled
          ? 'glass-scrolled shadow-soft'
          : location.pathname === '/'
            ? 'glass'
            : 'glass-scrolled shadow-soft'
      )}
    >
      <nav className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 2xl:px-8" aria-label="Main navigation">
        <div className="flex items-center justify-between gap-2 h-16 md:h-[72px] xl:h-20">
          {/* Logo + Name — vertically centred, never shrinks below legibility */}
          <Link to="/" className="flex min-w-0 items-center gap-2.5 shrink-0" aria-label={`${config.name} home`}>
            <img
              src={getMediaUrl(config.logo)}
              alt={`${config.name} logo`}
              className="w-10 h-10 md:w-11 md:h-11 object-contain shrink-0 rounded-full bg-white/60 p-0.5 border border-white/70 shadow-sm"
              width={44}
              height={44}
            />
            <div className="flex min-w-0 flex-col justify-center leading-tight">
              <span className="truncate text-[13px] sm:text-sm xl:text-[13px] 2xl:text-sm font-extrabold text-primary-900">
                {config.shortName?.split(' ')[0] || 'Prarthana'} PU Science College
              </span>
              <span className="truncate text-[10px] xl:text-[10px] 2xl:text-[11px] font-semibold text-secondary-600">
                Bagalkot, Karnataka
              </span>
            </div>
          </Link>

          {/* Desktop nav — fluid type/spacing keeps all 10 links + Apply Now on one
              row from 1280px upward without overlap, clipping or wrapping. */}
          <div className="hidden xl:flex min-w-0 flex-1 items-center justify-end gap-3 2xl:gap-4 pl-3 2xl:pl-5">
            <ul className="flex min-w-0 items-center gap-[clamp(0.125rem,0.55vw,0.5rem)]">
              {items.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <li key={item.path} className="shrink-0">
                    <Link
                      to={item.path}
                      className={cn(
                        'relative flex items-center whitespace-nowrap rounded-xl font-semibold transition-colors duration-200',
                        'text-[clamp(0.75rem,0.92vw,0.875rem)] px-[clamp(0.375rem,0.6vw,0.625rem)] py-2',
                        isActive
                          ? 'text-accent-700 bg-white shadow-sm ring-1 ring-primary-100'
                          : 'text-primary-800 hover:text-primary-950 hover:bg-white/70',
                      )}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      {item.label}
                      {item.path === '/announcements' && (
                        <span
                          className="ml-1 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-500 ring-2 ring-accent-500/25"
                          aria-label="New announcements available"
                          role="status"
                        />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
            <Link
              to="/admission"
              className="inline-flex h-10 2xl:h-11 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl px-[clamp(0.75rem,1vw,1.125rem)] text-[clamp(0.75rem,0.9vw,0.875rem)] font-bold text-white bg-gradient-accent shadow-md shadow-accent-500/20 transition-all duration-200 hover:shadow-lg hover:shadow-accent-500/30 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2"
            >
              Apply Now <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>

          {/* Mobile / tablet: compact Apply Now + hamburger */}
          <div className="flex items-center gap-2 xl:hidden">
            <Link
              to="/admission"
              className="hidden sm:inline-flex h-9 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl px-3.5 text-xs font-bold text-white bg-gradient-accent shadow-sm transition-shadow hover:shadow-md"
            >
              Apply Now <ArrowRight size={14} aria-hidden="true" />
            </Link>
            <button
              className="p-2 -mr-1 rounded-xl text-primary-900 hover:bg-white/70 transition-colors flex items-center justify-center"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
            >
              {mobileOpen ? <X size={24} strokeWidth={2.2} /> : <Menu size={24} strokeWidth={2.2} />}
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="xl:hidden glass-mobile border-t border-primary-100/60 overflow-hidden shadow-soft"
          >
            <ul className="px-4 py-5 space-y-1 max-h-[calc(100vh-4rem)] overflow-y-auto overscroll-contain">
              {items.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={cn(
                        'flex items-center justify-between px-4 py-3.5 text-base font-semibold rounded-2xl transition-colors duration-200',
                        isActive
                          ? 'text-accent-700 bg-accent-50 ring-1 ring-accent-200'
                          : 'text-primary-900 hover:bg-primary-50',
                      )}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <span>{item.label}</span>
                      {item.path === '/announcements' && (
                        <span
                          className="h-2 w-2 shrink-0 rounded-full bg-accent-500 ring-2 ring-accent-500/25"
                          aria-label="New announcements available"
                          role="status"
                        />
                      )}
                    </Link>
                  </li>
                );
              })}
              <li className="pt-3 mt-3 border-t border-primary-100">
                <Link
                  to="/admission"
                  className="block px-5 py-4 rounded-2xl text-base font-extrabold text-center text-white bg-gradient-accent shadow-lg shadow-accent-500/30"
                >
                  Apply for Admission →
                </Link>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
