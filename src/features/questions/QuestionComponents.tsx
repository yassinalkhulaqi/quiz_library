import { useMemo, useState } from 'react';
import type { Question, QuestionType, Difficulty } from '../../types';
import { cn, formatDate } from '../../lib/utils';
import { subjectById, topicName, topicsForSubject, TOPICS, SUBJECTS } from '../../data/demoData';
import {
  Badge,
  Button,
  DifficultyBadge,
  Field,
  Icon,
  Input,
  Modal,
  Select,
  Textarea,
  TypeBadge,
  questionTypeLabels,
} from '../../components/ui';
import { IconName } from '../../components/ui/Icons';

export function QuestionTypeIcon({ type, size = 15 }: { type: QuestionType; size?: number }) {
  const map: Record<QuestionType, IconName> = {
    multiple_choice: 'check',
    multiple_select: 'layers',
    true_false: 'flag',
    short_answer: 'pencil',
    fill_blank: 'puzzle',
    essay: 'file-text',
  };
  const icon = map[type] as IconName;
  return <Icon name={icon} size={size} />;
}

export function QuestionCard({
  question,
  onPreview,
  onEdit,
  onDelete,
  onToggleStatus,
  onAddToCollection,
  onDuplicate,
  selected,
  onSelect,
}: {
  question: Question;
  onPreview?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onToggleStatus?: () => void;
  onAddToCollection?: () => void;
  onDuplicate?: () => void;
  selected?: boolean;
  onSelect?: () => void;
}) {
  const subject = subjectById(question.subjectId);
  return (
    <div
      className={cn(
        'group rounded-xl border border-border bg-surface p-4 transition-all hover:border-brand-500/40 hover:shadow-[var(--shadow-md)]',
        selected && 'border-brand-500 ring-2 ring-brand-500/20'
      )}
    >
      <div className="flex items-start gap-3">
        {onSelect ? (
          <button
            type="button"
            role="checkbox"
            aria-checked={selected}
            aria-label="Select question"
            onClick={onSelect}
            className={cn(
              'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors',
              selected ? 'border-brand-500 bg-brand-500 text-white' : 'border-border bg-elevated text-transparent hover:border-brand-400'
            )}
          >
            <Icon name="check" size={12} />
          </button>
        ) : null}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium leading-relaxed text-text">{question.text}</p>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <TypeBadge type={question.type} />
            <DifficultyBadge difficulty={question.difficulty} />
            {subject ? (
              <Badge tone="neutral" className="gap-1">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: subject.color }} />
                {subject.name}
              </Badge>
            ) : null}
            <Badge tone="neutral">{topicName(question.topicId)}</Badge>
            <Badge tone="neutral">{question.points} pts</Badge>
            {question.tags.slice(0, 2).map((t) => (
              <Badge key={t} tone="neutral">{t}</Badge>
            ))}
          </div>
          <div className="mt-2 flex items-center gap-3 text-[11px] text-soft">
            <span>by {question.author}</span>
            <span>{formatDate(question.createdAt)}</span>
            <span>{question.usageCount} uses</span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
          {onPreview ? (
            <IconButton icon="eye" label="Preview" onClick={onPreview} />
          ) : null}
          {onEdit ? (
            <IconButton icon="pencil" label="Edit" onClick={onEdit} />
          ) : null}
          {onAddToCollection ? (
            <IconButton icon="folder" label="Add to collection" onClick={onAddToCollection} />
          ) : null}
          {onDuplicate ? (
            <IconButton icon="duplicate" label="Duplicate" onClick={onDuplicate} />
          ) : null}
          {onToggleStatus ? (
            <IconButton icon="archive" label={question.status === 'active' ? 'Archive' : 'Unarchive'} onClick={onToggleStatus} />
          ) : null}
          {onDelete ? (
            <IconButton icon="trash" label="Delete" onClick={onDelete} className="hover:text-danger" />
          ) : null}
        </div>
      </div>
    </div>
  );
}

function IconButton({ icon, label, onClick, className }: { icon: IconName; label: string; onClick?: () => void; className?: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cn('flex h-8 w-8 items-center justify-center rounded-lg text-soft transition-colors hover:bg-elevated hover:text-text', className)}
    >
      <Icon name={icon} size={15} />
    </button>
  );
}

export interface QuestionFormValues {
  text: string;
  type: QuestionType;
  subjectId: string;
  topicId: string;
  difficulty: Difficulty;
  points: number;
  estimatedSeconds: number;
  explanation: string;
  tags: string;
  options: { id: string; text: string; correct: boolean }[];
  acceptedAnswers: string[];
}

export const emptyQuestionForm = (subjectId = SUBJECTS[0].id): QuestionFormValues => ({
  text: '',
  type: 'multiple_choice',
  subjectId,
  topicId: topicsForSubject(subjectId)[0]?.id ?? TOPICS[0].id,
  difficulty: 'medium',
  points: 5,
  estimatedSeconds: 60,
  explanation: '',
  tags: '',
  options: [
    { id: 'opt_1', text: '', correct: false },
    { id: 'opt_2', text: '', correct: false },
    { id: 'opt_3', text: '', correct: false },
    { id: 'opt_4', text: '', correct: false },
  ],
  acceptedAnswers: [''],
});

export function questionToFormValues(q: Question): QuestionFormValues {
  return {
    text: q.text,
    type: q.type,
    subjectId: q.subjectId,
    topicId: q.topicId,
    difficulty: q.difficulty,
    points: q.points,
    estimatedSeconds: q.estimatedSeconds,
    explanation: q.explanation ?? '',
    tags: q.tags.join(', '),
    options: q.options.map((o) => ({ id: o.id, text: o.text, correct: q.correctAnswer.includes(o.id) })),
    acceptedAnswers: q.type === 'short_answer' || q.type === 'fill_blank' ? [...q.correctAnswer] : [''],
  };
}

export function validateQuestionForm(v: QuestionFormValues): string[] {
  const errors: string[] = [];
  if (!v.text.trim()) errors.push('Question text is required.');
  if (v.type === 'multiple_choice' || v.type === 'multiple_select') {
    const filled = v.options.filter((o) => o.text.trim());
    if (filled.length < 2) errors.push('Provide at least two options.');
    const correct = v.options.filter((o) => o.text.trim() && o.correct);
    if (correct.length === 0) errors.push('Mark at least one correct option.');
    if (v.type === 'multiple_choice' && correct.length > 1) errors.push('Multiple choice allows exactly one correct answer.');
  }
  if (v.type === 'short_answer' || v.type === 'fill_blank') {
    const answers = v.acceptedAnswers.filter((a) => a.trim());
    if (answers.length === 0) errors.push('Provide at least one accepted answer.');
  }
  if (v.points <= 0) errors.push('Points must be greater than zero.');
  return errors;
}

export function QuestionForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel = 'Save Question',
}: {
  initial: QuestionFormValues;
  onSubmit: (values: QuestionFormValues) => void;
  onCancel: () => void;
  submitLabel?: string;
}) {
  const [values, setValues] = useState<QuestionFormValues>(initial);
  const [errors, setErrors] = useState<string[]>([]);

  const set = <K extends keyof QuestionFormValues>(key: K, value: QuestionFormValues[K]) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  const topics = useMemo(() => topicsForSubject(values.subjectId), [values.subjectId]);

  const submit = () => {
    const errs = validateQuestionForm(values);
    setErrors(errs);
    if (errs.length === 0) onSubmit(values);
  };

  const showOptions = values.type === 'multiple_choice' || values.type === 'multiple_select';
  const showAnswers = values.type === 'short_answer' || values.type === 'fill_blank';

  return (
    <div className="flex flex-col gap-4">
      {errors.length > 0 ? (
        <div className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">
          {errors.map((e) => <p key={e}>{e}</p>)}
        </div>
      ) : null}

      <Field label="Question text" required>
        <Textarea
          value={values.text}
          onChange={(e) => set('text', e.target.value)}
          placeholder="Type the question…"
          rows={3}
        />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field label="Type">
          <Select value={values.type} onChange={(e) => set('type', e.target.value as QuestionType)}>
            {Object.entries(questionTypeLabels).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </Select>
        </Field>
        <Field label="Subject">
          <Select value={values.subjectId} onChange={(e) => set('subjectId', e.target.value)}>
            {SUBJECTS.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </Select>
        </Field>
        <Field label="Topic">
          <Select value={values.topicId} onChange={(e) => set('topicId', e.target.value)}>
            {topics.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </Select>
        </Field>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Field label="Difficulty">
          <Select value={values.difficulty} onChange={(e) => set('difficulty', e.target.value as Difficulty)}>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </Select>
        </Field>
        <Field label="Points">
          <Input type="number" min={1} value={values.points} onChange={(e) => set('points', Number(e.target.value))} />
        </Field>
        <Field label="Est. time (sec)">
          <Input type="number" min={15} value={values.estimatedSeconds} onChange={(e) => set('estimatedSeconds', Number(e.target.value))} />
        </Field>
      </div>

      {showOptions ? (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-text">Options</p>
          {values.options.map((opt, i) => (
            <div key={opt.id} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  set(
                    'options',
                    values.options.map((o, j) =>
                      i === j
                        ? { ...o, correct: !o.correct }
                        : values.type === 'multiple_choice'
                          ? { ...o, correct: false }
                          : o
                    )
                  )
                }
                className={cn(
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-md border transition-colors',
                  opt.correct ? 'border-success bg-success text-white' : 'border-border bg-elevated text-soft hover:border-success/50'
                )}
                aria-label={`Mark option ${i + 1} as correct`}
                title="Correct answer"
              >
                <Icon name="check" size={14} />
              </button>
              <Input
                value={opt.text}
                onChange={(e) => set('options', values.options.map((o, j) => (i === j ? { ...o, text: e.target.value } : o)))}
                placeholder={`Option ${i + 1}`}
              />
              <button
                type="button"
                onClick={() => set('options', values.options.filter((_, j) => j !== i))}
                className="shrink-0 rounded p-1 text-soft hover:text-danger"
                aria-label="Remove option"
              >
                <Icon name="x" size={15} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => set('options', [...values.options, { id: `opt_${Math.random()}`, text: '', correct: false }])}
            className="self-start rounded-lg border border-dashed border-border px-3 py-1.5 text-xs font-medium text-muted hover:border-brand-400 hover:text-brand-500"
          >
            + Add option
          </button>
        </div>
      ) : null}

      {showAnswers ? (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-text">Accepted answers</p>
          {values.acceptedAnswers.map((ans, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input
                value={ans}
                onChange={(e) => set('acceptedAnswers', values.acceptedAnswers.map((a, j) => (i === j ? e.target.value : a)))}
                placeholder="e.g. 127.0.0.1"
              />
              <button
                type="button"
                onClick={() => set('acceptedAnswers', values.acceptedAnswers.filter((_, j) => j !== i))}
                className="shrink-0 rounded p-1 text-soft hover:text-danger"
                aria-label="Remove answer"
              >
                <Icon name="x" size={15} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => set('acceptedAnswers', [...values.acceptedAnswers, ''])}
            className="self-start rounded-lg border border-dashed border-border px-3 py-1.5 text-xs font-medium text-muted hover:border-brand-400 hover:text-brand-500"
          >
            + Add accepted answer
          </button>
        </div>
      ) : null}

      <Field label="Explanation">
        <Textarea
          value={values.explanation}
          onChange={(e) => set('explanation', e.target.value)}
          placeholder="Explain the correct answer (shown after submission)…"
          rows={2}
        />
      </Field>

      <Field label="Tags" hint="Comma separated">
        <Input value={values.tags} onChange={(e) => set('tags', e.target.value)} placeholder="crypto, aes, basics" />
      </Field>

      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button onClick={submit}>{submitLabel}</Button>
      </div>
    </div>
  );
}

export function QuestionPreviewModal({ question, onClose }: { question: Question; onClose: () => void }) {
  return (
    <Modal open onClose={onClose} title="Question Preview" icon="eye" size="lg">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          <TypeBadge type={question.type} />
          <DifficultyBadge difficulty={question.difficulty} />
          <Badge tone="neutral">{subjectById(question.subjectId)?.name}</Badge>
          <Badge tone="neutral">{topicName(question.topicId)}</Badge>
          <Badge tone="neutral">{question.points} points</Badge>
        </div>
        <p className="text-base font-medium leading-relaxed text-text">{question.text}</p>
        {question.type === 'true_false' ? (
          <div className="flex gap-3">
            {['true', 'false'].map((id) => {
              const label = id === 'true' ? 'True' : 'False';
              const correct = question.correctAnswer.includes(id);
              return (
                <span
                  key={id}
                  className={cn(
                    'rounded-lg border px-4 py-2 text-sm font-medium',
                    correct ? 'border-success bg-success/10 text-success' : 'border-border bg-elevated text-muted'
                  )}
                >
                  {label} {correct ? '✓' : ''}
                </span>
              );
            })}
          </div>
        ) : question.options.length > 0 ? (
          <div className="flex flex-col gap-2">
            {question.options.map((o) => {
              const correct = question.correctAnswer.includes(o.id);
              return (
                <div
                  key={o.id}
                  className={cn(
                    'flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-sm',
                    correct ? 'border-success/40 bg-success/8 text-text' : 'border-border bg-elevated text-muted'
                  )}
                >
                  <span className={cn('flex h-5 w-5 items-center justify-center rounded-full border', correct ? 'border-success text-success' : 'border-soft/40')}>
                    {correct ? <Icon name="check" size={12} /> : null}
                  </span>
                  {o.text}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-elevated px-4 py-3 text-sm text-muted">
            {question.type === 'essay'
              ? 'Free-form essay response.'
              : `Accepted answers: ${question.correctAnswer.join(', ')}`}
          </div>
        )}
        {question.explanation ? (
          <div className="rounded-lg border border-info/30 bg-info/10 px-4 py-3">
            <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-info">
              <Icon name="info" size={13} /> Explanation
            </p>
            <p className="text-sm leading-relaxed text-text">{question.explanation}</p>
          </div>
        ) : null}
      </div>
    </Modal>
  );
}