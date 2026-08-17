import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import type { AssessmentKind, AssessmentSettings } from '../../types';
import { Badge, Button, Card, CardBody, Icon, Modal } from '../../components/ui';
import type { IconName } from '../../components/ui';
import { uid } from '../../lib/utils';
import { defaultSettings } from '../assessments/AssessmentComponents';

const templateIcons: Record<string, IconName> = {
  zap: 'zap',
  'file-text': 'file-text',
  graduation: 'graduation',
  repeat: 'repeat',
  award: 'award',
};

export function TemplatesPage() {
  const { templates, questions, addAssessment, toast, profile } = useApp();
  const navigate = useNavigate();
  const [useTemplate, setUseTemplate] = useState<string | null>(null);

  const activeQuestions = useMemo(() => questions.filter((q) => q.status === 'active'), [questions]);

  const applyTemplate = (templateId: string, titleOverride: string) => {
    const template = templates.find((t) => t.id === templateId);
    if (!template) return;
    // pick the first N questions from the bank (coherent demo behavior)
    const picked = [...activeQuestions]
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, Math.min(template.questionCount, activeQuestions.length, 12));
    const settings: AssessmentSettings = { ...defaultSettings(template.kind), ...template.settings };
    const assessment = {
      id: uid('as'),
      kind: template.kind as AssessmentKind,
      title: titleOverride || template.name,
      description: template.description,
      subjectId: picked[0]?.subjectId ?? activeQuestions[0]?.subjectId ?? 's_cyber',
      topicIds: [...new Set(picked.map((q) => q.topicId))],
      questionIds: picked.map((q) => q.id),
      settings,
      status: 'published' as const,
      author: profile.name,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      attemptsCount: 0,
      avgScore: null,
    };
    addAssessment(assessment);
    toast('success', 'Template applied', `${assessment.title} published with ${picked.length} questions.`);
    setUseTemplate(null);
    navigate(`/${assessment.kind === 'quiz' ? 'quizzes' : 'exams'}`);
  };

  return (
    <div className="animate-slide-up">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-text">Templates</h1>
        <p className="text-sm text-muted">Start from a proven configuration and publish in one click.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {templates.map((t) => (
          <Card key={t.id} className="transition-all hover:border-brand-500/40 hover:shadow-[var(--shadow-md)]">
            <CardBody className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/10 text-brand-500">
                  <Icon name={templateIcons[t.icon] ?? 'template'} size={19} />
                </div>
                <Badge tone={t.kind === 'quiz' ? 'info' : 'brand'}>{t.kind}</Badge>
              </div>
              <div>
                <h3 className="font-semibold text-text">{t.name}</h3>
                <p className="text-sm text-muted">{t.description}</p>
              </div>
              <div className="flex flex-wrap gap-1.5 text-xs text-soft">
                <Badge tone="neutral">{t.questionCount} questions</Badge>
                <Badge tone="neutral">{t.settings.timeLimitMinutes ? `${t.settings.timeLimitMinutes}m` : 'No time limit'}</Badge>
                <Badge tone="neutral">{t.settings.maxAttempts} attempts</Badge>
              </div>
              <div className="flex gap-2 border-t border-border pt-3">
                <Button size="sm" icon="plus" className="flex-1" onClick={() => setUseTemplate(t.id)}>Use template</Button>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <Modal open={useTemplate !== null} onClose={() => setUseTemplate(null)} title="Use Template" icon="template" size="sm">
        <TemplateForm
          templateName={templates.find((t) => t.id === useTemplate)?.name ?? ''}
          onDone={(title) => useTemplate && applyTemplate(useTemplate, title)}
        />
      </Modal>
    </div>
  );
}

function TemplateForm({ templateName, onDone }: { templateName: string; onDone: (title: string) => void }) {
  const [title, setTitle] = useState(templateName);
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted">This creates a published assessment from the template configuration, using the most-used active questions from your bank.</p>
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-text">Assessment title</span>
        <input className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-brand-500 focus:outline-none" value={title} onChange={(e) => setTitle(e.target.value)} />
      </label>
      <Button onClick={() => onDone(title.trim())} disabled={!title.trim()}>Create from template</Button>
    </div>
  );
}