import React from 'react';
import { cn } from '../../lib/utils';

export function Avatar({
  name,
  color,
  size = 36,
  className,
}: {
  name: string;
  color: string;
  size?: number;
  className?: string;
}) {
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <span
      className={cn('inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white', className)}
      style={{ width: size, height: size, backgroundColor: color, fontSize: size * 0.38 }}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
}

export function ProgressBar({
  value,
  max = 100,
  color,
  size = 'md',
  className,
}: {
  value: number;
  max?: number;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const height = size === 'sm' ? 'h-1.5' : size === 'md' ? 'h-2' : 'h-2.5';
  return (
    <div className={cn('w-full overflow-hidden rounded-full bg-elevated', height, className)} role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
      <div
        className={cn('h-full rounded-full transition-all duration-500', !color && 'bg-brand-500')}
        style={color ? { width: `${pct}%`, backgroundColor: color } : { width: `${pct}%` }}
      />
    </div>
  );
}

export function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded border border-border bg-elevated px-1.5 font-mono text-[11px] font-medium text-muted">
      {children}
    </kbd>
  );
}