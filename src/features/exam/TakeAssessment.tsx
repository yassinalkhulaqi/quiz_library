import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import type { Attempt, Question, StudentAnswer } from '../../types';
import { subjectById } from '../../data/demoData';
import { computeAttemptScore, shuffle } from '../../lib/scoring';
import { Button, ConfirmDialog, Icon, ProgressBar } from '../../components/ui';
import { cn, formatMinutes, uid } from '../../lib/utils';

export function TakeAssessmentPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { assessments, questions, addAttempt, profile, toast } = useApp();

  const assessment = assessments.find((a) => a.id === id);
  const [screen, setScreen] = useState<'start' | 'exam'>('start');
  const [ordered, setOrdered] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<StudentAnswer[]>([]);
  const [current, setCurrent] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const startedAt = useRef(Date.now());

  // Build exam ordering once per assessment
  const bank = useMemo(() => assessment?.questionIds
    .map((qid) => questions.find((q) => q.id === qid))
    .filter((q): q is Question => Boolean(q)) ?? [], [assessment, questions]);

  useEffect(() => {
    if (!assessment) return;
    let list = [...bank];
    if (assessment.settings.randomizeQuestions) list = shuffle(list);
    setOrdered(list);
    setAnswers(list.map((q) => ({ questionId: q.id, selectedOptionIds: [], isMarkedForReview: false, isCorrect: false, gainedPoints: 0 })));
    if (assessment.settings.timeLimitMinutes) {
      setSecondsLeft(assessment.settings.timeLimitMinutes * 60);
    }
    setScreen('start');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assessment?.id]);

  // Timer
  useEffect(() => {
    if (screen !== 'exam' || secondsLeft === null) return;
    if (secondsLeft <= 0) {
      submitNow(true);
      return;
    }
    const t = window.setInterval(() => setSecondsLeft((s) => (s === null ? null : s - 1)), 1000);
    return () => window.clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, secondsLeft]);

  if (!assessment) {
    return (
      <div className="py-16 text-center">
        <p className="text-muted">This assessment could not be found.</p>
        <Button className="mt-4" onClick={() => navigate('/dashboard')}>Back to dashboard</Button>
      </div>
    );
  }

  const answerFor = (qid: string) => answers.find((a) => a.questionId === qid);
  const updateAnswer = (qid: string, patch: Partial<StudentAnswer>) => {
    setAnswers((prev) => prev.map((a) => (a.questionId === qid ? { ...a, ...patch } : a)));
  };

  const selectOption = (question: Question, optionId: string) => {
    const a = answerFor(question.id);
    if (!a) return;
    if (question.type === 'multiple_select') {
      const next = a.selectedOptionIds.includes(optionId)
        ? a.selectedOptionIds.filter((o) => o !== optionId)
        : [...a.selectedOptionIds, optionId];
      updateAnswer(question.id, { selectedOptionIds: next });
    } else {
      updateAnswer(question.id, { selectedOptionIds: [optionId] });
    }
  };

  const setText = (question: Question, value: string) => {
    updateAnswer(question.id, { textAnswer: value });
  };

  const isAnswered = (q: Question) => {
    const a = answerFor(q.id);
    if (!a) return false;
    if (q.type === 'essay' || q.type === 'short_answer' || q.type === 'fill_blank') return (a.textAnswer ?? '').trim().length > 0;
    return a.selectedOptionIds.length > 0;
  };

  const answeredCount = ordered.filter(isAnswered).length;
  const navigationAllowed = assessment.settings.allowQuestionNavigation;

  const submitNow = (expired = false) => {
    if (submitting) return;
    setSubmitting(true);
    const timeSpent = Math.floor((Date.now() - startedAt.current) / 1000);
    const { score, maxScore } = computeAttemptScore(ordered, answers);
    const attempt: Attempt = {
      id: uid('at'),
      assessmentId: assessment.id,
      kind: assessment.kind,
      studentId: profile.role === 'student' ? profile.email : 'me',
      status: 'submitted',
      answers,
      startedAt: startedAt.current,
      submittedAt: Date.now(),
      timeSpentSeconds: timeSpent,
      score,
      maxScore,
    };
    addAttempt(attempt);
    toast(expired ? 'warning' : 'success', expired ? 'Time expired — auto submitted' : 'Submitted successfully');
    navigate(`/results/${attempt.id}`);
  };

  const totalSeconds = assessment.settings.timeLimitMinutes ? assessment.settings.timeLimitMinutes * 60 : null;
  const timerPct = totalSeconds && secondsLeft !== null ? (secondsLeft / totalSeconds) * 100 : 100;
  const timerColor = secondsLeft !== null && secondsLeft < 120 ? 'var(--danger)' : 'var(--brand-500)';

  if (screen === 'start') {
    return (
      <div className="mx-auto max-w-xl animate-slide-up">
        <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[var(--shadow-lg)]">
          <div className="h-1.5 bg-gradient-to-r from-brand-500 to-accent-500" />
          <div className="p-6 sm:p-8">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl text-white" style={{ backgroundColor: subjectById(assessment.subjectId)?.color }}>
                <Icon name={assessment.kind === 'quiz' ? 'quiz' : 'clipboard'} size={22} />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-soft">{assessment.kind}</p>
                <h1 className="text-xl font-bold text-text">{assessment.title}</h1>
              </div>
            </div>
            {assessment.description ? <p className="mb-5 text-sm leading-relaxed text-muted">{assessment.description}</p> : null}

            <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <InfoStat label="Questions" value={String(ordered.length)} />
              <InfoStat label="Time" value={totalSeconds ? formatMinutes(totalSeconds) : 'Unlimited'} />
              <InfoStat label="Attempts" value={String(assessment.settings.maxAttempts)} />
              <InfoStat label="Passing" value={`${assessment.settings.passingScore}%`} />
            </div>

            <ul className="mb-6 space-y-2 text-sm text-muted">
              <li className="flex items-center gap-2"><Icon name="check" size={15} className="text-success" /> {ordered.length} questions in this assessment</li>
              <li className="flex items-center gap-2"><Icon name="check" size={15} className="text-success" /> {totalSeconds ? 'The timer starts once you begin' : 'No time limit'}</li>
              <li className="flex items-center gap-2"><Icon name="check" size={15} className="text-success" /> You can mark questions for review</li>
              {!assessment.settings.showAnswersAfter ? (
                <li className="flex items-center gap-2"><Icon name="info" size={15} className="text-warning" /> Results are shown after the assessment is closed</li>
              ) : null}
            </ul>

            <Button size="lg" fullWidth icon="arrow-right" onClick={() => { startedAt.current = Date.now(); setScreen('exam'); }}>
              Begin {assessment.kind}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const question = ordered[current];

  return (
    <div className="mx-auto max-w-3xl animate-slide-up">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-text">{assessment.title}</p>
          <p className="text-xs text-soft">Question {current + 1} of {ordered.length} · {answeredCount} answered</p>
        </div>
        {totalSeconds && secondsLeft !== null ? (
          <div className={cn('flex shrink-0 items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-semibold', secondsLeft < 120 ? 'bg-danger/15 text-danger' : 'bg-elevated text-text')}>
            <Icon name="clock" size={16} />
            {formatMinutes(secondsLeft)}
          </div>
        ) : null}
      </div>

      {/* Progress */}
      {totalSeconds && secondsLeft !== null ? (
        <div className="mb-4">
          <ProgressBar value={timerPct} color={timerColor} size="sm" />
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {/* Main question area */}
        <div className="md:col-span-2">
          <div key={question.id} className="rounded-2xl border border-border bg-surface p-6 shadow-[var(--shadow-md)] animate-fade-in">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-soft">{question.type.replace('_', ' ')} · {question.points} pts</span>
              {assessment.settings.allowReviewMarking ? (
                <button
                  type="button"
                  onClick={() => {
                    const a = answerFor(question.id);
                    updateAnswer(question.id, { isMarkedForReview: !(a?.isMarkedForReview ?? false) });
                  }}
                  className={cn('flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors', answerFor(question.id)?.isMarkedForReview ? 'bg-warning/15 text-warning' : 'text-soft hover:bg-elevated hover:text-text')}
                >
                  <Icon name="flag" size={13} />
                  {answerFor(question.id)?.isMarkedForReview ? 'Marked for review' : 'Mark for review'}
                </button>
              ) : null}
            </div>

            <h2 className="text-lg font-semibold leading-relaxed text-text">{question.text}</h2>

            <div className="mt-5 flex flex-col gap-2.5">
              {question.type === 'true_false' ? (
                <div className="grid grid-cols-2 gap-2">
                  {['true', 'false'].map((id) => {
                    const a = answerFor(question.id);
                    const sel = a?.selectedOptionIds.includes(id) ?? false;
                    const label = id === 'true' ? 'True' : 'False';
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => selectOption(question, id)}
                        className={cn(
                          'rounded-xl border-2 px-4 py-4 text-center font-semibold transition-all',
                          sel ? 'border-brand-500 bg-brand-500/10 text-brand-500' : 'border-border bg-elevated text-muted hover:border-brand-400'
                        )}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              ) : question.options.length > 0 ? (
                question.options.map((opt) => {
                  const a = answerFor(question.id);
                  const sel = a?.selectedOptionIds.includes(opt.id) ?? false;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => selectOption(question, opt.id)}
                      className={cn(
                        'flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition-all',
                        sel ? 'border-brand-500 bg-brand-500/10' : 'border-border bg-elevated hover:border-brand-400'
                      )}
                    >
                      <span className={cn('flex h-5 w-5 shrink-0 items-center justify-center rounded border-2', sel ? 'border-brand-500 bg-brand-500 text-white' : 'border-soft/50 bg-surface text-transparent')}>
                        <Icon name="check" size={12} />
                      </span>
                      <span className={cn('text-sm', sel ? 'text-text font-medium' : 'text-muted')}>{opt.text}</span>
                    </button>
                  );
                })
              ) : (
                <textarea
                  value={answerFor(question.id)?.textAnswer ?? ''}
                  onChange={(e) => setText(question, e.target.value)}
                  placeholder={question.type === 'essay' ? 'Write your answer here…' : 'Type your answer…'}
                  rows={question.type === 'essay' ? 8 : 3}
                  className="w-full rounded-xl border border-border bg-elevated px-4 py-3 text-sm text-text placeholder:text-soft focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              )}
            </div>

            <div className="mt-6 flex items-center justify-between">
              <Button variant="outline" icon="arrow-left" disabled={current === 0} onClick={() => setCurrent((c) => Math.max(0, c - 1))}>
                Previous
              </Button>
              {navigationAllowed || current === ordered.length - 1 ? (
                current === ordered.length - 1 ? (
                  <Button variant="accent" icon="check" onClick={() => setConfirmSubmit(true)}>Submit</Button>
                ) : (
                  <Button icon="arrow-right" onClick={() => setCurrent((c) => Math.min(ordered.length - 1, c + 1))}>Next</Button>
                )
              ) : null}
            </div>
          </div>
        </div>

        {/* Question navigation */}
        <div className="md:col-span-1">
          <div className="sticky top-20 rounded-2xl border border-border bg-surface p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-soft">Question navigator</p>
            <div className="grid grid-cols-5 gap-1.5">
              {ordered.map((q, i) => {
                const a = answerFor(q.id);
                const answered = isAnswered(q);
                const marked = a?.isMarkedForReview;
                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => navigationAllowed && setCurrent(i)}
                    className={cn(
                      'relative flex h-9 items-center justify-center rounded-md text-xs font-semibold transition-colors',
                      !navigationAllowed && 'cursor-default',
                      i === current ? 'bg-brand-500 text-white ring-2 ring-brand-500/30' : answered ? 'bg-success/20 text-success' : 'bg-elevated text-soft hover:bg-border'
                    )}
                  >
                    {i + 1}
                    {marked ? <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-warning" /> : null}
                  </button>
                );
              })}
            </div>
            <div className="mt-4 border-t border-border pt-3">
              <p className="text-xs text-soft">{answeredCount} of {ordered.length} answered</p>
              <ProgressBar value={(answeredCount / Math.max(ordered.length, 1)) * 100} className="mt-2" size="sm" />
            </div>
            <Button variant="accent" fullWidth className="mt-4" onClick={() => setConfirmSubmit(true)}>
              Submit assessment
            </Button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmSubmit}
        onClose={() => setConfirmSubmit(false)}
        onConfirm={() => submitNow()}
        title="Submit assessment?"
        message={`You've answered ${answeredCount} of ${ordered.length} questions${answeredCount < ordered.length ? ` (${ordered.length - answeredCount} unanswered)` : ''}. You cannot change answers after submitting.`}
        confirmLabel="Submit now"
        danger={false}
      />
    </div>
  );
}

function InfoStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-elevated px-3 py-3 text-center">
      <p className="text-lg font-bold text-text">{value}</p>
      <p className="text-[10px] uppercase tracking-wide text-soft">{label}</p>
    </div>
  );
}