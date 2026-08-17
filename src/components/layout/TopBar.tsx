import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Avatar, Dropdown, Icon, IconButton, Kbd } from '../ui';
import { NotificationPanel } from './NotificationPanel';

export function TopBar() {
  const { ui, setUi, theme, setTheme, profile, unreadCount, notifications, markNotificationRead, markAllNotificationsRead, switchRole, resetDemo } = useApp();
  const navigate = useNavigate();

  const quickActions: { label: string; path: string; icon: 'plus' | 'quiz' | 'clipboard' | 'sparkles' }[] = [
    { label: 'New Question', path: '/questions?new=1', icon: 'plus' },
    { label: 'Generate with AI', path: '/ai-studio', icon: 'sparkles' },
    { label: 'New Quiz', path: '/quizzes/new', icon: 'quiz' },
    { label: 'New Exam', path: '/exams/new', icon: 'clipboard' },
  ];

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-3 border-b border-border bg-surface/80 px-4 backdrop-blur-md sm:px-6">
      <div className="flex items-center gap-2 lg:hidden">
        <IconButton icon="menu" label="Open navigation" onClick={() => setUi({ mobileSidebarOpen: true })} />
      </div>

      <button
        type="button"
        onClick={() => setUi({ commandPaletteOpen: true })}
        className="hidden h-9 min-w-[260px] max-w-md items-center gap-2 rounded-lg border border-border bg-elevated px-3 text-sm text-soft transition-colors hover:border-brand-400 hover:text-muted sm:flex"
        aria-label="Open command palette"
      >
        <Icon name="search" size={15} />
        <span className="flex-1 text-left">Search QuizMind…</span>
        <span className="flex items-center gap-1">
          <Kbd>Ctrl</Kbd>
          <Kbd>K</Kbd>
        </span>
      </button>

      <div className="flex items-center gap-1">
        <IconButton
          icon="search"
          label="Search"
          className="sm:hidden"
          onClick={() => setUi({ commandPaletteOpen: true })}
        />
        <Dropdown
          align="right"
          width="w-56"
          trigger={
            <IconButton
              icon="plus"
              label="Quick actions"
              className="text-brand-500 hover:bg-brand-500/10 hover:text-brand-500"
            />
          }
          items={[
            { label: 'Quick actions', divider: true },
            ...quickActions.map((a) => ({
              label: a.label,
              icon: a.icon as never,
              onClick: () => navigate(a.path),
            })),
          ]}
        />
        <IconButton
          icon={theme === 'dark' ? 'sun' : 'moon'}
          label="Toggle theme"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        />
        <div className="relative">
          <IconButton
            icon="bell"
            label="Notifications"
            badge={unreadCount}
            active={ui.notificationsOpen}
            onClick={() => {
              setUi({ notificationsOpen: !ui.notificationsOpen });
              if (!ui.notificationsOpen && unreadCount > 0) {
                window.setTimeout(markAllNotificationsRead, 2500);
              }
            }}
          />
          {ui.notificationsOpen ? (
            <NotificationPanel
              notifications={notifications}
              onClose={() => setUi({ notificationsOpen: false })}
              onRead={markNotificationRead}
            />
          ) : null}
        </div>
        <Dropdown
          align="right"
          width="w-60"
          trigger={
            <button className="ml-1 flex items-center gap-2 rounded-lg p-1 transition-colors hover:bg-elevated" aria-label="Profile menu">
              <Avatar name={profile.name} color={profile.avatarColor} size={30} />
              <span className="hidden text-left leading-tight md:block">
                <span className="block text-[13px] font-semibold text-text">{profile.name}</span>
                <span className="block text-[11px] capitalize text-soft">{profile.role}</span>
              </span>
            </button>
          }
          items={[
            { label: 'Profile & settings', icon: 'settings', onClick: () => navigate('/settings') },
            { divider: true },
            { label: 'Switch role', icon: 'users' },
            { label: 'Teacher view', icon: 'user', onClick: () => { navigate('/dashboard'); switchRole('teacher'); } },
            { label: 'Student view', icon: 'graduation', onClick: () => { navigate('/dashboard'); switchRole('student'); } },
            { divider: true },
            { label: 'Reset demo data', icon: 'refresh', onClick: () => resetDemo() },
          ]}
        />
      </div>
    </header>
  );
}