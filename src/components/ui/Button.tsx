import React from 'react';
import { cn } from '../../lib/utils';
import { Icon, type IconName } from './Icons';
import { Spinner } from './Spinner';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline' | 'accent';
type Size = 'xs' | 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: IconName;
  iconRight?: IconName;
  fullWidth?: boolean;
}

const variants: Record<Variant, string> = {
  primary:
    'bg-brand-500 text-white hover:bg-brand-600 active:bg-brand-700 shadow-[0_1px_2px_rgba(99,102,241,0.4)] disabled:bg-brand-500/50',
  accent:
    'bg-accent-500 text-white hover:bg-accent-600 shadow-[0_1px_2px_rgba(20,184,166,0.4)]',
  secondary: 'bg-elevated text-text hover:bg-border/60 border border-border',
  ghost: 'text-muted hover:text-text hover:bg-elevated',
  outline: 'border border-border text-text hover:border-brand-400 hover:text-brand-500 bg-transparent',
  danger: 'bg-danger text-white hover:opacity-90',
};

const sizes: Record<Size, string> = {
  xs: 'h-7 px-2.5 text-xs gap-1.5',
  sm: 'h-8 px-3 text-sm gap-1.5',
  md: 'h-9 px-4 text-sm gap-2',
  lg: 'h-11 px-5 text-base gap-2',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, icon, iconRight, fullWidth, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-150 select-none',
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500',
          'disabled:cursor-not-allowed active:scale-[0.98]',
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {loading ? <Spinner size={16} /> : icon ? <Icon name={icon} size={size === 'sm' ? 14 : 16} /> : null}
        {children}
        {iconRight && !loading ? <Icon name={iconRight} size={size === 'sm' ? 14 : 16} /> : null}
      </button>
    );
  }
);
Button.displayName = 'Button';

export function IconButton({
  icon,
  label,
  onClick,
  className,
  active,
  badge,
  size = 18,
  disabled,
}: {
  icon: IconName;
  label: string;
  onClick?: () => void;
  className?: string;
  active?: boolean;
  badge?: number;
  size?: number;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'relative inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted transition-colors',
        'hover:bg-elevated hover:text-text active:scale-95',
        active && 'bg-elevated text-brand-500',
        disabled && 'opacity-40 cursor-not-allowed',
        className
      )}
    >
      <Icon name={icon} size={size} />
      {badge !== undefined && badge > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-500 px-1 text-[10px] font-bold text-white">
          {badge > 9 ? '9+' : badge}
        </span>
      )}
    </button>
  );
}