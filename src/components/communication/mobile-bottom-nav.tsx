import { Link, useLocation } from 'react-router-dom';
import { Home, GraduationCap, Images, Phone, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

const items = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: GraduationCap, label: 'Admission', path: '/admission' },
  { icon: Trophy, label: 'Achievements', path: '/achievements' },
  { icon: Images, label: 'Gallery', path: '/gallery' },
  { icon: Phone, label: 'Contact', path: '/contact' },
];

export default function MobileBottomNav() {
  const location = useLocation();
  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-secondary-200"
      style={{
        boxShadow: '0 -4px 20px -2px rgba(0,0,0,0.08)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
      aria-label="Mobile bottom navigation"
    >
      <ul className="flex items-center justify-around h-16">
        {items.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <li key={item.path} className="flex-1 flex justify-center">
              <Link
                to={item.path}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 px-3 py-1.5 rounded-full transition-all duration-250 ease-out',
                  isActive
                    ? 'bg-[#2563EB] text-white scale-105'
                    : 'text-[#475569] hover:text-[#2563EB]',
                )}
                style={{ transition: 'all 250ms ease' }}
                aria-label={item.label}
                aria-current={isActive ? 'page' : undefined}
              >
                <item.icon
                  size={23}
                  style={{ transition: 'transform 250ms ease', transform: isActive ? 'scale(1.05)' : 'scale(1)' }}
                />
                <span className="text-[11px] font-medium leading-none">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
