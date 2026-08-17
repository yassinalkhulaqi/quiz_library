import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type {
  ActivityItem,
  AppSettings,
  Assessment,
  Attempt,
  Collection,
  NotificationItem,
  Question,
  Student,
  Template,
  UserProfile,
} from '../types';
import {
  DEMO_PROFILE,
  STORED_ACTIVITY,
  STORED_ASSESSMENTS,
  STORED_ATTEMPTS,
  STORED_COLLECTIONS,
  STORED_NOTIFICATIONS,
  STORED_QUESTIONS,
  STORED_TEMPLATES,
  STUDENTS,
  SUBJECTS,
  TOPICS,
} from '../data/demoData';
import { readStorage, writeStorage, clearDemoData } from '../lib/storage';
import { uid } from '../lib/utils';

export interface Toast {
  id: string;
  kind: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
}

type Theme = 'dark' | 'light';
type Role = UserProfile['role'];

interface UiState {
  commandPaletteOpen: boolean;
  notificationsOpen: boolean;
  mobileSidebarOpen: boolean;
}

interface AppContextValue {
  theme: Theme;
  setTheme: (t: Theme) => void;
  settings: AppSettings;
  updateSettings: (patch: Partial<AppSettings>) => void;
  profile: UserProfile;
  setProfile: (p: UserProfile) => void;
  switchRole: (role: Role) => void;

  questions: Question[];
  addQuestion: (q: Question) => void;
  updateQuestion: (id: string, patch: Partial<Question>) => void;
  removeQuestion: (id: string) => void;
  addQuestions: (qs: Question[]) => void;
  removeQuestions: (ids: string[]) => void;

  assessments: Assessment[];
  addAssessment: (a: Assessment) => void;
  updateAssessment: (id: string, patch: Partial<Assessment>) => void;
  removeAssessment: (id: string) => void;

  attempts: Attempt[];
  addAttempt: (a: Attempt) => void;
  updateAttempt: (id: string, patch: Partial<Attempt>) => void;

  collections: Collection[];
  addCollection: (c: Collection) => void;
  updateCollection: (id: string, patch: Partial<Collection>) => void;
  removeCollection: (id: string) => void;

  students: Student[];
  templates: Template[];
  notifications: NotificationItem[];
  pushNotification: (n: Omit<NotificationItem, 'id' | 'createdAt' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;
  unreadCount: number;

  activity: ActivityItem[];
  logActivity: (a: Omit<ActivityItem, 'id' | 'createdAt'>) => void;

  toasts: Toast[];
  toast: (kind: Toast['kind'], title: string, message?: string) => void;
  dismissToast: (id: string) => void;

  ui: UiState;
  setUi: (patch: Partial<UiState>) => void;

  resetDemo: () => void;
  aiKey: string;
  setAiKey: (key: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  language: 'en',
  notificationsEnabled: true,
  reduceMotion: false,
  aiProvider: 'demo',
  aiKeyConfigured: false,
  defaultDifficulty: 'medium',
  defaultQuestionType: 'multiple_choice',
  showCorrectAnswersImmediately: false,
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => readStorage<Theme>('theme', 'dark'));
  const [settings, setSettings] = useState<AppSettings>(() => ({ ...DEFAULT_SETTINGS, ...readStorage<Partial<AppSettings>>('settings', {}) }));
  const [profile, setProfile] = useState<UserProfile>(() => readStorage<UserProfile>('profile', DEMO_PROFILE));
  const [questions, setQuestions] = useState<Question[]>(() => readStorage<Question[]>('questions', STORED_QUESTIONS));
  const [assessments, setAssessments] = useState<Assessment[]>(() => readStorage<Assessment[]>('assessments', STORED_ASSESSMENTS));
  const [attempts, setAttempts] = useState<Attempt[]>(() => readStorage<Attempt[]>('attempts', STORED_ATTEMPTS));
  const [collections, setCollections] = useState<Collection[]>(() => readStorage<Collection[]>('collections', STORED_COLLECTIONS));
  const [students] = useState<Student[]>(STUDENTS);
  const [templates] = useState<Template[]>(STORED_TEMPLATES);
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => readStorage<NotificationItem[]>('notifications', STORED_NOTIFICATIONS));
  const [activity, setActivity] = useState<ActivityItem[]>(() => readStorage<ActivityItem[]>('activity', STORED_ACTIVITY));
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [ui, setUiState] = useState<UiState>({ commandPaletteOpen: false, notificationsOpen: false, mobileSidebarOpen: false });
  const [aiKey, setAiKeyState] = useState('');

  // persist collections
  useEffect(() => writeStorage('questions', questions), [questions]);
  useEffect(() => writeStorage('assessments', assessments), [assessments]);
  useEffect(() => writeStorage('attempts', attempts), [attempts]);
  useEffect(() => writeStorage('collections', collections), [collections]);
  useEffect(() => writeStorage('notifications', notifications), [notifications]);
  useEffect(() => writeStorage('activity', activity), [activity]);
  useEffect(() => writeStorage('settings', settings), [settings]);
  useEffect(() => writeStorage('profile', profile), [profile]);

  useEffect(() => {
    writeStorage('theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const setTheme = useCallback((t: Theme) => setThemeState(t), []);

  const setUi = useCallback((patch: Partial<UiState>) => {
    setUiState((prev) => ({ ...prev, ...patch }));
  }, []);

  const toast = useCallback((kind: Toast['kind'], title: string, message?: string) => {
    const id = uid('toast');
    setToasts((prev) => [...prev, { id, kind, title, message }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const updateSettings = useCallback((patch: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  const switchRole = useCallback((role: Role) => {
    setProfile((prev) => ({ ...prev, role }));
    toast('info', `Switched to ${role} view`);
  }, [toast]);

  const addQuestion = useCallback((q: Question) => {
    setQuestions((prev) => [q, ...prev]);
  }, []);
  const updateQuestion = useCallback((id: string, patch: Partial<Question>) => {
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, ...patch, updatedAt: Date.now() } : q)));
  }, []);
  const removeQuestion = useCallback((id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  }, []);
  const addQuestions = useCallback((qs: Question[]) => {
    setQuestions((prev) => [...qs, ...prev]);
  }, []);
  const removeQuestions = useCallback((ids: string[]) => {
    setQuestions((prev) => prev.filter((q) => !ids.includes(q.id)));
  }, []);

  const addAssessment = useCallback((a: Assessment) => setAssessments((prev) => [a, ...prev]), []);
  const updateAssessment = useCallback((id: string, patch: Partial<Assessment>) => {
    setAssessments((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch, updatedAt: Date.now() } : a)));
  }, []);
  const removeAssessment = useCallback((id: string) => {
    setAssessments((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const addAttempt = useCallback((a: Attempt) => setAttempts((prev) => [a, ...prev]), []);
  const updateAttempt = useCallback((id: string, patch: Partial<Attempt>) => {
    setAttempts((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  }, []);

  const addCollection = useCallback((c: Collection) => setCollections((prev) => [c, ...prev]), []);
  const updateCollection = useCallback((id: string, patch: Partial<Collection>) => {
    setCollections((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }, []);
  const removeCollection = useCallback((id: string) => {
    setCollections((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const pushNotification = useCallback((n: Omit<NotificationItem, 'id' | 'createdAt' | 'read'>) => {
    setNotifications((prev) => [
      { ...n, id: uid('n'), createdAt: Date.now(), read: false },
      ...prev,
    ]);
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);
  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const logActivity = useCallback((a: Omit<ActivityItem, 'id' | 'createdAt'>) => {
    setActivity((prev) => [{ ...a, id: uid('ac'), createdAt: Date.now() }, ...prev].slice(0, 60));
  }, []);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  const resetDemo = useCallback(() => {
    clearDemoData();
    setQuestions(STORED_QUESTIONS);
    setAssessments(STORED_ASSESSMENTS);
    setAttempts(STORED_ATTEMPTS);
    setCollections(STORED_COLLECTIONS);
    setNotifications(STORED_NOTIFICATIONS);
    setActivity(STORED_ACTIVITY);
    setProfile(DEMO_PROFILE);
    setSettings({ ...DEFAULT_SETTINGS });
    setThemeState('dark');
    setAiKeyState('');
    toast('info', 'Demo data reset', 'QuizMind restored to the original demo dataset.');
  }, [toast]);

  const setAiKey = useCallback((key: string) => {
    setAiKeyState(key);
    updateSettings({ aiKeyConfigured: key.trim().length > 0, aiProvider: key.trim() ? 'gemini' : 'demo' });
  }, [updateSettings]);

  const value: AppContextValue = {
    theme,
    setTheme,
    settings,
    updateSettings,
    profile,
    setProfile,
    switchRole,
    questions,
    addQuestion,
    updateQuestion,
    removeQuestion,
    addQuestions,
    removeQuestions,
    assessments,
    addAssessment,
    updateAssessment,
    removeAssessment,
    attempts,
    addAttempt,
    updateAttempt,
    collections,
    addCollection,
    updateCollection,
    removeCollection,
    students,
    templates,
    notifications,
    pushNotification,
    markNotificationRead,
    markAllNotificationsRead,
    clearNotifications,
    unreadCount,
    activity,
    logActivity,
    toasts,
    toast,
    dismissToast,
    ui,
    setUi,
    resetDemo,
    aiKey,
    setAiKey,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export { SUBJECTS, TOPICS };
export type { Role };

export function useToaster() {
  const { toast } = useApp();
  return toast;
}

export function useDebounced<T>(value: T, delay = 250): T {
  const [debounced, setDebounced] = useState(value);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer.current);
  }, [value, delay]);
  return debounced;
}