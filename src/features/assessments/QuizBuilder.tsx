import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import type { Assessment, AssessmentKind, AssessmentSettings, Question } from '../../types';
import { SUBJECTS, topicName, topicsForSubject } from '../../data/demoData';
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  ConfirmDialog,
  DifficultyBadge,
  EmptyState,
  Field,
  Icon,
  Input,
  SearchInput,
  Select,
  Textarea,
  Toggle,
  TypeBadge,
} from '../../components/ui';
import { uid } from '../../lib/utils';
import { defaultSettings } from './AssessmentComponents';
import { cn } from '../../lib/utils';

const STEPS = ['Information', 'Questions', 'Settings', 'Preview'];

interface FormState {
  title: string;
  description: string;
  kind: AssessmentKind;
  subjectId: string;
  selectedIds: string[];
  settings: AssessmentSettings;
}

export function QuizBuilderPage({ kind: forcedKind }: { kind?: AssessmentKind }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { questions, assessments, addAssessment, updateAssessment, toast, profile } = useApp();

  const existing = id ? assessments.find((a) => a.id === id) : undefined;

  const [step, setStep] = useState(0);
  const [query, setQuery] = useState('');
  const [form, setForm] = useState<FormState>(() => {
    const kind = existing?.kind ?? forcedKind ?? 'quiz';
    return {
      title: existing?.title ?? '',
      description: existing?.description ?? '',
      kind,
      subjectId: existing?.subjectId ?? SUBJECTS[0].id,
      selectedIds: existing?.questionIds ?? [],
      settings: existing?.settings ?? defaultSettings(kind),
    };
  });
  const [confirmDelete, setConfirmDelete] = useState(false);

  const topics = useMemo(() => topicsForSubject(form.subjectId), [form.subjectId]);
  const bankQuestions = useMemo(() => questions.filter((q) => q.status === 'active'), [questions]);

  const available = useMemo(() => {
    const q = query.trim().toLowerCase();
    return bankQuestions.filter((question) => {
      if (!q) return true;
      return [question.text, topicName(question.topicId)].join(' ').toLowerCase().includes(q);
    });
  }, [bankQuestions, query]);

  const selectedQuestions = form.selectedIds
    .map((id) => bankQuestions.find((q) => q.id === id))
    .filter((q): q is Question => Boolean(q));

  const totalPoints = selectedQuestions.reduce((sum, q) => sum + q.points, 0);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((prev) => ({ ...prev, [key]: value }));
  const setSettings = (patch: Partial<AssessmentSettings>) => setForm((prev) => ({ ...prev, settings: { ...prev.settings, ...patch } }));

  const toggleQuestion = (questionId: string) => {
    set('selectedIds', form.selectedIds.includes(questionId)
      ? form.selectedIds.filter((x) => x !== questionId)
      : [...form.selectedIds, questionId]);
  };

  const move = (from: number, to: number) => {
    const next = [...form.selectedIds];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    set('selectedIds', next);
  };

  const canProceed = step === 0 ? form.title.trim().length > 0 : step === 1 ? form.selectedIds.length > 0 : true;

  const publish = (status: Assessment['status']) => {
    const assessment: Assessment = {
      id: existing?.id ?? uid('as'),
      kind: form.kind,
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      subjectId: form.subjectId,
      topicIds: form.subjectId ? topics.map((t) => t.id) : [],
      questionIds: form.selectedIds,
      settings: form.settings,
      status,
      author: existing?.author ?? profile.name,
      createdAt: existing?.createdAt ?? Date.now(),
      updatedAt: Date.now(),
      attemptsCount: existing?.attemptsCount ?? 0,
      avgScore: existing?.avgScore ?? null,
    };
    if (existing) {
      updateAssessment(existing.id, { ...assessment, id: existing.id });
      toast('success', `${assessment.kind === 'quiz' ? 'Quiz' : 'Exam'} updated`);
    } else {
      addAssessment(assessment);
      toast('success', `${assessment.kind === 'quiz' ? 'Quiz' : 'Exam'} ${status === 'published' ? 'published' : 'saved as draft'}`);
    }
    navigate(`/${form.kind === 'quiz' ? 'quizzes' : 'exams'}`);
  };

  const remove = () => {
    if (!existing) return;
    updateAssessment(existing.id, { status: 'closed' });
    toast('info', 'Assessment closed');
    navigate(`/${form.kind === 'quiz' ? 'quizzes' : 'exams'}`);
  };

  return (
    <div className="animate-slide-up">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text">
            {existing ? 'Edit' : 'Create'} {form.kind === 'quiz' ? 'Quiz' : 'Exam'}
          </h1>
          <p className="text-sm text-muted">Build a {form.kind} in four simple steps.</p>
        </div>
        {existing ? <Button variant="danger" icon="trash" onClick={() => setConfirmDelete(true)}>Close</Button> : null}
      </div>

      {/* Stepper */}
      <div className="mb-6 flex items-center gap-2">
        {STEPS.map((label, i) => (
          <React.Fragment key={label}>
            <button
              type="button"
              onClick={() => i < step && setStep(i)}
              className={cn(
                'flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
                i === step ? 'bg-brand-500 text-white' : i < step ? 'bg-brand-500/15 text-brand-500 hover:bg-brand-500/25' : 'bg-elevated text-soft'
              )}
            >
              <span className={cn('flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold', i === step ? 'bg-white/20' : '')}>
                {i < step ? <Icon name="check" size={12} /> : i + 1}
              </span>
              <span className="hidden sm:inline">{label}</span>
            </button>
            {i < STEPS.length - 1 ? <div className="h-px flex-1 bg-border" /> : null}
          </React.Fragment>
        ))}
      </div>

      {step === 0 ? (
        <Card className="mx-auto max-w-2xl">
          <CardHeader title="Quiz Information" subtitle="Tell students what this assessment covers" icon={<Icon name="info" size={18} />} />
          <CardBody className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Assessment type">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => set('kind', 'quiz')}
                    className={cn('flex flex-col items-center gap-1 rounded-lg border p-3 transition-colors', form.kind === 'quiz' ? 'border-brand-500 bg-brand-500/10 text-brand-500' : 'border-border bg-elevated text-muted hover:border-brand-400')}
                  >
                    <Icon name="quiz" size={20} />
                    <span className="text-sm font-medium">Quiz</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => set('kind', 'exam')}
                    className={cn('flex flex-col items-center gap-1 rounded-lg border p-3 transition-colors', form.kind === 'exam' ? 'border-brand-500 bg-brand-500/10 text-brand-500' : 'border-border bg-elevated text-muted hover:border-brand-400')}
                  >
                    <Icon name="clipboard" size={20} />
                    <span className="text-sm font-medium">Exam</span>
                  </button>
                </div>
              </Field>
              <Field label="Subject">
                <Select value={form.subjectId} onChange={(e) => set('subjectId', e.target.value)}>
                  {SUBJECTS.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </Select>
              </Field>
            </div>
            <Field label="Title" required>
              <Input value={form.title} onChange={(e) => set('title', e.target.value)} placeholder={`e.g. ${form.kind === 'quiz' ? 'Weekly' : 'Midterm'} on ${SUBJECTS[0].name}`} />
            </Field>
            <Field label="Description" hint="Optional — shown on the start screen.">
              <Textarea value={form.description} onChange={(e) => set('description', e.target.value)} rows={2} placeholder="What students should know…" />
            </Field>
          </CardBody>
        </Card>
      ) : null}

      {step === 1 ? (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <Card>
            <CardHeader title="Question Bank" subtitle="Search and select questions" icon={<Icon name="questions" size={18} />} />
            <CardBody className="flex flex-col gap-3">
              <SearchInput value={query} onChange={setQuery} placeholder="Search questions…" />
              <div className="max-h-[460px] overflow-y-auto pr-1">
                {available.length === 0 ? (
                  <EmptyState icon="search" title="No questions" description="No active questions match. Create some first." />
                ) : (
                  available.slice(0, 80).map((q) => {
                    const sel = form.selectedIds.includes(q.id);
                    return (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => toggleQuestion(q.id)}
                        className={cn(
                          'mb-2 w-full rounded-lg border p-3 text-left transition-colors',
                          sel ? 'border-brand-500 bg-brand-500/10' : 'border-border bg-surface hover:border-brand-400'
                        )}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-medium leading-snug text-text">{q.text}</p>
                          <span className={cn('flex h-5 w-5 shrink-0 items-center justify-center rounded border', sel ? 'border-brand-500 bg-brand-500 text-white' : 'border-border bg-elevated text-transparent')}>
                            <Icon name="check" size={12} />
                          </span>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          <TypeBadge type={q.type} />
                          <DifficultyBadge difficulty={q.difficulty} />
                          <Badge tone="neutral">{q.points} pts</Badge>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Selected Questions" subtitle={`${form.selectedIds.length} selected · ${totalPoints} points`} icon={<Icon name="list" size={18} />} />
            <CardBody>
              {selectedQuestions.length === 0 ? (
                <EmptyState icon="list" title="No questions selected" description="Pick questions from the bank on the left." />
              ) : (
                <div className="flex flex-col gap-2">
                  {selectedQuestions.map((q, i) => (
                    <div key={q.id} className="flex items-center gap-2 rounded-lg border border-border bg-surface p-2.5">
                      <div className="flex flex-col gap-0.5">
                        <button type="button" aria-label="Move up" onClick={() => i > 0 && move(i, i - 1)} className="rounded p-0.5 text-soft hover:text-text">
                          <Icon name="chevron-up" size={13} />
                        </button>
                        <button type="button" aria-label="Move down" onClick={() => i < selectedQuestions.length - 1 && move(i, i + 1)} className="rounded p-0.5 text-soft hover:text-text">
                          <Icon name="chevron-down" size={13} />
                        </button>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm text-text">{i + 1}. {q.text}</p>
                        <p className="text-[11px] text-soft">{q.points} pts · {q.type.replace('_', ' ')}</p>
                      </div>
                      <button type="button" onClick={() => toggleQuestion(q.id)} aria-label="Remove" className="rounded p-1 text-soft hover:text-danger">
                        <Icon name="x" size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      ) : null}

      {step === 2 ? (
        <Card className="mx-auto max-w-2xl">
          <CardHeader title="Configure Settings" subtitle="Control timing, attempts, randomization and feedback" icon={<Icon name="settings" size={18} />} />
          <CardBody>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Time limit (minutes)" hint="Leave empty for no limit">
                <Input type="number" min={1} value={form.settings.timeLimitMinutes ?? ''} onChange={(e) => setSettings({ timeLimitMinutes: e.target.value ? Number(e.target.value) : null })} placeholder="No limit" />
              </Field>
              <Field label="Max attempts">
                <Input type="number" min={1} value={form.settings.maxAttempts} onChange={(e) => setSettings({ maxAttempts: Math.max(1, Number(e.target.value)) })} />
              </Field>
              <Field label="Passing score (%)">
                <Input type="number" min={0} max={100} value={form.settings.passingScore} onChange={(e) => setSettings({ passingScore: Math.max(0, Math.min(100, Number(e.target.value))) })} />
              </Field>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 border-t border-border pt-4 sm:grid-cols-2">
              <Toggle checked={form.settings.randomizeQuestions} onChange={(v) => setSettings({ randomizeQuestions: v })} label="Randomize question order" />
              <Toggle checked={form.settings.randomizeAnswers} onChange={(v) => setSettings({ randomizeAnswers: v })} label="Randomize answer options" />
              <Toggle checked={form.settings.showAnswersAfter} onChange={(v) => setSettings({ showAnswersAfter: v })} label="Show answers after submission" />
              <Toggle checked={form.settings.showExplanations} onChange={(v) => setSettings({ showExplanations: v })} label="Show explanations" />
              <Toggle checked={form.settings.allowQuestionNavigation} onChange={(v) => setSettings({ allowQuestionNavigation: v })} label="Allow free navigation" />
              <Toggle checked={form.settings.allowReviewMarking} onChange={(v) => setSettings({ allowReviewMarking: v })} label="Allow marking for review" />
            </div>
          </CardBody>
        </Card>
      ) : null}

      {step === 3 ? (
        <div className="mx-auto max-w-2xl">
          <Card>
            <CardHeader title="Preview" subtitle="Review before publishing" icon={<Icon name="eye" size={18} />} />
            <CardBody className="flex flex-col gap-4">
              <div className="rounded-xl bg-gradient-to-br from-brand-500/15 to-accent-500/15 p-5">
                <h2 className="text-lg font-bold text-text">{form.title}</h2>
                {form.description ? <p className="mt-1 text-sm text-muted">{form.description}</p> : null}
                <div className="mt-4 grid grid-cols-3 gap-2 text-center sm:grid-cols-4">
                  <PreviewStat label="Questions" value={String(form.selectedIds.length)} />
                  <PreviewStat label="Points" value={String(totalPoints)} />
                  <PreviewStat label="Time" value={form.settings.timeLimitMinutes ? `${form.settings.timeLimitMinutes}m` : '∞'} />
                  <PreviewStat label="Passing" value={`${form.settings.passingScore}%`} />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {selectedQuestions.map((q, i) => (
                  <div key={q.id} className="flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-2">
                    <p className="truncate text-sm text-text">{i + 1}. {q.text}</p>
                    <Badge tone="neutral">{q.points} pts</Badge>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>
      ) : null}

      <div className="mt-6 flex items-center justify-between">
        <Button variant="ghost" onClick={() => (step === 0 ? navigate(`/${form.kind === 'quiz' ? 'quizzes' : 'exams'}`) : setStep(step - 1))} icon="arrow-left">
          {step === 0 ? 'Cancel' : 'Back'}
        </Button>
        <div className="flex gap-2">
          {step === 3 ? (
            <>
              <Button variant="outline" icon="archive" onClick={() => publish('draft')}>Save as draft</Button>
              <Button icon="check" onClick={() => publish('published')}>Publish</Button>
            </>
          ) : (
            <Button icon="arrow-right" disabled={!canProceed} onClick={() => setStep(step + 1)}>Continue</Button>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={remove}
        title="Close this assessment?"
        message="Closing prevents new submissions. Existing results remain available."
        confirmLabel="Close assessment"
      />
    </div>
  );
}

function PreviewStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-surface/70 px-2 py-2">
      <p className="text-base font-bold text-text">{value}</p>
      <p className="text-[10px] uppercase tracking-wide text-soft">{label}</p>
    </div>
  );
}