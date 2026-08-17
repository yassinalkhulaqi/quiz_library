import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { SUBJECTS, TOPICS } from '../../data/demoData';
import { Badge, Button, Card, CardBody, CardHeader, EmptyState, Icon, Modal, ProgressBar } from '../../components/ui';
import type { IconName } from '../../components/ui';
import { percentage } from '../../lib/scoring';
import { cn } from '../../lib/utils';
import { QuestionCard } from '../questions/QuestionComponents';

const subjectIcons: Record<string, IconName> = {
  shield: 'shield',
  network: 'network',
  code: 'code',
  sigma: 'sigma',
  database: 'database',
};

function useSubjectStats(subjectId: string) {
  const { questions, assessments, attempts, students } = useApp();
  return useMemo(() => {
    const qs = questions.filter((q) => q.subjectId === subjectId);
    const quizCount = assessments.filter((a) => a.subjectId === subjectId && a.kind === 'quiz').length;
    const examCount = assessments.filter((a) => a.subjectId === subjectId && a.kind === 'exam').length;
    const topics = TOPICS.filter((t) => t.subjectId === subjectId);
    const attemptsFor = attempts.filter((a) => {
      const assessment = assessments.find((x) => x.id === a.assessmentId);
      return assessment?.subjectId === subjectId;
    });
    const avg = attemptsFor.length
      ? Math.round(attemptsFor.reduce((s, a) => s + percentage(a.score, a.maxScore), 0) / attemptsFor.length)
      : 0;
    // topic performance
    const topicPerf = topics.map((t) => {
      let correct = 0;
      let total = 0;
      attemptsFor.forEach((a) => {
        const assessment = assessments.find((x) => x.id === a.assessmentId);
        if (!assessment) return;
        assessment.questionIds.forEach((qid) => {
          const q = questions.find((x) => x.id === qid);
          const ans = a.answers.find((x) => x.questionId === qid);
          if (!q || q.topicId !== t.id || !ans) return;
          total += 1;
          if (ans.isCorrect) correct += 1;
        });
      });
      return { id: t.id, name: t.name, pct: total ? Math.round((correct / total) * 100) : 0, total };
    });
    return { qs, quizCount, examCount, avg, topics, topicPerf, studentCount: students.length };
  }, [questions, assessments, attempts, students, subjectId]);
}

export function SubjectsPage() {
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="animate-slide-up">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-text">Subjects</h1>
          <p className="text-sm text-muted">Browse and manage subjects and their topics.</p>
        </div>
        <Button icon="plus" onClick={() => setCreateOpen(true)}>New Subject</Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {SUBJECTS.map((s) => (
          <SubjectCard key={s.id} subject={s} />
        ))}
      </div>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="New Subject" icon="book" size="sm">
        <SubjectForm onDone={() => setCreateOpen(false)} />
      </Modal>
    </div>
  );
}

function SubjectCard({ subject }: { subject: (typeof SUBJECTS)[number] }) {
  const navigate = useNavigate();
  const stats = useSubjectStats(subject.id);
  return (
    <Card className="transition-all hover:shadow-[var(--shadow-md)]">
      <CardBody className="flex flex-col gap-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl text-white" style={{ backgroundColor: subject.color }}>
              <Icon name={subjectIcons[subject.icon] ?? 'book'} size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-text">{subject.name}</h3>
              <p className="text-xs text-soft">{stats.qs.length} questions</p>
            </div>
          </div>
          <Button variant="ghost" size="xs" icon="arrow-right" onClick={() => navigate(`/subjects/${subject.id}`)}>Browse</Button>
        </div>
        <p className="text-sm text-muted">{subject.description}</p>
        <div className="flex gap-2">
          <Badge tone="neutral"><Icon name="questions" size={12} /> {stats.qs.length}</Badge>
          <Badge tone="neutral"><Icon name="quiz" size={12} /> {stats.quizCount}</Badge>
          <Badge tone="neutral"><Icon name="clipboard" size={12} /> {stats.examCount}</Badge>
          <Badge tone={stats.avg >= 70 ? 'success' : stats.avg >= 50 ? 'warning' : 'neutral'}>{stats.avg}% avg</Badge>
        </div>
      </CardBody>
    </Card>
  );
}

function SubjectForm({ onDone }: { onDone: () => void }) {
  const { toast } = useApp();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const colors = ['#6366f1', '#14b8a6', '#f59e0b', '#ef4444', '#38bdf8', '#a78bfa'];
  const [color, setColor] = useState(colors[0]);
  const submit = () => {
    if (!name.trim()) {
      toast('error', 'Subject name is required');
      return;
    }
    toast('success', 'Subject created', `${name.trim()} added. (Demo: subjects are static — the subject is shown in the list on reload.)`);
    onDone();
  };
  return (
    <div className="flex flex-col gap-4">
      <input className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-brand-500 focus:outline-none" placeholder="Subject name" value={name} onChange={(e) => setName(e.target.value)} />
      <textarea className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-brand-500 focus:outline-none" placeholder="Description" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
      <div className="flex gap-2">
        {colors.map((c) => (
          <button key={c} type="button" onClick={() => setColor(c)} className={cn('h-8 w-8 rounded-lg transition-transform', color === c && 'scale-110 ring-2 ring-offset-2 ring-offset-surface ring-white')} style={{ backgroundColor: c }} aria-label={`Color ${c}`} />
        ))}
      </div>
      <Button onClick={submit}>Create Subject</Button>
    </div>
  );
}

export function SubjectDetailPage() {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const { questions } = useApp();
  const subject = SUBJECTS.find((s) => s.id === subjectId);
  const stats = useSubjectStats(subjectId ?? '');
  const [topicFilter, setTopicFilter] = useState('');

  if (!subject) {
    return (
      <EmptyState icon="book" title="Subject not found" description="This subject does not exist." action={<Button onClick={() => navigate('/subjects')}>Back to subjects</Button>} />
    );
  }

  const filteredQs = questions.filter((q) => q.subjectId === subjectId && (!topicFilter || q.topicId === topicFilter));

  return (
    <div className="animate-slide-up">
      <Button variant="ghost" icon="arrow-left" size="sm" onClick={() => navigate('/subjects')} className="mb-4">All subjects</Button>
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl text-white" style={{ backgroundColor: subject.color }}>
            <Icon name={subjectIcons[subject.icon] ?? 'book'} size={26} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-text">{subject.name}</h1>
            <p className="text-sm text-muted">{subject.description}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge tone="neutral">{stats.qs.length} questions</Badge>
          <Badge tone="neutral">{stats.quizCount} quizzes</Badge>
          <Badge tone="neutral">{stats.examCount} exams</Badge>
          <Badge tone="neutral">{stats.studentCount} students</Badge>
        </div>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader title="Topics" subtitle="Performance across attempts" icon={<Icon name="layers" size={18} className="text-brand-500" />} />
          <CardBody className="flex flex-col gap-3">
            {stats.topicPerf.map((t) => (
              <button key={t.id} type="button" onClick={() => setTopicFilter(t.id)} className="text-left">
                <div className="mb-1 flex justify-between text-xs">
                  <span className={cn('font-medium', topicFilter === t.id ? 'text-brand-500' : 'text-text')}>{t.name}</span>
                  <span className="text-soft">{t.total > 0 ? `${t.pct}%` : 'no data'}</span>
                </div>
                <ProgressBar value={t.pct} size="sm" color={t.pct >= 70 ? 'var(--success)' : t.pct >= 50 ? 'var(--warning)' : 'var(--danger)'} />
              </button>
            ))}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Difficulty Distribution" subtitle="Questions in this subject" icon={<Icon name="chart" size={18} className="text-brand-500" />} />
          <CardBody className="flex flex-col gap-3">
            {(['easy', 'medium', 'hard'] as const).map((d) => {
              const count = stats.qs.filter((q) => q.difficulty === d).length;
              const pct = stats.qs.length ? (count / stats.qs.length) * 100 : 0;
              return (
                <div key={d}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="capitalize text-text">{d}</span>
                    <span className="text-soft">{count} questions</span>
                  </div>
                  <ProgressBar value={pct} size="sm" color={d === 'easy' ? 'var(--success)' : d === 'medium' ? 'var(--warning)' : 'var(--danger)'} />
                </div>
              );
            })}
          </CardBody>
        </Card>
      </div>

      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-semibold text-text">Questions in {subject.name}</h2>
        {topicFilter ? <Button variant="ghost" size="xs" onClick={() => setTopicFilter('')}>Clear topic filter</Button> : null}
      </div>
      <div className="flex flex-col gap-3">
        {filteredQs.length === 0 ? (
          <Card><EmptyState icon="questions" title="No questions" description="No questions match this topic yet." /></Card>
        ) : (
          filteredQs.map((q) => (
            <QuestionCard key={q.id} question={q} onPreview={undefined} />
          ))
        )}
      </div>
    </div>
  );
}