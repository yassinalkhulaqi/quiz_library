import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp, useDebounced } from '../../context/AppContext';
import { Icon, type IconName } from '../ui/Icons';
import { cn } from '../../lib/utils';
import { readStorage, writeStorage } from '../../lib/storage';
import { SUBJECTS, subjectById, topicName } from '../../data/demoData';

interface PaletteItem {
  id: string;
  label: string;
  description?: string;
  icon: IconName;
  path: string;
  group: string;
}

export function CommandPalette() {
  const { ui, setUi, questions, assessments, students, collections } = useApp();
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [recent, setRecent] = useState<string[]>(() => readStorage<string[]>('recent-searches', []));
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const debouncedQuery = useDebounced(query, 120);

  const open = ui.commandPaletteOpen;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setUi({ commandPaletteOpen: !open });
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, setUi]);

  useEffect(() => {
    if (open) {
      setQuery('');
      setActiveIndex(0);
      window.setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setUi({ commandPaletteOpen: false });
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, setUi]);

  const items = useMemo<PaletteItem[]>(() => {
    const q = debouncedQuery.trim().toLowerCase();
    const list: PaletteItem[] = [];

    const commandItems: PaletteItem[] = [
      { id: 'c_quiz', label: 'Create a new Quiz', icon: 'quiz', path: '/quizzes/new', group: 'Commands' },
      { id: 'c_exam', label: 'Create a new Exam', icon: 'clipboard', path: '/exams/new', group: 'Commands' },
      { id: 'c_gen', label: 'Generate Questions with AI', icon: 'sparkles', path: '/ai-studio', group: 'Commands' },
      { id: 'c_question', label: 'Add a Question', icon: 'plus', path: '/questions?new=1', group: 'Commands' },
      { id: 'c_subject', label: 'Create a Subject', icon: 'book', path: '/subjects?new=1', group: 'Commands' },
      { id: 'c_analytics', label: 'Open Analytics', icon: 'chart', path: '/analytics', group: 'Commands' },
      { id: 'c_settings', label: 'Open Settings', icon: 'settings', path: '/settings', group: 'Commands' },
    ];

    if (!q) {
      return [...commandItems];
    }

    questions
      .filter((x) => x.text.toLowerCase().includes(q))
      .slice(0, 4)
      .forEach((x) =>
        list.push({ id: `q_${x.id}`, label: x.text, description: topicName(x.topicId), icon: 'questions', path: `/questions?q=${encodeURIComponent(x.text)}`, group: 'Questions' })
      );
    assessments
      .filter((x) => x.title.toLowerCase().includes(q))
      .slice(0, 4)
      .forEach((x) =>
        list.push({ id: `a_${x.id}`, label: x.title, description: `${x.kind} · ${subjectById(x.subjectId)?.name ?? ''}`, icon: x.kind === 'quiz' ? 'quiz' : 'clipboard', path: `/${x.kind === 'quiz' ? 'quizzes' : 'exams'}`, group: x.kind === 'quiz' ? 'Quizzes' : 'Exams' })
      );
    students
      .filter((x) => x.name.toLowerCase().includes(q))
      .slice(0, 3)
      .forEach((x) =>
        list.push({ id: `s_${x.id}`, label: x.name, description: x.grade, icon: 'user', path: '/students', group: 'Students' })
      );
    SUBJECTS
      .filter((x) => x.name.toLowerCase().includes(q))
      .slice(0, 3)
      .forEach((x) =>
        list.push({ id: `sub_${x.id}`, label: x.name, description: x.description, icon: 'book', path: `/subjects/${x.id}`, group: 'Subjects' })
      );
    collections
      .filter((x) => x.name.toLowerCase().includes(q))
      .slice(0, 3)
      .forEach((x) =>
        list.push({ id: `col_${x.id}`, label: x.name, description: `${x.questionIds.length} questions`, icon: 'folder', path: '/collections', group: 'Collections' })
      );

    if (list.length === 0 && !q) list.push(...commandItems);
    return list;
  }, [debouncedQuery, questions, assessments, students, collections]);

  const grouped = useMemo(() => {
    const map = new Map<string, PaletteItem[]>();
    for (const item of items) {
      if (!map.has(item.group)) map.set(item.group, []);
      map.get(item.group)!.push(item);
    }
    return [...map.entries()];
  }, [items]);

  const flat = useMemo(() => items, [items]);

  useEffect(() => {
    setActiveIndex(0);
  }, [debouncedQuery, open]);

  const run = (item: PaletteItem) => {
    setUi({ commandPaletteOpen: false });
    if (item.group === 'Questions' && item.path.startsWith('/questions?q=')) {
      navigate('/questions', { state: { searchQuery: item.label } });
      return;
    }
    if (item.id === 'c_quiz') {
      navigate('/quizzes/new');
      return;
    }
    if (item.id === 'c_exam') {
      navigate('/exams/new');
      return;
    }
    navigate(item.path);
    if (query) {
      const next = [query, ...recent.filter((r) => r !== query)].slice(0, 5);
      setRecent(next);
      writeStorage('recent-searches', next);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, flat.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const item = flat[activeIndex];
      if (item) run(item);
    } else if (e.key === 'Escape') {
      setUi({ commandPaletteOpen: false });
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[55] flex items-start justify-center p-4 pt-[12vh]" role="dialog" aria-modal="true" aria-label="Command palette">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setUi({ commandPaletteOpen: false })} />
      <div className="relative w-full max-w-xl overflow-hidden rounded-xl border border-border bg-surface shadow-[var(--shadow-lg)] animate-scale-in">
        <div className="flex items-center gap-3 border-b border-border px-4">
          <Icon name="search" size={18} className="text-soft" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search questions, quizzes, students, subjects…"
            className="h-12 flex-1 bg-transparent text-sm text-text placeholder:text-soft focus:outline-none"
            aria-label="Search"
          />
          <kbd className="rounded border border-border bg-elevated px-1.5 py-0.5 font-mono text-[10px] text-soft">ESC</kbd>
        </div>

        <div className="max-h-[50vh] overflow-y-auto py-2" onKeyDown={onKeyDown}>
          {!query && recent.length > 0 && (
            <div className="px-4 pb-2">
              <p className="pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-soft">Recent searches</p>
              <div className="flex flex-wrap gap-1.5">
                {recent.map((r) => (
                  <button
                    key={r}
                    onClick={() => setQuery(r)}
                    className="rounded-md border border-border bg-elevated px-2 py-1 text-xs text-muted hover:text-text"
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          )}
          {flat.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-soft">
              No results for "{query}". Try a different search.
            </div>
          ) : (
            grouped.map(([group, groupItems], gi) => (
              <div key={group}>
                <p className="px-4 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-widest text-soft">{group}</p>
                {groupItems.map((item, li) => {
                  const idx = grouped.slice(0, gi).reduce((sum, g) => sum + g[1].length, 0) + li;
                  const active = idx === activeIndex;
                  return (
                    <button
                      key={item.id}
                      onMouseEnter={() => setActiveIndex(idx)}
                      onClick={() => run(item)}
                      className={cn(
                        'flex w-full items-center gap-3 px-4 py-2 text-left transition-colors',
                        active ? 'bg-brand-500/10 text-brand-500' : 'text-text'
                      )}
                    >
                      <span className={cn('flex h-8 w-8 items-center justify-center rounded-lg bg-elevated', active && 'bg-brand-500/15')}>
                        <Icon name={item.icon} size={15} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">{item.label}</span>
                        {item.description ? <span className="block truncate text-xs text-soft">{item.description}</span> : null}
                      </span>
                      {active ? <Icon name="arrow-right" size={14} /> : null}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        <div className="flex items-center gap-3 border-t border-border px-4 py-2 text-[10px] text-soft">
          <span className="flex items-center gap-1"><kbd className="kbd">↑↓</kbd> navigate</span>
          <span className="flex items-center gap-1"><kbd className="kbd">↵</kbd> open</span>
          <span className="flex items-center gap-1"><kbd className="kbd">esc</kbd> close</span>
          <span className="ml-auto">QuizMind</span>
        </div>
      </div>
    </div>
  );
}