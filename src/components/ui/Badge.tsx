import React from 'react';
import { cn } from '../../lib/utils';
import type { Difficulty, QuestionType } from '../../types';

type Tone = 'brand' | 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'accent';

const tones: Record<Tone, string> = {
  brand: 'bg-brand-500/12 text-brand-500 border-brand-500/20',
  success: 'bg-success/12 text-success border-success/25',
  warning: 'bg-warning/12 text-warning border-warning/25',
  danger: 'bg-danger/12 text-danger border-danger/25',
  info: 'bg-info/15 text-info border-info/25',
  neutral: 'bg-elevated text-muted border-border',
  accent: 'bg-accent-500/12 text-accent-500 border-accent-500/25',
};

export function Badge({
  tone = 'neutral',
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap',
        tones[tone],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

const difficultyTones: Record<Difficulty, Tone> = {
  easy: 'success',
  medium: 'warning',
  hard: 'danger',
};

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  return <Badge tone={difficultyTones[difficulty]}>{difficulty}</Badge>;
}

const typeLabels: Record<QuestionType, string> = {
  multiple_choice: 'Multiple Choice',
  multiple_select: 'Multiple Select',
  true_false: 'True / False',
  short_answer: 'Short Answer',
  fill_blank: 'Fill in the Blank',
  essay: 'Essay',
};

export function TypeBadge({ type }: { type: QuestionType }) {
  return <Badge tone="info">{typeLabels[type]}</Badge>;
}

export { typeLabels as questionTypeLabels };