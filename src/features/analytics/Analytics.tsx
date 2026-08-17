import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { SUBJECTS, topicName } from '../../data/demoData';
import { percentage, gradeAnswer } from '../../lib/scoring';
import { Badge, Button, Card, CardBody, CardHeader, DifficultyBadge, Icon, ProgressBar, Select, Tabs } from '../../components/ui';
import { BarChart, DonutChart, LineChart } from './charts';
import { cn } from '../../lib/utils';
import type { Question } from '../../types';

type InsightTone = 'danger' | 'warning' | 'info' | 'success';
interface Insight {
  tone: InsightTone;
  text: string;
}

export function AnalyticsPage() {
  const { attempts, assessments, questions, profile } = useApp();
  const [subjectFilter, setSubjectFilter] = useState('');
  const [tab, setTab] = useState('overview');
  const navigate = useNavigate();

  const submitted = useMemo(() => attempts.filter((a) => a.status === 'submitted'), [attempts]);

  const isStudent = profile.role === 'student';
  const myAttempts = useMemo(() => {
    const mine = isStudent ? submitted.filter((a) => a.studentId === profile.email || a.studentId === 'me') : submitted;
    if (!subjectFilter) return mine;
    return mine.filter((a) => {
      const assessment = assessments.find((x) => x.id === a.assessmentId);
      return assessment?.subjectId === subjectFilter;
    });
  }, [submitted, subjectFilter, assessments, isStudent, profile.email]);
  const activeAttempts = myAttempts;

  const stats = useMemo(() => {
    const avg = activeAttempts.length ? Math.round(activeAttempts.reduce((s, a) => s + percentage(a.score, a.maxScore), 0) / activeAttempts.length) : 0;
    return { total: activeAttempts.length, avg, completion: 100 };
  }, [activeAttempts]);

  const scoreDistribution = useMemo(() => {
    const buckets = [
      { label: '0–40', min: 0, max: 40, count: 0 },
      { label: '41–60', min: 41, max: 60, count: 0 },
      { label: '61–80', min: 61, max: 80, count: 0 },
      { label: '81–100', min: 81, max: 100, count: 0 },
    ];
    activeAttempts.forEach((a) => {
      const p = percentage(a.score, a.maxScore);
      buckets.forEach((b) => {
        if (p >= b.min && p <= b.max) b.count += 1;
      });
    });
    return buckets.map((b) => ({ label: b.label, value: b.count }));
  }, [activeAttempts]);

  const perTopic = useMemo(() => {
    const map = new Map<string, { correct: number; total: number }>();
    activeAttempts.forEach((a) => {
      const assessment = assessments.find((x) => x.id === a.assessmentId);
      if (!assessment) return;
      const qs = assessment.questionIds.map((id) => questions.find((q) => q.id === id)).filter((q): q is Question => Boolean(q));
      qs.forEach((q) => {
        const ans = a.answers.find((x) => x.questionId === q.id);
        if (!ans) return;
        const cur = map.get(q.topicId) ?? { correct: 0, total: 0 };
        cur.total += 1;
        if (gradeAnswer(q, ans) > 0) cur.correct += 1;
        map.set(q.topicId, cur);
      });
    });
    return [...map.entries()].map(([id, v]) => ({ id, name: topicName(id), pct: v.total ? Math.round((v.correct / v.total) * 100) : 0, total: v.total })).sort((a, b) => a.pct - b.pct);
  }, [activeAttempts, assessments, questions]);

  const questionStats = useMemo(() => {
    const map = new Map<string, { correct: number; total: number; q: Question }>();
    activeAttempts.forEach((a) => {
      const assessment = assessments.find((x) => x.id === a.assessmentId);
      if (!assessment) return;
      assessment.questionIds.forEach((qid) => {
        const q = questions.find((x) => x.id === qid);
        const ans = a.answers.find((x) => x.questionId === qid);
        if (!q || !ans) return;
        const cur = map.get(qid) ?? { correct: 0, total: 0, q };
        cur.total += 1;
        if (gradeAnswer(q, ans) > 0) cur.correct += 1;
        map.set(qid, cur);
      });
    });
    return [...map.values()].map((v) => ({ ...v, pct: v.total ? Math.round((v.correct / v.total) * 100) : 0 }));
  }, [activeAttempts, assessments, questions]);

  const mostMissed = useMemo(() => questionStats.filter((q) => q.pct < 60).sort((a, b) => a.pct - b.pct).slice(0, 5), [questionStats]);

  const progressOverTime = useMemo(() => {
    const byDay = new Map<string, { correct: number; total: number }>();
    activeAttempts.forEach((a) => {
      if (!a.submittedAt) return;
      const day = new Date(a.submittedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      const cur = byDay.get(day) ?? { correct: 0, total: 0 };
      cur.total += a.answers.length;
      cur.correct += a.answers.filter((x) => x.isCorrect).length;
      byDay.set(day, cur);
    });
    return [...byDay.entries()].map(([label, v]) => ({ label, value: v.total ? Math.round((v.correct / v.total) * 100) : 0 }));
  }, [activeAttempts]);

  const insights = useMemo(() => {
    const list: Insight[] = [];
    if (perTopic.length > 0 && perTopic[0].pct < 50) {
      list.push({ tone: 'danger', text: `Students struggle most with "${perTopic[0].name}" at only ${perTopic[0].pct}% accuracy. Consider a dedicated review session.` });
    }
    const failed = questionStats.filter((q) => q.pct < 40);
    if (failed.length > 0) {
      list.push({ tone: 'warning', text: `${failed.length} question${failed.length > 1 ? 's have' : ' has'} an unusually high failure rate (under 40%). They may be ambiguous or too difficult.` });
    }
    const tooEasy = questionStats.filter((q) => q.pct > 95);
    if (tooEasy.length > 0) {
      list.push({ tone: 'info', text: `${tooEasy.length} question${tooEasy.length > 1 ? 's were' : ' was'} answered correctly by nearly everyone — they may be too easy to differentiate.` });
    }
    const improved = activeAttempts.filter((a) => a.status === 'submitted');
    if (improved.length > 0 && perTopic.length > 0 && perTopic[0].pct >= 50) {
      list.push({ tone: 'success', text: 'Students are performing above the pass threshold on most topics after repeated attempts — the practice loop is working.' });
    }
    if (list.length === 0) {
      list.push({ tone: 'info', text: 'Not enough data yet. More attempts will unlock deeper insights.' });
    }
    return list;
  }, [perTopic, questionStats, activeAttempts]);

  const difficultyMix = useMemo(() => {
    const counts: Record<string, number> = { easy: 0, medium: 0, hard: 0 };
    activeAttempts.forEach((a) => {
      const assessment = assessments.find((x) => x.id === a.assessmentId);
      if (!assessment) return;
      assessment.questionIds.forEach((qid) => {
        const q = questions.find((x) => x.id === qid);
        if (q && a.answers.some((ans) => ans.questionId === qid)) counts[q.difficulty] += 1;
      });
    });
    return [
      { label: 'Easy', value: counts.easy, color: 'var(--success)' },
      { label: 'Medium', value: counts.medium, color: 'var(--warning)' },
      { label: 'Hard', value: counts.hard, color: 'var(--danger)' },
    ];
  }, [activeAttempts, assessments, questions]);

  const avgLineData = useMemo(() => {
    const byAssessment = new Map<string, { score: number; max: number; title: string }>();
    activeAttempts.forEach((a) => {
      const assessment = assessments.find((x) => x.id === a.assessmentId);
      if (!assessment) return;
      const cur = byAssessment.get(a.assessmentId) ?? { score: 0, max: 0, title: assessment.title };
      cur.score += a.score;
      cur.max += a.maxScore;
      byAssessment.set(a.assessmentId, cur);
    });
    return [...byAssessment.values()].map((v) => ({ label: v.title.split(' ').slice(0, 2).join(' '), value: v.max ? Math.round((v.score / v.max) * 100) : 0 }));
  }, [activeAttempts, assessments]);

  return (
    <div className="animate-slide-up">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-text">Analytics</h1>
          <p className="text-sm text-muted">{isStudent ? 'Your learning performance' : 'Across your assessments'}</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)} className="w-44">
            <option value="">All subjects</option>
            {SUBJECTS.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </Select>
        </div>
      </div>

      <div className="mb-4">
        <Tabs
          tabs={[
            { id: 'overview', label: 'Overview' },
            { id: 'questions', label: 'Questions' },
            { id: 'insights', label: 'AI Insights' },
          ]}
          active={tab}
          onChange={setTab}
        />
      </div>

      {tab === 'overview' ? (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <MetricCard icon="clipboard" label="Assessments" value={String(stats.total)} />
            <MetricCard icon="award" label="Average score" value={`${stats.avg}%`} tone="text-accent-500" />
            <MetricCard icon="trending-up" label="Completion" value="100%" />
            <MetricCard icon="book" label="Topics analyzed" value={String(perTopic.length)} />
          </div>

          <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader title="Progress Over Time" subtitle="Accuracy per day" icon={<Icon name="trending-up" size={18} className="text-brand-500" />} />
              <CardBody><LineChart data={progressOverTime} height={220} /></CardBody>
            </Card>
            <Card>
              <CardHeader title="Score Distribution" icon={<Icon name="chart" size={18} className="text-brand-500" />} />
              <CardBody><BarChart data={scoreDistribution} height={200} /></CardBody>
            </Card>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
            <Card>
              <CardHeader title="Topic Performance" icon={<Icon name="layers" size={18} className="text-brand-500" />} />
              <CardBody className="flex flex-col gap-3">
                {perTopic.map((t) => (
                  <div key={t.id}>
                    <div className="mb-1 flex justify-between text-xs">
                      <span className="font-medium text-text">{t.name}</span>
                      <span className={cn('font-semibold', t.pct < 50 ? 'text-danger' : t.pct < 70 ? 'text-warning' : 'text-success')}>{t.pct}%</span>
                    </div>
                    <ProgressBar value={t.pct} size="sm" color={t.pct < 50 ? 'var(--danger)' : t.pct < 70 ? 'var(--warning)' : 'var(--success)'} />
                  </div>
                ))}
                {perTopic.length === 0 ? <p className="text-sm text-soft">No data.</p> : null}
              </CardBody>
            </Card>
            <Card>
              <CardHeader title="Assessment Averages" icon={<Icon name="clipboard" size={18} className="text-brand-500" />} />
              <CardBody><BarChart data={avgLineData} height={200} /></CardBody>
            </Card>
            <Card>
              <CardHeader title="Difficulty Mix" icon={<Icon name="sigma" size={18} className="text-brand-500" />} />
              <CardBody>
                <DonutChart data={difficultyMix} centerValue={String(difficultyMix.reduce((s, d) => s + d.value, 0))} centerLabel="answered" size={140} />
              </CardBody>
            </Card>
          </div>
        </>
      ) : null}

      {tab === 'questions' ? (
        <Card>
          <CardHeader title="Question Analytics" subtitle="Success rate across attempts" icon={<Icon name="questions" size={18} className="text-brand-500" />} />
          <CardBody className="flex flex-col gap-3">
            {questionStats.length === 0 ? (
              <p className="text-sm text-soft">No question-level data yet.</p>
            ) : (
              questionStats.slice(0, 20).map((qs) => (
                <div key={qs.q.id} className="flex items-center gap-3 rounded-lg border border-border bg-elevated p-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-500/10 text-brand-500">
                    <Icon name="questions" size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-text">{qs.q.text}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <ProgressBar value={qs.pct} size="sm" className="max-w-xs" color={qs.pct < 40 ? 'var(--danger)' : qs.pct < 70 ? 'var(--warning)' : 'var(--success)'} />
                      <span className="text-xs text-soft">{qs.pct}% · {qs.total} attempts</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <DifficultyBadge difficulty={qs.q.difficulty} />
                  </div>
                </div>
              ))
            )}
          </CardBody>
        </Card>
      ) : null}

      {tab === 'insights' ? (
        <Card>
          <CardHeader title="AI Insights" subtitle="Actionable signals from your data" icon={<Icon name="sparkles" size={18} className="text-accent-500" />} />
          <CardBody className="flex flex-col gap-3">
            {insights.map((ins, i) => (
              <div key={i} className={cn('flex items-start gap-3 rounded-xl border p-4', ins.tone === 'danger' ? 'border-danger/30 bg-danger/8' : ins.tone === 'warning' ? 'border-warning/30 bg-warning/8' : ins.tone === 'success' ? 'border-success/30 bg-success/8' : 'border-info/30 bg-info/8')}>
                <Icon name={ins.tone === 'danger' ? 'alert' : ins.tone === 'warning' ? 'warning' : ins.tone === 'success' ? 'check' : 'info'} className={ins.tone === 'danger' ? 'text-danger' : ins.tone === 'warning' ? 'text-warning' : ins.tone === 'success' ? 'text-success' : 'text-info'} size={18} />
                <p className="text-sm leading-relaxed text-text">{ins.text}</p>
              </div>
            ))}
            <div className="mt-2">
              <Button variant="outline" icon="target" size="sm" onClick={() => navigate('/ai-studio')}>Address weak topics in AI Studio</Button>
            </div>
          </CardBody>
        </Card>
      ) : null}

      {tab === 'insights' && mostMissed.length > 0 ? (
        <Card className="mt-5">
          <CardHeader title="Most Missed Questions" icon={<Icon name="target" size={18} className="text-danger" />} />
          <CardBody className="flex flex-col gap-2">
            {mostMissed.map((q) => (
              <div key={q.q.id} className="flex items-center justify-between rounded-lg border border-border bg-elevated px-3 py-2">
                <p className="truncate text-sm text-text">{q.q.text}</p>
                <Badge tone="danger">{100 - q.pct}% missed</Badge>
              </div>
            ))}
          </CardBody>
        </Card>
      ) : null}
    </div>
  );
}

function MetricCard({ icon, label, value, tone = 'text-brand-500' }: { icon: 'clipboard' | 'award' | 'trending-up' | 'book'; label: string; value: string; tone?: string }) {
  return (
    <Card>
      <CardBody className="flex items-center gap-3">
        <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl bg-elevated', tone)}>
          <Icon name={icon} size={18} />
        </div>
        <div>
          <p className="text-lg font-bold text-text">{value}</p>
          <p className="text-xs text-soft">{label}</p>
        </div>
      </CardBody>
    </Card>
  );
}