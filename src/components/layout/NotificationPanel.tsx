import { useNavigate } from 'react-router-dom';
import type { NotificationItem } from '../../types';
import { timeAgo } from '../../lib/utils';
import { Icon, type IconName } from '../ui/Icons';

const typeMeta: Record<NotificationItem['type'], { icon: IconName; className: string }> = {
  ai: { icon: 'sparkles', className: 'text-accent-500' },
  quiz: { icon: 'quiz', className: 'text-brand-500' },
  exam: { icon: 'clipboard', className: 'text-info' },
  student: { icon: 'user', className: 'text-success' },
  import: { icon: 'upload', className: 'text-warning' },
  export: { icon: 'download', className: 'text-warning' },
  analytics: { icon: 'chart', className: 'text-brand-500' },
  system: { icon: 'info', className: 'text-soft' },
};

export function NotificationPanel({
  notifications,
  onClose,
  onRead,
}: {
  notifications: NotificationItem[];
  onClose: () => void;
  onRead: (id: string) => void;
}) {
  const navigate = useNavigate();
  return (
    <div className="absolute right-0 top-12 z-40 w-[min(92vw,360px)] overflow-hidden rounded-xl border border-border bg-surface shadow-[var(--shadow-lg)] animate-scale-in">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <p className="text-sm font-semibold text-text">Notifications</p>
        <span className="text-xs text-soft">{notifications.filter((n) => !n.read).length} unread</span>
      </div>
      <div className="max-h-[380px] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-soft">You're all caught up.</div>
        ) : (
          notifications.map((n) => {
            const meta = typeMeta[n.type];
            return (
              <button
                key={n.id}
                type="button"
                onClick={() => {
                  onRead(n.id);
                  if (n.link) navigate(n.link);
                  onClose();
                }}
                className="flex w-full items-start gap-3 border-b border-border/60 px-4 py-3 text-left transition-colors hover:bg-elevated"
              >
                <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-elevated ${meta.className}`}>
                  <Icon name={meta.icon} size={15} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className={`block text-[13px] font-semibold ${n.read ? 'text-muted' : 'text-text'}`}>{n.title}</span>
                  <span className="mt-0.5 block text-xs leading-relaxed text-muted">{n.message}</span>
                  <span className="mt-1 block text-[10px] uppercase tracking-wide text-soft">{timeAgo(n.createdAt)}</span>
                </span>
                {!n.read ? <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-500" /> : null}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}