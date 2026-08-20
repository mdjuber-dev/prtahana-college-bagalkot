
export type StatusType =
  | 'submitted' | 'pending' | 'new' | 'under review' | 'approved' | 'enrolled'
  | 'rejected' | 'closed' | 'published' | 'draft' | 'archived' | 'active'
  | string;

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
  size?: 'sm' | 'md';
}

export default function StatusBadge({ status, className = '', size = 'md' }: StatusBadgeProps) {
  const normalized = String(status || '').toLowerCase().trim();

  let colors = 'bg-slate-100 text-slate-700 border-slate-200';
  let dotColor = 'bg-slate-400';

  if (['submitted', 'pending', 'new', 'under review', 'draft'].includes(normalized)) {
    colors = 'bg-amber-50 text-amber-700 border-amber-200/80';
    dotColor = 'bg-amber-500';
  } else if (['approved', 'enrolled', 'published', 'active'].includes(normalized)) {
    colors = 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
    dotColor = 'bg-emerald-500';
  } else if (['rejected', 'closed', 'archived'].includes(normalized)) {
    colors = 'bg-rose-50 text-rose-700 border-rose-200/80';
    dotColor = 'bg-rose-500';
  } else if (['contacted', 'in touch', 'reviewed'].includes(normalized)) {
    colors = 'bg-sky-50 text-sky-700 border-sky-200/80';
    dotColor = 'bg-sky-500';
  }

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span className={`inline-flex items-center gap-1.5 font-bold rounded-full border capitalize whitespace-nowrap ${sizeClasses} ${colors} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      <span>{status || 'Unknown'}</span>
    </span>
  );
}
