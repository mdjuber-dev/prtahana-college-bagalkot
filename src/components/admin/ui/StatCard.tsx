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
    label: 'text-primary-800 font-bold',
  },
  emerald: {
    bg: 'bg-white',
    border: 'border-slate-200',
    iconBg: 'bg-emerald-100 text-emerald-800',
    val: 'text-slate-950',
    label: 'text-emerald-800 font-bold',
  },
  amber: {
    bg: 'bg-white',
    border: 'border-slate-200',
    iconBg: 'bg-amber-100 text-amber-900',
    val: 'text-slate-950',
    label: 'text-amber-900 font-bold',
  },
  blue: {
    bg: 'bg-white',
    border: 'border-slate-200',
    iconBg: 'bg-blue-100 text-blue-800',
    val: 'text-slate-950',
    label: 'text-blue-800 font-bold',
  },
  purple: {
    bg: 'bg-white',
    border: 'border-slate-200',
    iconBg: 'bg-purple-100 text-purple-800',
    val: 'text-slate-950',
    label: 'text-purple-800 font-bold',
  },
  indigo: {
    bg: 'bg-white',
    border: 'border-slate-200',
    iconBg: 'bg-indigo-100 text-indigo-800',
    val: 'text-slate-950',
    label: 'text-indigo-800 font-bold',
  },
  rose: {
    bg: 'bg-white',
    border: 'border-slate-200',
    iconBg: 'bg-rose-100 text-rose-800',
    val: 'text-slate-950',
    label: 'text-rose-800 font-bold',
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

  return (
    <div
      onClick={onClick}
      className={`${scheme.bg} p-5 rounded-2xl border ${scheme.border} shadow-sm hover:shadow-md transition-all duration-300 ${
        onClick ? 'cursor-pointer hover:-translate-y-0.5' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-black text-slate-700 uppercase tracking-wider">{title}</span>
        <div className={`w-9 h-9 rounded-xl ${scheme.iconBg} flex items-center justify-center shrink-0`}>
          <Icon size={18} />
        </div>
      </div>
      <p className={`text-2xl font-black ${scheme.val} mt-2.5 tracking-tight`}>{value}</p>
      {label && <p className={`text-[11px] ${scheme.label} font-extrabold mt-1`}>{label}</p>}
      {trend && <p className="text-[10px] text-slate-600 font-bold mt-0.5">{trend}</p>}
    </div>
  );
}
