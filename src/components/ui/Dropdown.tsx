import React, { useEffect, useRef, useState } from 'react';
import { cn } from '../../lib/utils';
import { Icon, type IconName } from './Icons';

export interface MenuItem {
  label?: string;
  icon?: IconName;
  onClick?: () => void;
  danger?: boolean;
  divider?: boolean;
  disabled?: boolean;
}

export function Dropdown({
  trigger,
  items,
  align = 'right',
  width = 'w-52',
}: {
  trigger: React.ReactNode;
  items: MenuItem[];
  align?: 'left' | 'right';
  width?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('keydown', keyHandler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('keydown', keyHandler);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <div onClick={() => setOpen((v) => !v)}>{trigger}</div>
      {open ? (
        <div
          className={cn(
            'absolute z-40 mt-1 overflow-hidden rounded-xl border border-border bg-surface py-1 shadow-[var(--shadow-lg)] animate-scale-in',
            align === 'right' ? 'right-0' : 'left-0',
            width
          )}
          role="menu"
        >
          {items.map((item, i) =>
            item.divider ? (
              <div key={i} className="my-1 border-t border-border" />
            ) : (
              <button
                key={i}
                type="button"
                role="menuitem"
                disabled={item.disabled}
                onClick={() => {
                  setOpen(false);
                  item.onClick?.();
                }}
                className={cn(
                  'flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors',
                  item.danger ? 'text-danger hover:bg-danger/10' : 'text-text hover:bg-elevated',
                  item.disabled && 'cursor-not-allowed opacity-40'
                )}
              >
                {item.icon ? <Icon name={item.icon} size={15} className="text-soft" /> : null}
                {item.label}
              </button>
            )
          )}
        </div>
      ) : null}
    </div>
  );
}