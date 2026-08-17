import { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import type { AiGenerationConfig, Question, QuestionType, Difficulty } from '../../types';
import { AI_LEVELS, SUBJECTS, subjectName, topicName, topicsForSubject } from '../../data/demoData';
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  DifficultyBadge,
  Field,
  Icon,
  IconButton,
  Input,
  Modal,
  Select,
  Textarea,
  Toggle,
  TypeBadge,
} from '../../components/ui';
import { createAiService, demoAiService } from '../../services/aiService';
import { cn } from '../../lib/utils';
import { QuestionForm, questionToFormValues } from '../questions/QuestionComponents';

type Stage = 'configure' | 'generating' | 'review';

const DEFAULT_CONFIG: AiGenerationConfig = {
  subjectId: 's_cyber',
  topicId: 't_crypto',
  educationLevel: 'Undergraduate',
  difficulty: 'medium',
  questionType: 'multiple_choice',
  count: 5,
  language: 'en',
  objectives: '',
  includeExplanations: true,
  includeAnswers: true,
  randomizeOptions: true,
};

const GEN_STEPS = ['Analyzing topic', 'Designing questions', 'Reviewing options', 'Finalizing output'];

export function AIStudioPage() {
  const { addQuestions, toast, aiKey, settings, profile } = useApp();
  const [config, setConfig] = useState<AiGenerationConfig>(DEFAULT_CONFIG);
  const [stage, setStage] = useState<Stage>('configure');
  const [generated, setGenerated] = useState<Question[]>([]);
  const [accepted, setAccepted] = useState<Set<string>>(new Set());
  const [edited, setEdited] = useState<Set<string>>(new Set());
  const [editId, setEditId] = useState<string | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [providerLabel, setProviderLabel] = useState<'demo' | 'gemini'>('demo');

  const set = <K extends keyof AiGenerationConfig>(key: K, value: AiGenerationConfig[K]) =>
    setConfig((prev) => ({ ...prev, [key]: value }));

  const topics = useMemo(() => topicsForSubject(config.subjectId), [config.subjectId]);

  const service = useMemo(() => {
    const key = aiKey || (import.meta.env.VITE_GEMINI_API_KEY as string | undefined);
    if (key) return createAiService({ getKey: () => key });
    return demoAiService;
  }, [aiKey]);

  const runGeneration = async (overrides?: Partial<AiGenerationConfig>) => {
    setError(null);
    setStage('generating');
    setStepIndex(0);
    const interval = window.setInterval(() => {
      setStepIndex((i) => (i < GEN_STEPS.length - 1 ? i + 1 : i));
    }, 700);

    try {
      const result = await service.generate({ ...config, ...overrides });
      setProviderLabel(result.provider);
      setGenerated(result.questions);
      setAccepted(new Set(result.questions.map((q) => q.id)));
      setEdited(new Set());
      setStage('review');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Generation failed. Please try again.');
      setStage('configure');
      toast('error', 'AI generation failed', e instanceof Error ? e.message : 'Unknown error');
    } finally {
      window.clearInterval(interval);
    }
  };

  const regenerateOne = async (q: Question) => {
    const result = await service.generate({
      ...config,
      count: 1,
      objectives: q.text,
    });
    const fresh = result.questions[0];
    setGenerated((prev) => prev.map((item) => (item.id === q.id ? fresh : item)));
    setEdited((prev) => new Set(prev).add(q.id));
    toast('info', 'Question regenerated');
  };

  const saveAll = () => {
    const selected = generated.filter((q) => accepted.has(q.id));
    const saved = selected.map((q) => ({ ...q, status: 'active' as const, author: profile.name }));
    addQuestions(saved);
    toast('success', `${saved.length} questions added to the Question Bank`);
    setStage('configure');
    setGenerated([]);
  };

  const toggleAccept = (id: string) => {
    setAccepted((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const acceptCount = generated.filter((q) => accepted.has(q.id)).length;

  return (
    <div className="animate-slide-up">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold text-text">
            <Icon name="sparkles" className="text-accent-500" /> AI Studio
          </h1>
          <p className="text-sm text-muted">Generate high-quality assessment questions in seconds.</p>
        </div>
        <div className="flex items-center gap-2">
          {providerLabel === 'gemini' ? (
            <Badge tone="success">Gemini · live AI</Badge>
          ) : (
            <Badge tone="warning" className="gap-1.5">
              <Icon name="alert" size={12} /> Demo mode — mock AI
            </Badge>
          )}
        </div>
      </div>

      {error ? (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3">
          <Icon name="alert" className="text-danger" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-danger">Generation failed</p>
            <p className="text-xs text-muted">{error}</p>
          </div>
        </div>
      ) : null}

      {stage === 'configure' ? (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader title="Generation Settings" subtitle="Configure the questions you want to create" icon={<Icon name="settings" size={18} />} />
            <CardBody className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Subject">
                  <Select value={config.subjectId} onChange={(e) => set('subjectId', e.target.value)}>
                    {SUBJECTS.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </Select>
                </Field>
                <Field label="Topic">
                  <Select value={config.topicId} onChange={(e) => set('topicId', e.target.value)}>
                    {topics.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </Select>
                </Field>
                <Field label="Educational level">
                  <Select value={config.educationLevel} onChange={(e) => set('educationLevel', e.target.value)}>
                    {AI_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                  </Select>
                </Field>
                <Field label="Difficulty">
                  <Select value={config.difficulty} onChange={(e) => set('difficulty', e.target.value as Difficulty)}>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </Select>
                </Field>
                <Field label="Question type">
                  <Select value={config.questionType} onChange={(e) => set('questionType', e.target.value as QuestionType)}>
                    <option value="multiple_choice">Multiple Choice</option>
                    <option value="multiple_select">Multiple Select</option>
                    <option value="true_false">True / False</option>
                    <option value="short_answer">Short Answer</option>
                    <option value="fill_blank">Fill in the Blank</option>
                    <option value="essay">Essay</option>
                  </Select>
                </Field>
                <Field label="Number of questions">
                  <Input
                    type="number"
                    min={1}
                    max={20}
                    value={config.count}
                    onChange={(e) => set('count', Math.max(1, Math.min(20, Number(e.target.value))))}
                  />
                </Field>
                <Field label="Language">
                  <Select value={config.language} onChange={(e) => set('language', e.target.value as 'en' | 'ar')}>
                    <option value="en">English</option>
                    <option value="ar">Arabic</option>
                  </Select>
                </Field>
              </div>

              <Field label="Learning objectives" hint="Optional — tell the AI what students should be able to do.">
                <Textarea
                  value={config.objectives}
                  onChange={(e) => set('objectives', e.target.value)}
                  placeholder="e.g. Identify the key properties of modern hash functions…"
                  rows={2}
                />
              </Field>

              <div className="grid grid-cols-1 gap-3 border-t border-border pt-4 sm:grid-cols-3">
                <Toggle checked={config.includeExplanations} onChange={(v) => set('includeExplanations', v)} label="Explanations" description="Include rationale for each answer" />
                <Toggle checked={config.includeAnswers} onChange={(v) => set('includeAnswers', v)} label="Answers" description="Mark the correct answers" />
                <Toggle checked={config.randomizeOptions} onChange={(v) => set('randomizeOptions', v)} label="Randomize options" description="Shuffle option order" />
              </div>
            </CardBody>
          </Card>

          <Card className="self-start">
            <CardHeader title="Ready to generate" subtitle={`${config.count} × ${topicName(config.topicId)}`} icon={<Icon name="sparkles" size={18} />} />
            <CardBody className="flex flex-col gap-4">
              <div className="rounded-lg border border-border bg-elevated p-3 text-sm text-muted">
                <p className="mb-1 font-semibold text-text">{subjectName(config.subjectId)} → {topicName(config.topicId)}</p>
                <p className="text-xs">Level: {config.educationLevel} · {config.difficulty} · {config.questionType.replace('_', ' ')}</p>
              </div>
              <Button
                icon="sparkles"
                size="lg"
                onClick={() => runGeneration()}
                disabled={!config.topicId}
              >
                Generate Questions
              </Button>
              <p className="text-xs leading-relaxed text-soft">
                {aiKey || settings.aiProvider === 'gemini'
                  ? 'Connected to Google Gemini. Your key is held in memory only and never stored.'
                  : 'No API key configured — running in demo mode. Add a Gemini key in Settings → AI Settings to enable live generation.'}
              </p>
            </CardBody>
          </Card>
        </div>
      ) : null}

      {stage === 'generating' ? (
        <Card className="mx-auto max-w-xl">
          <CardBody className="flex flex-col items-center gap-5 py-12">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 text-white">
              <Icon name="sparkles" size={26} className="animate-pulse" />
            </div>
            <div className="w-full max-w-sm">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-semibold text-text">{GEN_STEPS[stepIndex]}…</p>
                <span className="text-xs text-soft">{Math.round((stepIndex / GEN_STEPS.length) * 100)}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-elevated">
                <div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-accent-500 transition-all duration-700" style={{ width: `${((stepIndex + 1) / GEN_STEPS.length) * 100}%` }} />
              </div>
            </div>
            <p className="text-xs text-soft">This usually takes a few seconds.</p>
          </CardBody>
        </Card>
      ) : null}

      {stage === 'review' ? (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Icon name="check" className="text-success" />
              <div>
                <p className="text-sm font-semibold text-text">{generated.length} questions generated</p>
                <p className="text-xs text-muted">
                  {providerLabel === 'gemini' ? 'Live Gemini output' : 'Demo output — review carefully before saving'} · {acceptCount} selected
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" icon="refresh" size="sm" onClick={() => runGeneration()}>Regenerate all</Button>
              <Button icon="check" size="sm" onClick={saveAll} disabled={acceptCount === 0}>
                Save {acceptCount} to Question Bank
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {generated.map((q, i) => {
              const isAccepted = accepted.has(q.id);
              const isEdited = edited.has(q.id);
              return (
                <Card key={q.id} className={cn('transition-colors', isAccepted ? '' : 'opacity-60')}>
                  <CardBody>
                    <div className="flex items-start gap-3">
                      <button
                        type="button"
                        onClick={() => toggleAccept(q.id)}
                        aria-label={isAccepted ? 'Reject question' : 'Accept question'}
                        className={cn(
                          'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition-all',
                          isAccepted ? 'border-success bg-success text-white' : 'border-border bg-elevated text-soft hover:border-success'
                        )}
                      >
                        <Icon name="check" size={14} />
                      </button>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-brand-500/10 text-xs font-bold text-brand-500">{i + 1}</span>
                          <TypeBadge type={q.type} />
                          <DifficultyBadge difficulty={q.difficulty} />
                          <Badge tone="neutral">{q.points} pts</Badge>
                          {isEdited ? <Badge tone="info">edited</Badge> : null}
                        </div>
                        <p className="mt-2 text-sm font-medium leading-relaxed text-text">{q.text}</p>
                        {q.options.length > 0 ? (
                          <div className="mt-3 flex flex-col gap-1.5">
                            {q.options.map((o) => (
                              <div key={o.id} className="flex items-center gap-2 text-sm text-muted">
                                <span className={cn('h-2 w-2 rounded-full', q.correctAnswer.includes(o.id) ? 'bg-success' : 'bg-soft/40')} />
                                {o.text}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="mt-2 text-xs text-soft">
                            {q.type === 'essay' ? 'Essay response.' : `Accepted: ${q.correctAnswer.join(', ')}`}
                          </p>
                        )}
                        {q.explanation ? (
                          <p className="mt-2 rounded-md bg-elevated px-3 py-2 text-xs leading-relaxed text-muted">
                            <span className="font-semibold text-accent-500">Explanation: </span>{q.explanation}
                          </p>
                        ) : null}
                      </div>
                      <div className="flex shrink-0 flex-col gap-1">
                        <IconButton icon="pencil" label="Edit question" onClick={() => setEditId(q.id)} />
                        <IconButton icon="refresh" label="Regenerate this question" onClick={() => regenerateOne(q)} />
                      </div>
                    </div>
                  </CardBody>
                </Card>
              );
            })}
          </div>
        </div>
      ) : null}

      {editId ? (
        <EditQuestionModal
          question={generated.find((q) => q.id === editId)!}
          onClose={() => setEditId(null)}
          onSave={(updated) => {
            setGenerated((prev) => prev.map((q) => (q.id === updated.id ? updated : q)));
            setEdited((prev) => new Set(prev).add(updated.id));
            setEditId(null);
            toast('success', 'Question updated');
          }}
        />
      ) : null}
    </div>
  );
}

function EditQuestionModal({
  question,
  onClose,
  onSave,
}: {
  question: Question;
  onClose: () => void;
  onSave: (q: Question) => void;
}) {
  return (
    <Modal open onClose={onClose} title="Edit Generated Question" icon="pencil" size="lg">
      <QuestionForm
        initial={questionToFormValues(question)}
        onCancel={onClose}
        submitLabel="Save question"
        onSubmit={(v) => {
          onSave({
            ...question,
            text: v.text.trim(),
            options: v.options.filter((o) => o.text.trim()).map((o) => ({ id: o.id, text: o.text.trim() })),
            correctAnswer: v.type === 'short_answer' || v.type === 'fill_blank'
              ? v.acceptedAnswers.filter((a) => a.trim())
              : v.options.filter((o) => o.correct).map((o) => o.id),
            explanation: v.explanation.trim() || undefined,
            type: v.type,
            difficulty: v.difficulty,
            points: v.points,
            estimatedSeconds: v.estimatedSeconds,
            tags: v.tags.split(',').map((t) => t.trim()).filter(Boolean),
            subjectId: v.subjectId,
            topicId: v.topicId,
            updatedAt: Date.now(),
          });
        }}
      />
    </Modal>
  );
}