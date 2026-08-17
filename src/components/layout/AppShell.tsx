import { Outlet, NavLink } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { useApp } from '../../context/AppContext';
import { SidebarContent } from './Sidebar';
import { TopBar } from './TopBar';
import { CommandPalette } from './CommandPalette';
import { Toaster, Icon } from '../ui';
import { BOTTOM_NAV } from '../../lib/navigation';

export function AppShell() {
  const { ui, setUi } = useApp();

  return (
    <div className="min-h-screen bg-bg text-text">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 border-r border-border bg-surface lg:block">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      {ui.mobileSidebarOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setUi({ mobileSidebarOpen: false })} />
          <div className="absolute inset-y-0 left-0 w-72 bg-surface shadow-[var(--shadow-lg)] animate-slide-in-right" style={{ animationName: 'qm-slide-in-right', animationDirection: 'reverse' }}>
            <SidebarContent onNavigate={() => setUi({ mobileSidebarOpen: false })} />
          </div>
        </div>
      ) : null}

      <div className="lg:pl-60">
        <TopBar />
        <main className="mx-auto max-w-7xl px-4 py-6 pb-24 sm:px-6 lg:px-8 lg:pb-10">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-border bg-surface/95 px-2 py-1.5 backdrop-blur-md lg:hidden"
        aria-label="Bottom navigation"
      >
        {BOTTOM_NAV.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-[10px] font-medium transition-colors',
                isActive ? 'text-brand-500' : 'text-soft hover:text-text'
              )
            }
          >
            <Icon name={item.icon} size={20} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <CommandPalette />
      <Toaster />
    </div>
  );
}