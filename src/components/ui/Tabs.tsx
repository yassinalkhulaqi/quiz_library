import { cn } from '../../lib/utils';

export function Tabs({
  tabs,
  active,
  onChange,
  className,
}: {
  tabs: { id: string; label: string; count?: number }[];
  active: string;
  onChange: (id: string) => void;
  className?: string;
}) {
  return (
    <div
      className={cn('flex items-center gap-1 overflow-x-auto rounded-lg border border-border bg-surface p-1', className)}
      role="tablist"
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={active === tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            'inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
            active === tab.id ? 'bg-brand-500 text-white shadow-sm' : 'text-muted hover:text-text hover:bg-elevated'
          )}
        >
          {tab.label}
          {tab.count !== undefined ? (
            <span
              className={cn(
                'rounded-full px-1.5 py-0.5 text-[10px] font-semibold',
                active === tab.id ? 'bg-white/20 text-white' : 'bg-elevated text-muted'
              )}
            >
              {tab.count}
            </span>
          ) : null}
        </button>
      ))}
    </div>
  );
}