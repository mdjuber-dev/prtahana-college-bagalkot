import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface AdminPageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  badge?: string;
  actions?: ReactNode;
}

export default function AdminPageHeader({
  title,
  subtitle,
  icon: Icon,
  badge,
  actions,
}: AdminPageHeaderProps) {
  return (
    <div className="bg-white p-6 md:p-8 rounded-3xl text-secondary-900 shadow-xs relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-200/90">
      <div className="relative z-10 max-w-2xl">
        {badge && (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 border border-primary-200/80 text-primary-800 text-[11px] font-black uppercase tracking-wider mb-3">
            {Icon && <Icon size={13} className="text-primary-700" />}
            <span>{badge}</span>
          </div>
        )}
        <h1 className="text-2xl md:text-3xl font-black text-secondary-950 tracking-tight flex items-center gap-3">
          {!badge && Icon && <Icon size={26} className="text-primary-700 shrink-0" />}
          <span>{title}</span>
        </h1>
        {subtitle && <p className="text-secondary-700 text-xs md:text-sm mt-2 leading-relaxed font-medium">{subtitle}</p>}
      </div>

      {actions && <div className="relative z-10 flex items-center gap-3 shrink-0">{actions}</div>}
    </div>
  );
}
