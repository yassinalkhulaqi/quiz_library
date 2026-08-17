import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { subjectById, topicName } from '../../data/demoData';
import { computeAttemptScore, isPassing, performanceBreakdown, percentage } from '../../lib/scoring';
import { Badge, Button, Card, CardBody, CardHeader, DifficultyBadge, Icon, ProgressBar, TypeBadge } from '../../components/ui';
import { ScoreRing } from '../analytics/charts';
import { cn, formatDate, formatSeconds } from '../../lib/utils';

export function ResultsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { attempts, assessments, questions } = useApp();

  const attempt = attempts.find((a) => a.id === id);
  const assessment = attempt ? assessments.find((a) => a.id === attempt.assessmentId) : undefined;

  const result = useMemo(() => {
    if (!attempt) return null;
    const qs = assessment?.questionIds
      .map((qid) => questions.find((q) => q.id === qid))
      .filter((q): q is NonNullable<typeof q> => Boolean(q)) ?? [];
    return { qs, score: computeAttemptScore(qs, attempt.answers) };
  }, [attempt, assessment, questions]);

  const pct = attempt ? percentage(attempt.score, attempt.maxScore) : 0;
  const breakdown = attempt && result ? performanceBreakdown(result.qs, attempt.answers, topicName) : null;

  const strongest = breakdown?.byTopic.find((t) => t.total > 0 && t.pct === Math.max(...breakdown.byTopic.filter((x) => x.total > 0).map((x) => x.pct)));
  const weakest = breakdown?.byTopic.find((t) => t.total > 0 && t.pct === Math.min(...breakdown.byTopic.filter((x) => x.total > 0).map((x) => x.pct)));

  const recommendations = useMemo(() => {
    const recs: string[] = [];
    if (!attempt || !result || !breakdown) return recs;
    if (weakest) recs.push(`Your weakest area is ${weakest.topicName} (${weakest.pct}% correct). Consider reviewing it before your next attempt.`);
    if (strongest && strongest.topicId !== weakest?.topicId) recs.push(`Your strongest area is ${strongest.topicName} at ${strongest.pct}% correct. Great work — keep it up.`);
    if (result.score.unansweredCount > 0) recs.push(`You left ${result.score.unansweredCount} question${result.score.unansweredCount > 1 ? 's' : ''} unanswered. Try to attempt every question next time.`);
    if (pct >= 90) recs.push('Outstanding result — you could help your classmates by sharing study notes on this topic.');
    else if (pct >= 70) recs.push('Solid performance. Focus your revision on the topics below 70% to push higher.');
    else if (pct >= 50) recs.push('You\'re close to passing. A structured review of your weak topics should make a big difference.');
    else recs.push('This result suggests the fundamentals need attention. Revisit the core concepts before retrying.');
    return recs;
  }, [weakest, strongest, result, pct, attempt, breakdown]);

  const insights = useMemo(() => {
    const list: string[] = [];
    if (!attempt || !result) return list;
    const hardQs = result.qs.filter((q) => q.difficulty === 'hard');
    const missed = result.qs.filter((q) => {
      const a = attempt.answers.find((x) => x.questionId === q.id);
      return a && !a.isCorrect && ((a.textAnswer ?? '').trim().length > 0 || a.selectedOptionIds.length > 0);
    });
    if (missed.length > 0) list.push(`${missed.length} question${missed.length > 1 ? 's were' : ' was'} attempted but answered incorrectly — the most common review target.`);
    if (hardQs.length > 0 && hardQs.every((q) => attempt.answers.find((x) => x.questionId === q.id)?.isCorrect)) {
      list.push('You correctly answered every hard-difficulty question — excellent command of advanced material.');
    }
    return list;
  }, [result, attempt]);

  if (!attempt || !assessment || !result || !breakdown) {
    return (
      <div className="py-16 text-center">
        <p className="text-muted">This result could not be found.</p>
        <Button className="mt-4" onClick={() => navigate('/dashboard')}>Back to dashboard</Button>
      </div>
    );
  }

  const passing = isPassing(attempt, assessment);

  const scoreColor = pct >= 70 ? 'var(--success)' : pct >= 50 ? 'var(--warning)' : 'var(--danger)';

  return (
    <div className="mx-auto max-w-4xl animate-slide-up">
      {/* Hero */}
      <Card className="overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-brand-500 to-accent-500" />
        <CardBody className="flex flex-col items-center gap-6 py-8 sm:flex-row sm:justify-between">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
            <ScoreRing value={pct} label="score" size={140} />
            <div className="text-center sm:text-left">
              <h1 className="text-xl font-bold text-text">{assessment.title}</h1>
              <p className="text-sm capitalize text-soft">{assessment.kind} · {subjectById(assessment.subjectId)?.name}</p>
              <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
                <Badge tone={passing ? 'success' : 'danger'}>{passing ? 'Passed' : 'Not passed'}</Badge>
                <Badge tone="neutral">{attempt.score}/{attempt.maxScore} points</Badge>
                <Badge tone="neutral">{formatSeconds(attempt.timeSpentSeconds)}</Badge>
                <Badge tone="neutral">submitted {formatDate(attempt.submittedAt ?? attempt.startedAt)}</Badge>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Button variant="outline" icon="refresh" onClick={() => navigate(`/take/${assessment.id}`)}>Retake</Button>
            <Button variant="ghost" icon="chart" onClick={() => navigate('/analytics')}>Analytics</Button>
          </div>
        </CardBody>
      </Card>

      {/* Summary stats */}
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile icon="check" label="Correct" value={String(result.score.correctCount)} tone="text-success" />
        <StatTile icon="x" label="Incorrect" value={String(result.score.incorrectCount)} tone="text-danger" />
        <StatTile icon="clock" label="Unanswered" value={String(result.score.unansweredCount)} tone="text-warning" />
        <StatTile icon="clock" label="Time spent" value={formatSeconds(attempt.timeSpentSeconds)} />
      </div>

      {/* Recommendations */}
      <Card className="mt-5">
        <CardHeader title="Recommendations" subtitle="Personalized next steps" icon={<Icon name="target" size={18} className="text-brand-500" />} />
        <CardBody>
          <ul className="space-y-2">
            {recommendations.map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted">
                <Icon name="arrow-right" size={15} className="mt-0.5 shrink-0 text-brand-500" />
                {r}
              </li>
            ))}
          </ul>
        </CardBody>
      </Card>

      {/* AI Insights */}
      {insights.length > 0 ? (
        <Card className="mt-5">
          <CardHeader title="AI Insights" subtitle="Derived from your performance" icon={<Icon name="sparkles" size={18} className="text-accent-500" />} />
          <CardBody>
            <ul className="space-y-2">
              {insights.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted">
                  <Icon name="sparkles" size={15} className="mt-0.5 shrink-0 text-accent-500" />
                  {s}
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      ) : null}

      {/* Performance breakdown */}
      <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
        <Card>
          <CardHeader title="Topic Performance" icon={<Icon name="layers" size={18} className="text-brand-500" />} />
          <CardBody>
            {breakdown.byTopic.length === 0 ? (
              <p className="text-sm text-soft">No answered questions to analyze.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {breakdown.byTopic.map((t) => (
                  <div key={t.topicId}>
                    <div className="mb-1 flex justify-between text-xs">
                      <span className="font-medium text-text">{t.topicName}</span>
                      <span className="text-soft">{t.correct}/{t.total} · {t.pct}%</span>
                    </div>
                    <ProgressBar
                      value={t.pct}
                      color={t.pct >= 70 ? 'var(--success)' : t.pct >= 50 ? 'var(--warning)' : 'var(--danger)'}
                      size="sm"
                    />
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Difficulty Breakdown" icon={<Icon name="chart" size={18} className="text-brand-500" />} />
          <CardBody>
            <div className="flex flex-col gap-3">
              {breakdown.byDifficulty.map((d) => (
                <div key={d.difficulty}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="font-medium capitalize text-text">{d.difficulty}</span>
                    <span className="text-soft">{d.correct}/{d.total} · {d.pct}%</span>
                  </div>
                  <ProgressBar value={d.pct} color={scoreColor} size="sm" />
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Question review */}
      <Card className="mt-5">
        <CardHeader title="Question Review" subtitle="Your answers with explanations" icon={<Icon name="eye" size={18} className="text-brand-500" />} />
        <CardBody className="flex flex-col gap-4">
          {result.qs.map((q, i) => {
            const a = attempt.answers.find((x) => x.questionId === q.id);
            const answered = a && (q.type === 'essay' || q.type === 'short_answer' || q.type === 'fill_blank' ? (a.textAnswer ?? '').trim().length > 0 : a.selectedOptionIds.length > 0);
            const correct = a?.isCorrect;
            return (
              <div key={q.id} className="rounded-xl border border-border bg-elevated p-4">
                <div className="flex items-start gap-3">
                  <span className={cn('mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white', correct ? 'bg-success' : answered ? 'bg-danger' : 'bg-soft')}>
                    <Icon name={correct ? 'check' : answered ? 'x' : 'minus'} size={13} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-1.5">
                      <span className="text-xs font-semibold text-soft">Q{i + 1}</span>
                      <TypeBadge type={q.type} />
                      <DifficultyBadge difficulty={q.difficulty} />
                    </div>
                    <p className="text-sm font-medium text-text">{q.text}</p>
                    {q.type === 'essay' ? (
                      <div className="mt-2">
                        <p className="text-xs text-soft">Your answer:</p>
                        <p className="mt-0.5 text-sm italic text-muted">{(a?.textAnswer ?? '').trim() || 'No answer'}</p>
                      </div>
                    ) : q.options.length > 0 ? (
                      <div className="mt-2 flex flex-col gap-1">
                        {q.options.map((o) => {
                          const isCorrectOpt = q.correctAnswer.includes(o.id);
                          const selected = a?.selectedOptionIds.includes(o.id);
                          return (
                            <div
                              key={o.id}
                              className={cn(
                                'flex items-center gap-2 rounded-md px-2 py-1 text-xs',
                                isCorrectOpt ? 'bg-success/10 text-success' : selected ? 'bg-danger/10 text-danger' : 'text-muted'
                              )}
                            >
                              <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: isCorrectOpt ? 'var(--success)' : selected ? 'var(--danger)' : 'var(--soft)' }} />
                              {o.text}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="mt-1 text-xs text-muted">
                        {q.type === 'fill_blank' || q.type === 'short_answer'
                          ? <>Your answer: <span className="italic">{(a?.textAnswer ?? '').trim() || '—'}</span> · Correct: {q.correctAnswer.join(', ')}</>
                          : null}
                      </p>
                    )}
                    {q.explanation && assessment.settings.showExplanations ? (
                      <div className="mt-2 rounded-md bg-brand-500/8 px-3 py-2 text-xs leading-relaxed text-muted">
                        <span className="font-semibold text-accent-500">Explanation: </span>{q.explanation}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </CardBody>
      </Card>
    </div>
  );
}

function StatTile({ icon, label, value, tone }: { icon: 'check' | 'x' | 'clock'; label: string; value: string; tone?: string }) {
  return (
    <Card className="text-center">
      <CardBody className="flex flex-col items-center gap-1 py-4">
        <Icon name={icon} size={18} className={tone ?? 'text-brand-500'} />
        <p className="text-xl font-bold text-text">{value}</p>
        <p className="text-[11px] uppercase tracking-wide text-soft">{label}</p>
      </CardBody>
    </Card>
  );
}