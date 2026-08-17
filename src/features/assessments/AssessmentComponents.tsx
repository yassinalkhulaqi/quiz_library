import type { Assessment, AssessmentSettings } from '../../types';
import { subjectById } from '../../data/demoData';
import { Badge, Button, Card, CardBody, Icon, ProgressBar } from '../../components/ui';
import { timeAgo } from '../../lib/utils';

export function defaultSettings(kind: Assessment['kind']): AssessmentSettings {
  return {
    timeLimitMinutes: kind === 'exam' ? 60 : 20,
    maxAttempts: kind === 'exam' ? 1 : 3,
    passingScore: 60,
    randomizeQuestions: true,
    randomizeAnswers: true,
    showAnswersAfter: kind === 'quiz',
    showExplanations: true,
    allowQuestionNavigation: kind === 'quiz',
    allowReviewMarking: true,
    pointsPerQuestion: null,
    availableFrom: null,
    availableUntil: null,
  };
}

export function AssessmentCard({
  assessment,
  questionCount,
  onOpen,
  onTake,
  onEdit,
  onDelete,
  onToggleStatus,
}: {
  assessment: Assessment;
  questionCount: number;
  onOpen?: () => void;
  onTake?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onToggleStatus?: () => void;
}) {
  const subject = subjectById(assessment.subjectId);
  const statusTone = assessment.status === 'published' ? 'success' : assessment.status === 'draft' ? 'neutral' : 'warning';

  return (
    <Card className="transition-all hover:border-brand-500/40 hover:shadow-[var(--shadow-md)]">
      <CardBody className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: `${subject?.color ?? '#6366f1'}1f`, color: subject?.color }}>
              <Icon name={assessment.kind === 'quiz' ? 'quiz' : 'clipboard'} size={18} />
            </div>
            <div>
              <h3 className="font-semibold text-text">{assessment.title}</h3>
              <p className="text-xs capitalize text-soft">{assessment.kind} · {subject?.name}</p>
            </div>
          </div>
          <Badge tone={statusTone}>{assessment.status}</Badge>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-lg bg-elevated px-2 py-2">
            <p className="text-lg font-bold text-text">{questionCount}</p>
            <p className="text-[10px] uppercase tracking-wide text-soft">Questions</p>
          </div>
          <div className="rounded-lg bg-elevated px-2 py-2">
            <p className="text-lg font-bold text-text">{assessment.settings.timeLimitMinutes ? `${assessment.settings.timeLimitMinutes}m` : '∞'}</p>
            <p className="text-[10px] uppercase tracking-wide text-soft">Time</p>
          </div>
          <div className="rounded-lg bg-elevated px-2 py-2">
            <p className="text-lg font-bold text-text">{assessment.attemptsCount}</p>
            <p className="text-[10px] uppercase tracking-wide text-soft">Attempts</p>
          </div>
        </div>

        {assessment.avgScore !== null && assessment.attemptsCount > 0 ? (
          <div>
            <div className="mb-1 flex justify-between text-xs text-soft">
              <span>Avg score</span>
              <span>{Math.round(assessment.avgScore)}%</span>
            </div>
            <ProgressBar value={assessment.avgScore} color={assessment.avgScore >= 70 ? 'var(--success)' : assessment.avgScore >= 50 ? 'var(--warning)' : 'var(--danger)'} />
          </div>
        ) : null}

        <div className="flex items-center justify-between border-t border-border pt-2">
          <span className="text-[11px] text-soft">Updated {timeAgo(assessment.updatedAt)}</span>
          <div className="flex gap-1.5">
            {onTake ? <Button size="xs" variant="accent" icon="play" onClick={onTake}>Take</Button> : null}
            {onOpen ? <Button size="xs" variant="outline" onClick={onOpen}>Open</Button> : null}
            {onEdit ? <Button size="xs" variant="ghost" icon="pencil" onClick={onEdit} /> : null}
            {onToggleStatus ? (
              <Button size="xs" variant="ghost" icon={assessment.status === 'published' ? 'archive' : 'check'} onClick={onToggleStatus} />
            ) : null}
            {onDelete ? <Button size="xs" variant="ghost" icon="trash" className="text-danger" onClick={onDelete} /> : null}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

export function AssessmentListItem({ assessment }: { assessment: Assessment }) {
  const subject = subjectById(assessment.subjectId);
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-surface px-4 py-3">
      <Icon name={assessment.kind === 'quiz' ? 'quiz' : 'clipboard'} className="text-brand-500" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-text">{assessment.title}</p>
        <p className="text-xs text-soft">{subject?.name} · {assessment.questionIds.length} questions</p>
      </div>
      <Badge tone={assessment.status === 'published' ? 'success' : 'neutral'}>{assessment.status}</Badge>
    </div>
  );
}

export function kindIcon(kind: Assessment['kind']) {
  return kind === 'quiz' ? 'quiz' : 'clipboard';
}