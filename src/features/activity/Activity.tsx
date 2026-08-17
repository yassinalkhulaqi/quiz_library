import { useApp } from '../../context/AppContext';
import { Card, CardBody, CardHeader, Icon, type IconName } from '../../components/ui';
import { timeAgo } from '../../lib/utils';

const typeIcon: Record<string, IconName> = {
  ai_generated: 'sparkles',
  quiz_created: 'quiz',
  exam_created: 'clipboard',
  exam_submitted: 'check',
  question_created: 'plus',
  question_updated: 'pencil',
  import: 'upload',
  collection: 'folder',
  student_joined: 'user',
  system: 'activity',
};

export function ActivityPage() {
  const { activity } = useApp();

  return (
    <div className="animate-slide-up">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-text">Activity</h1>
        <p className="text-sm text-muted">A chronological log of what's happened on QuizMind.</p>
      </div>

      <Card>
        <CardHeader title="Recent Activity" subtitle={`${activity.length} events`} icon={<Icon name="activity" size={18} className="text-brand-500" />} />
        <CardBody className="flex flex-col divide-y divide-border/60">
          {activity.length === 0 ? (
            <p className="py-8 text-center text-sm text-soft">No activity yet.</p>
          ) : (
            activity.map((a) => (
              <div key={a.id} className="flex items-start gap-3 py-3">
                <div className="relative">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-elevated text-brand-500">
                    <Icon name={typeIcon[a.type] ?? 'activity'} size={16} />
                  </span>
                  <span className="absolute left-1/2 top-full h-4 w-px -translate-x-1/2 bg-border" />
                </div>
                <div className="min-w-0 flex-1 pb-1">
                  <p className="text-sm font-medium text-text">{a.title}</p>
                  <p className="text-xs text-muted">{a.description}</p>
                </div>
                <span className="shrink-0 pt-1 text-[11px] text-soft">{timeAgo(a.createdAt)}</span>
              </div>
            ))
          )}
        </CardBody>
      </Card>
    </div>
  );
}