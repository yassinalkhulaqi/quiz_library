import { useApp } from '../../context/AppContext';
import { Icon, type IconName } from './Icons';

const styles: Record<string, { icon: IconName; className: string }> = {
  success: { icon: 'check', className: 'text-success' },
  error: { icon: 'alert', className: 'text-danger' },
  info: { icon: 'info', className: 'text-info' },
  warning: { icon: 'warning', className: 'text-warning' },
};

export function Toaster() {
  const { toasts, dismissToast } = useApp();
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-[min(92vw,380px)] flex-col gap-2" aria-live="polite">
      {toasts.map((toast) => {
        const s = styles[toast.kind];
        return (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-start gap-3 rounded-xl border border-border bg-surface px-4 py-3 shadow-[var(--shadow-lg)] animate-slide-in-right"
            role="status"
          >
            <Icon name={s.icon} size={18} className={`mt-0.5 shrink-0 ${s.className}`} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-text">{toast.title}</p>
              {toast.message ? <p className="mt-0.5 text-xs text-muted">{toast.message}</p> : null}
            </div>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              aria-label="Dismiss notification"
              className="shrink-0 rounded p-1 text-soft hover:text-text"
            >
              <Icon name="x" size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}