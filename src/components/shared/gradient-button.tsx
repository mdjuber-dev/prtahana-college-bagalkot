import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'white';
type Size = 'sm' | 'md' | 'lg';

interface GradientButtonProps {
  children: React.ReactNode; variant?: Variant; size?: Size;
  to?: string; href?: string; onClick?: () => void; type?: 'button' | 'submit';
  className?: string; disabled?: boolean; ariaLabel?: string;
}

const variants: Record<Variant, string> = {
  primary: 'bg-gradient-primary text-white hover:shadow-glow',
  secondary: 'bg-secondary-800 text-white hover:bg-secondary-700',
  accent: 'bg-gradient-accent text-white hover:shadow-glow',
  outline: 'border-2 border-primary-600 text-primary-700 hover:bg-primary-50',
  ghost: 'text-primary-700 hover:bg-primary-50',
  white: 'bg-white text-primary-700 hover:bg-secondary-50 shadow-soft',
};
const sizes: Record<Size, string> = { sm: 'px-4 py-2 text-sm', md: 'px-6 py-3 text-base', lg: 'px-8 py-4 text-lg' };

const GradientButton = forwardRef<HTMLButtonElement, GradientButtonProps>(
  ({ children, variant = 'primary', size = 'md', to, href, onClick, type = 'button', className, disabled, ariaLabel }, ref) => {
    const baseClass = cn(
      'relative inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-300 overflow-hidden group',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      variants[variant], sizes[size], className
    );
    const shimmer = <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-white/20 to-transparent" />;
    if (to) return <Link to={to} className={baseClass} aria-label={ariaLabel}>{shimmer}<span className="relative z-10">{children}</span></Link>;
    if (href) return <a href={href} className={baseClass} aria-label={ariaLabel} target={href.startsWith('http') ? '_blank' : undefined} rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}>{shimmer}<span className="relative z-10">{children}</span></a>;
    return <button ref={ref} type={type} onClick={onClick} disabled={disabled} className={baseClass} aria-label={ariaLabel}>{shimmer}<span className="relative z-10">{children}</span></button>;
  }
);
GradientButton.displayName = 'GradientButton';
export default GradientButton;
