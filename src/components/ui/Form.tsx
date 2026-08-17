import React from 'react';
import { cn } from '../../lib/utils';
import { Icon, type IconName } from './Icons';

const baseField =
  'w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-soft transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:opacity-50';

export function Field({
  label,
  hint,
  error,
  required,
  children,
  className,
  htmlFor,
}: {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
  htmlFor?: string;
}) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label ? (
        <label htmlFor={htmlFor} className="text-sm font-medium text-text">
          {label}
          {required ? <span className="ml-0.5 text-danger">*</span> : null}
        </label>
      ) : null}
      {children}
      {error ? <p className="text-xs text-danger">{error}</p> : hint ? <p className="text-xs text-soft">{hint}</p> : null}
    </div>
  );
}

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { error?: boolean }
>(({ className, error, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(baseField, error && 'border-danger focus:ring-danger/20', className)}
    {...props}
  />
));
Input.displayName = 'Input';

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: boolean }
>(({ className, error, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(baseField, 'min-h-[90px] resize-y leading-relaxed', error && 'border-danger focus:ring-danger/20', className)}
    {...props}
  />
));
Textarea.displayName = 'Textarea';

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement> & { error?: boolean }
>(({ className, error, children, ...props }, ref) => (
  <div className="relative">
    <select
      ref={ref}
      className={cn(baseField, 'appearance-none pr-9 cursor-pointer', error && 'border-danger focus:ring-danger/20', className)}
      {...props}
    >
      {children}
    </select>
    <Icon name="chevron-down" size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-soft" />
  </div>
));
Select.displayName = 'Select';

export function Toggle({
  checked,
  onChange,
  label,
  description,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
}) {
  return (
    <label className={cn('flex cursor-pointer items-center justify-between gap-4 py-1', disabled && 'opacity-50 cursor-not-allowed')}>
      <span>
        <span className="block text-sm font-medium text-text">{label}</span>
        {description ? <span className="block text-xs text-soft">{description}</span> : null}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative h-6 w-11 shrink-0 rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-brand-500',
          checked ? 'bg-brand-500' : 'bg-soft/50'
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
            checked && 'translate-x-5'
          )}
        />
      </button>
    </label>
  );
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'Search…',
  icon = 'search',
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  icon?: IconName;
  className?: string;
}) {
  return (
    <div className={cn('relative', className)}>
      <Icon name={icon} size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-soft" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(baseField, 'pl-9')}
        aria-label={placeholder}
      />
      {value ? (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => onChange('')}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-soft hover:text-text"
        >
          <Icon name="x" size={14} />
        </button>
      ) : null}
    </div>
  );
}