import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  label?: string;
  icon: LucideIcon;
  colorScheme?: 'primary' | 'emerald' | 'amber' | 'blue' | 'purple' | 'indigo' | 'rose';
  onClick?: () => void;
  trend?: string;
}

const colorMap = {
  primary: {
    bg: 'bg-white',
    border: 'border-slate-200',
    iconBg: 'bg-primary-100 text-primary-800',
    val: 'text-slate-950',
    label: 'text-primary-800 font-semibold',
  },
  emerald: {
    bg: 'bg-white',
    border: 'border-slate-200',
    iconBg: 'bg-emerald-100 text-emerald-800',
    val: 'text-slate-950',
    label: 'text-emerald-800 font-semibold',
  },
  amber: {
    bg: 'bg-white',
    border: 'border-slate-200',
    iconBg: 'bg-amber-100 text-amber-900',
    val: 'text-slate-950',
    label: 'text-amber-900 font-semibold',
  },
  blue: {
    bg: 'bg-white',
    border: 'border-slate-200',
    iconBg: 'bg-blue-100 text-blue-800',
    val: 'text-slate-950',
    label: 'text-blue-800 font-semibold',
  },
  purple: {
    bg: 'bg-white',
    border: 'border-slate-200',
    iconBg: 'bg-purple-100 text-purple-800',
    val: 'text-slate-950',
    label: 'text-purple-800 font-semibold',
  },
  indigo: {
    bg: 'bg-white',
    border: 'border-slate-200',
    iconBg: 'bg-indigo-100 text-indigo-800',
    val: 'text-slate-950',
    label: 'text-indigo-800 font-semibold',
  },
  rose: {
    bg: 'bg-white',
    border: 'border-slate-200',
    iconBg: 'bg-rose-100 text-rose-800',
    val: 'text-slate-950',
    label: 'text-rose-800 font-semibold',
  },
};

export default function StatCard({
  title,
  value,
  label,
  icon: Icon,
  colorScheme = 'primary',
  onClick,
  trend,
}: StatCardProps) {
  const scheme = colorMap[colorScheme] || colorMap.primary;

  const content = (
    <>
      <div className="flex items-center justify-between gap-3">
        <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">{title}</span>
        <div className={`w-9 h-9 rounded-xl ${scheme.iconBg} flex items-center justify-center shrink-0`}>
          <Icon size={18} aria-hidden="true" />
        </div>
      </div>
      <p className={`text-2xl font-extrabold ${scheme.val} mt-2.5 tracking-tight`}>{value}</p>
      {label && <p className={`text-[11px] ${scheme.label} mt-1`}>{label}</p>}
      {trend && <p className="text-[10px] text-slate-600 font-semibold mt-0.5">{trend}</p>}
    </>
  );

  const baseClasses = `${scheme.bg} p-5 rounded-2xl border ${scheme.border} shadow-sm transition-all duration-200`;

  // Render an actual button when interactive so the card is keyboard accessible.
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`${baseClasses} w-full text-left hover:shadow-md hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2`}
      >
        {content}
      </button>
    );
  }

  return <div className={baseClasses}>{content}</div>;
}
