import type { IconName } from '../components/ui/Icons';
import type { Role } from '../types';

export interface NavItem {
  label: string;
  path: string;
  icon: IconName;
  roles?: Role[];
  section?: string;
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
  { label: 'Question Bank', path: '/questions', icon: 'questions', section: 'Create' },
  { label: 'AI Studio', path: '/ai-studio', icon: 'sparkles', section: 'Create' },
  { label: 'Quizzes', path: '/quizzes', icon: 'quiz', section: 'Create' },
  { label: 'Exams', path: '/exams', icon: 'clipboard', section: 'Create' },
  { label: 'Analytics', path: '/analytics', icon: 'chart', section: 'Insights', roles: ['admin', 'teacher'] },
  { label: 'Subjects', path: '/subjects', icon: 'book', section: 'Insights' },
  { label: 'Collections', path: '/collections', icon: 'folder', section: 'Insights' },
  { label: 'Students', path: '/students', icon: 'users', section: 'Insights', roles: ['admin', 'teacher'] },
  { label: 'Templates', path: '/templates', icon: 'template', section: 'Insights' },
  { label: 'Activity', path: '/activity', icon: 'activity', section: 'System' },
  { label: 'Settings', path: '/settings', icon: 'settings', section: 'System' },
];

export function navForRole(role: Role): NavItem[] {
  return NAV_ITEMS.filter((item) => !item.roles || item.roles.includes(role));
}

export const BOTTOM_NAV: { label: string; path: string; icon: IconName }[] = [
  { label: 'Home', path: '/dashboard', icon: 'dashboard' },
  { label: 'Questions', path: '/questions', icon: 'questions' },
  { label: 'AI Studio', path: '/ai-studio', icon: 'sparkles' },
  { label: 'Quizzes', path: '/quizzes', icon: 'quiz' },
  { label: 'Settings', path: '/settings', icon: 'settings' },
];