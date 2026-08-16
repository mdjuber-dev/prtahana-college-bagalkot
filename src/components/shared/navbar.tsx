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
  const navItemsWithCareers = cms.navItems.some((item) => item.path === '/careers')
    ? cms.navItems
    : [...cms.navItems, { label: 'Careers', path: '/careers' }];
  const navOrder = ['/', '/about', '/courses', '/achievements', '/gallery', '/fee-structure', '/transport', '/contact', '/careers'];
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
      <nav className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 2xl:px-8" aria-label="Main navigation">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo + Name — properly centered vertically */}
          <Link to="/" className="flex items-center gap-3 shrink-0" aria-label={`${config.name} home`}>
            <div className="relative">
              <img
                src={getMediaUrl(config.logo)}
                alt={`${config.name} logo`}
                className="w-10 h-10 md:w-12 md:h-12 object-contain shrink-0 rounded-full bg-white/40 backdrop-blur-sm p-0.5 border border-white/60 shadow-sm"
                width={48}
                height={48}
              />
            </div>
            <div className="flex flex-col justify-center leading-tight">
              <span className={cn(
                'text-xs md:text-sm font-extrabold transition-colors duration-300',
                scrolled || location.pathname !== '/' ? 'text-primary-900' : 'text-primary-900'
              )}>
                {config.shortName?.split(' ')[0] || 'Prarthana'} PU Science College
              </span>
              <span className={cn(
                'text-[10px] md:text-xs font-medium transition-colors duration-300',
                scrolled || location.pathname !== '/' ? 'text-secondary-500' : 'text-primary-700/70'
              )}>
                Bagalkot, Karnataka
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden xl:flex min-w-0 flex-1 items-center justify-end gap-3 2xl:gap-6 pl-4 2xl:pl-6">
            <ul className="flex min-w-0 items-center justify-center gap-[clamp(0.625rem,0.9vw,1.25rem)]">
              {items.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={cn(
                      'relative whitespace-nowrap px-2.5 py-2 text-sm font-semibold rounded-xl transition-all duration-300 2xl:px-3.5 2xl:py-2.5',
                      location.pathname === item.path
                        ? 'text-accent-600 bg-white/80 shadow-sm border border-primary-100/50'
                        : 'text-primary-800 hover:text-primary-900 hover:bg-white/50'
                    )}
                    aria-current={location.pathname === item.path ? 'page' : undefined}
                  >
                    {item.label}
                    {location.pathname === item.path && (
                      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent-500" />
                    )}
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              to="/admission"
              className="inline-flex h-[60px] w-[112px] shrink-0 items-center justify-center gap-1.5 rounded-2xl text-sm font-bold text-white bg-gradient-accent hover:shadow-xl hover:shadow-accent-500/30 transition-all duration-300 hover:-translate-y-0.5 border border-accent-400/20"
            >
              Apply Now <ArrowRight size={16} />
            </Link>
          </div>

          {/* Hamburger — aligned properly */}
          <button
            className="xl:hidden p-2 -mr-2 rounded-xl text-primary-800 hover:bg-white/60 transition-colors flex items-center justify-center"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
          >
            {mobileOpen ? <X size={24} strokeWidth={2.2} /> : <Menu size={24} strokeWidth={2.2} />}
          </button>
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
            <ul className="px-4 py-5 space-y-1 max-h-[calc(100vh-5rem)] overflow-y-auto">
              {items.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={cn(
                      'block px-4 py-3.5 text-base font-semibold rounded-2xl transition-all duration-200',
                      location.pathname === item.path
                        ? 'text-accent-600 bg-accent-50 border border-accent-100'
                        : 'text-primary-800 hover:text-primary-900 hover:bg-primary-50'
                    )}
                    aria-current={location.pathname === item.path ? 'page' : undefined}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li className="pt-3 mt-3 border-t border-primary-100/60">
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
