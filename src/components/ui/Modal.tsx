import React, { useEffect, useRef } from 'react';
import { cn } from '../../lib/utils';
import { Icon, type IconName } from './Icons';

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  icon,
  children,
  footer,
  size = 'md',
  closeOnBackdrop = true,
}: {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: string;
  icon?: IconName;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeOnBackdrop?: boolean;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  const widths = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={typeof title === 'string' ? title : 'Dialog'}
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={closeOnBackdrop ? onClose : undefined}
      />
      <div
        ref={panelRef}
        className={cn(
          'relative w-full rounded-t-2xl sm:rounded-2xl border border-border bg-surface shadow-[var(--shadow-lg)] animate-scale-in flex flex-col max-h-[92vh]',
          widths[size]
        )}
      >
        {title !== undefined ? (
          <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
            <div className="flex items-center gap-3">
              {icon ? (
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500/10 text-brand-500">
                  <Icon name={icon} size={18} />
                </div>
              ) : null}
              <div>
                <h2 className="text-base font-semibold text-text">{title}</h2>
                {subtitle ? <p className="mt-0.5 text-xs text-muted">{subtitle}</p> : null}
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              className="rounded-lg p-1.5 text-soft hover:bg-elevated hover:text-text"
            >
              <Icon name="x" size={18} />
            </button>
          </div>
        ) : null}
        <div className="overflow-y-auto px-5 py-4">{children}</div>
        {footer ? <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-3">{footer}</div> : null}
      </div>
    </div>
  );
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Delete',
  danger = true,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
}) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <p className="text-sm text-muted">{message}</p>
      <div className="mt-5 flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="h-9 rounded-lg border border-border px-4 text-sm font-medium text-text hover:bg-elevated"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => {
            onConfirm();
            onClose();
          }}
          className={cn(
            'h-9 rounded-lg px-4 text-sm font-medium text-white hover:opacity-90',
            danger ? 'bg-danger' : 'bg-brand-500'
          )}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}