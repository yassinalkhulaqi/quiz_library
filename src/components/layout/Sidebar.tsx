import { NavLink, useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { navForRole } from '../../lib/navigation';
import { Icon, LogoMark } from '../ui/Icons';
import { useApp } from '../../context/AppContext';

export function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { profile } = useApp();
  const items = navForRole(profile.role);
  const sections = ['Create', 'Insights', 'System'];

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 shrink-0 items-center gap-2.5 border-b border-border px-5">
        <LogoMark size={26} />
        <div className="leading-tight">
          <p className="text-[15px] font-extrabold tracking-tight text-text">
            Quiz<span className="text-brand-500">Mind</span>
          </p>
          <p className="text-[10px] font-medium uppercase tracking-wider text-soft">Assessment Platform</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Primary">
        {sections.map((section) => {
          const sectionItems = items.filter((i) => (i.section ?? 'Create') === section);
          if (sectionItems.length === 0) return null;
          return (
            <div key={section} className="mb-4">
              <p className="px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-soft">{section}</p>
              <ul className="space-y-0.5">
                {sectionItems.map((item) => (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      onClick={onNavigate}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-3 rounded-lg px-2.5 py-2 text-[13.5px] font-medium transition-colors',
                          isActive
                            ? 'bg-brand-500/12 text-brand-500'
                            : 'text-muted hover:bg-elevated hover:text-text'
                        )
                      }
                    >
                      <Icon name={item.icon} size={17} />
                      {item.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </nav>

      <div className="border-t border-border p-3">
        <RoleSwitch />
      </div>
    </div>
  );
}

function RoleSwitch() {
  const { profile, switchRole } = useApp();
  const navigate = useNavigate();
  return (
    <div className="rounded-lg border border-border bg-surface p-2">
      <div className="mb-1.5 px-1 text-[10px] font-semibold uppercase tracking-wider text-soft">View as</div>
      <div className="grid grid-cols-3 gap-1" role="radiogroup" aria-label="Switch role">
        {(['teacher', 'student', 'admin'] as const).map((role) => (
          <button
            key={role}
            role="radio"
            aria-checked={profile.role === role}
            onClick={() => {
              switchRole(role);
              navigate('/dashboard');
            }}
            className={cn(
              'rounded-md px-1 py-1.5 text-xs font-medium capitalize transition-colors',
              profile.role === role ? 'bg-brand-500 text-white' : 'text-muted hover:bg-elevated hover:text-text'
            )}
          >
            {role}
          </button>
        ))}
      </div>
    </div>
  );
}