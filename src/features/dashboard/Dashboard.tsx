import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { subjectById, topicName } from '../../data/demoData';
import { Button, Card, CardBody, CardHeader, Icon, ProgressBar } from '../../components/ui';
import { LineChart, DonutChart, ChartLegend, BarChart } from '../analytics/charts';
import { Avatar } from '../../components/ui';
import { percentage } from '../../lib/scoring';
import { cn, timeAgo } from '../../lib/utils';

export function DashboardPage() {
  const { profile } = useApp();
  return profile.role === 'student' ? <StudentDashboard /> : <TeacherDashboard />;
}

function StatCard({ icon, label, value, sub, tone = 'text-brand-500' }: { icon: 'questions' | 'quiz' | 'clipboard' | 'users' | 'chart' | 'sparkles' | 'award' | 'trending-up' | 'check' | 'book'; label: string; value: string; sub?: string; tone?: string }) {
  return (
    <Card className="transition-all hover:shadow-[var(--shadow-md)]">
      <CardBody className="flex items-center gap-4">
        <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-elevated', tone)}>
          <Icon name={icon} size={20} />
        </div>
        <div className="min-w-0">
          <p className="truncate text-xl font-bold text-text">{value}</p>
          <p className="truncate text-xs text-soft">{label}</p>
          {sub ? <p className="truncate text-[11px] text-muted">{sub}</p> : null}
        </div>
      </CardBody>
    </Card>
  );
}

function TeacherDashboard() {
  const { questions, assessments, attempts, students, activity, profile } = useApp();
  const navigate = useNavigate();

  const stats = useMemo(() => {
    const quizzes = assessments.filter((a) => a.kind === 'quiz');
    const exams = assessments.filter((a) => a.kind === 'exam');
    const submitted = attempts.filter((a) => a.status === 'submitted');
    const avg = submitted.length
      ? Math.round(submitted.reduce((s, a) => s + percentage(a.score, a.maxScore), 0) / submitted.length)
      : 0;
    return { quizzes: quizzes.length, exams: exams.length, students: students.length, avg };
  }, [assessments, attempts, students]);

  // Per-subject performance from all attempts
  const subjectPerformance = useMemo(() => {
    const map = new Map<string, { correct: number; total: number; color: string }>();
    attempts
      .filter((a) => a.status === 'submitted')
      .forEach((a) => {
        const assessment = assessments.find((x) => x.id === a.assessmentId);
        if (!assessment) return;
        const qs = assessment.questionIds.map((id) => questions.find((q) => q.id === id)).filter((q): q is NonNullable<typeof q> => Boolean(q));
        qs.forEach((q) => {
          const ans = a.answers.find((x) => x.questionId === q.id);
          if (!ans) return;
          const s = subjectById(q.subjectId);
          const key = s?.name ?? 'Other';
          const cur = map.get(key) ?? { correct: 0, total: 0, color: s?.color ?? 'var(--brand-500)' };
          cur.total += 1;
          if (ans.isCorrect) cur.correct += 1;
          map.set(key, cur);
        });
      });
    return [...map.entries()].map(([name, v]) => ({ name, pct: v.total ? Math.round((v.correct / v.total) * 100) : 0, total: v.total, color: v.color }));
  }, [attempts, assessments, questions]);

  // Weak topics
  const weakTopics = useMemo(() => {
    const map = new Map<string, { correct: number; total: number; name: string }>();
    attempts
      .filter((a) => a.status === 'submitted')
      .forEach((a) => {
        const assessment = assessments.find((x) => x.id === a.assessmentId);
        if (!assessment) return;
        const qs = assessment.questionIds.map((id) => questions.find((q) => q.id === id)).filter((q): q is NonNullable<typeof q> => Boolean(q));
        qs.forEach((q) => {
          const ans = a.answers.find((x) => x.questionId === q.id);
          if (!ans) return;
          const cur = map.get(q.topicId) ?? { correct: 0, total: 0, name: topicName(q.topicId) };
          cur.total += 1;
          if (ans.isCorrect) cur.correct += 1;
          map.set(q.topicId, cur);
        });
      });
    return [...map.entries()]
      .map(([id, v]) => ({ id, name: v.name, pct: v.total ? Math.round((v.correct / v.total) * 100) : 0, total: v.total }))
      .filter((t) => t.total > 0)
      .sort((a, b) => a.pct - b.pct)
      .slice(0, 4);
  }, [attempts, assessments, questions]);

  const upcoming = useMemo(
    () =>
      assessments
        .filter((a) => a.status === 'published' && a.settings.availableUntil && a.settings.availableUntil > Date.now())
        .sort((a, b) => (a.settings.availableUntil ?? 0) - (b.settings.availableUntil ?? 0))
        .slice(0, 3),
    [assessments]
  );

  const studentRanking = useMemo(() => {
    const map = new Map<string, { name: string; color: string; score: number; max: number }>();
    attempts
      .filter((a) => a.status === 'submitted')
      .forEach((a) => {
        const st = students.find((s) => s.id === a.studentId) ?? students[0];
        const cur = map.get(a.studentId) ?? { name: st.name, color: st.avatarColor, score: 0, max: 0 };
        cur.score += a.score;
        cur.max += a.maxScore;
        map.set(a.studentId, cur);
      });
    return [...map.values()].map((v) => ({ ...v, pct: v.max ? Math.round((v.score / v.max) * 100) : 0 })).sort((a, b) => b.pct - a.pct).slice(0, 5);
  }, [attempts, students]);

  const progressData = useMemo(() => {
    const byDay = new Map<string, { correct: number; total: number }>();
    attempts
      .filter((a) => a.status === 'submitted' && a.submittedAt)
      .forEach((a) => {
        const day = new Date(a.submittedAt!).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        const cur = byDay.get(day) ?? { correct: 0, total: 0 };
        cur.total += a.answers.length;
        cur.correct += a.answers.filter((x) => x.isCorrect).length;
        byDay.set(day, cur);
      });
    return [...byDay.entries()].map(([label, v]) => ({ label, value: v.total ? Math.round((v.correct / v.total) * 100) : 0 }));
  }, [attempts]);

  return (
    <div className="animate-slide-up">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-text">Welcome back, {profile.name.split(' ')[0]}</h1>
          <p className="text-sm text-muted">Here's what's happening across your assessments today.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" icon="sparkles" onClick={() => navigate('/ai-studio')}>Generate with AI</Button>
          <Button icon="plus" onClick={() => navigate('/quizzes/new')}>New Quiz</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon="questions" label="Questions" value={String(questions.length)} sub="in your bank" />
        <StatCard icon="quiz" label="Quizzes" value={String(stats.quizzes)} sub={`${assessments.filter((a) => a.kind === 'quiz' && a.status === 'published').length} published`} />
        <StatCard icon="clipboard" label="Exams" value={String(stats.exams)} sub={`${assessments.filter((a) => a.kind === 'exam' && a.status === 'published').length} published`} />
        <StatCard icon="award" label="Avg score" value={`${stats.avg}%`} sub="across all attempts" tone="text-accent-500" />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Student Performance Trend" subtitle="Average score per day" icon={<Icon name="trending-up" size={18} className="text-brand-500" />} />
          <CardBody>
            <LineChart data={progressData} height={220} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Students" subtitle="Top performers" icon={<Icon name="users" size={18} className="text-brand-500" />} />
          <CardBody className="flex flex-col gap-3">
            {studentRanking.length === 0 ? (
              <p className="text-sm text-soft">No submissions yet.</p>
            ) : (
              studentRanking.map((s, i) => (
                <div key={s.name} className="flex items-center gap-3">
                  <span className="w-4 text-xs font-bold text-soft">{i + 1}</span>
                  <Avatar name={s.name} color={s.color} size={30} />
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between">
                      <p className="truncate text-xs font-semibold text-text">{s.name}</p>
                      <span className="text-xs text-soft">{s.pct}%</span>
                    </div>
                    <ProgressBar value={s.pct} size="sm" className="mt-1" color={s.pct >= 70 ? 'var(--success)' : 'var(--warning)'} />
                  </div>
                </div>
              ))
            )}
            <Button variant="ghost" size="sm" onClick={() => navigate('/students')} iconRight="arrow-right">View all students</Button>
          </CardBody>
        </Card>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card>
          <CardHeader title="Performance by Subject" icon={<Icon name="book" size={18} className="text-brand-500" />} />
          <CardBody>
            <BarChart data={subjectPerformance.map((s) => ({ label: s.name.split(' ')[0], value: s.pct, color: s.color }))} height={200} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Weak Topics" subtitle="Areas needing attention" icon={<Icon name="target" size={18} className="text-danger" />} />
          <CardBody className="flex flex-col gap-3">
            {weakTopics.map((t) => (
              <div key={t.id}>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="font-medium text-text">{t.name}</span>
                  <span className={cn('font-semibold', t.pct < 50 ? 'text-danger' : 'text-warning')}>{t.pct}%</span>
                </div>
                <ProgressBar value={t.pct} size="sm" color={t.pct < 50 ? 'var(--danger)' : 'var(--warning)'} />
              </div>
            ))}
            {weakTopics.length === 0 ? <p className="text-sm text-soft">No data yet.</p> : null}
            <Button variant="ghost" size="sm" onClick={() => navigate('/ai-studio')} iconRight="arrow-right">Generate practice for these</Button>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Upcoming Assessments" icon={<Icon name="clock" size={18} className="text-brand-500" />} />
          <CardBody className="flex flex-col gap-3">
            {upcoming.length === 0 ? (
              <p className="text-sm text-soft">No upcoming assessments.</p>
            ) : (
              upcoming.map((a) => (
                <button key={a.id} onClick={() => navigate(`/${a.kind === 'quiz' ? 'quizzes' : 'exams'}/${a.id}`)} className="flex items-center justify-between rounded-lg border border-border bg-elevated px-3 py-2.5 text-left transition-colors hover:border-brand-400">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-text">{a.title}</p>
                    <p className="text-[11px] text-soft">{subjectById(a.subjectId)?.name}</p>
                  </div>
                  <Icon name="arrow-right" size={15} className="shrink-0 text-soft" />
                </button>
              ))
            )}
            <Button variant="ghost" size="sm" onClick={() => navigate('/quizzes')} iconRight="arrow-right">View all</Button>
          </CardBody>
        </Card>
      </div>

      <Card className="mt-5">
        <CardHeader title="Recent Activity" icon={<Icon name="activity" size={18} className="text-brand-500" />} action={<Button variant="ghost" size="xs" onClick={() => navigate('/activity')}>View all</Button>} />
        <CardBody className="flex flex-col divide-y divide-border/60">
          {activity.slice(0, 5).map((a) => (
            <div key={a.id} className="flex items-center gap-3 py-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-elevated text-brand-500">
                <Icon name={a.type === 'ai_generated' ? 'sparkles' : a.type === 'exam_submitted' ? 'clipboard' : a.type === 'quiz_created' ? 'quiz' : 'activity'} size={14} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-text">{a.title}</p>
                <p className="truncate text-xs text-soft">{a.description}</p>
              </div>
              <span className="shrink-0 text-[11px] text-soft">{timeAgo(a.createdAt)}</span>
            </div>
          ))}
        </CardBody>
      </Card>
    </div>
  );
}

function StudentDashboard() {
  const { attempts, assessments, questions, profile } = useApp();
  const navigate = useNavigate();

  const myAttempts = useMemo(() => attempts.filter((a) => a.studentId === profile.email || a.studentId === 'me'), [attempts, profile.email]);

  const stats = useMemo(() => {
    const submitted = myAttempts.filter((a) => a.status === 'submitted');
    const avg = submitted.length ? Math.round(submitted.reduce((s, a) => s + percentage(a.score, a.maxScore), 0) / submitted.length) : 0;
    const subjects = new Set(submitted.map((a) => assessments.find((x) => x.id === a.assessmentId)?.subjectId).filter(Boolean));
    return { completed: submitted.length, avg, subjects: subjects.size, best: submitted.length ? Math.max(...submitted.map((a) => percentage(a.score, a.maxScore))) : 0 };
  }, [myAttempts, assessments]);

  const available = useMemo(() => assessments.filter((a) => a.status === 'published' && a.kind === 'quiz'), [assessments]);

  const performance = useMemo(() => {
    const map = new Map<string, { correct: number; total: number; color: string }>();
    myAttempts
      .filter((a) => a.status === 'submitted')
      .forEach((a) => {
        const assessment = assessments.find((x) => x.id === a.assessmentId);
        if (!assessment) return;
        const qs = assessment.questionIds.map((id) => questions.find((q) => q.id === id)).filter((q): q is NonNullable<typeof q> => Boolean(q));
        qs.forEach((q) => {
          const ans = a.answers.find((x) => x.questionId === q.id);
          if (!ans) return;
          const s = subjectById(q.subjectId);
          const key = s?.name ?? 'Other';
          const cur = map.get(key) ?? { correct: 0, total: 0, color: s?.color ?? 'var(--brand-500)' };
          cur.total += 1;
          if (ans.isCorrect) cur.correct += 1;
          map.set(key, cur);
        });
      });
    return [...map.entries()].map(([name, v]) => ({ name, pct: v.total ? Math.round((v.correct / v.total) * 100) : 0, total: v.total, color: v.color }));
  }, [myAttempts, assessments, questions]);

  const progressByAttempt = useMemo(
    () =>
      myAttempts
        .filter((a) => a.status === 'submitted')
        .sort((a, b) => (a.submittedAt ?? 0) - (b.submittedAt ?? 0))
        .map((a) => ({ label: a.kind === 'quiz' ? 'Quiz' : 'Exam', value: percentage(a.score, a.maxScore) })),
    [myAttempts]
  );

  const recommendations = useMemo(() => {
    const recs: string[] = [];
    const weak = performance.filter((p) => p.pct < 60).sort((a, b) => a.pct - b.pct);
    if (weak.length > 0) {
      recs.push(`Focus on ${weak[0].name} — your performance there is ${weak[0].pct}%. Try the practice quizzes.`);
    }
    if (stats.avg === 0 && stats.completed === 0) {
      recs.push('You haven\'t taken any assessments yet. Start with a quick quiz to build your baseline.');
    } else if (stats.avg >= 80) {
      recs.push('Excellent work — you\'re averaging above 80%. Consider tackling harder-difficulty practice.');
    }
    return recs;
  }, [performance, stats]);

  return (
    <div className="animate-slide-up">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-text">Hi {profile.name.split(' ')[0]}, ready to learn?</h1>
        <p className="text-sm text-muted">Track your progress and keep improving.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon="trending-up" label="Average score" value={`${stats.avg}%`} tone="text-accent-500" />
        <StatCard icon="check" label="Completed" value={String(stats.completed)} />
        <StatCard icon="book" label="Subjects" value={String(stats.subjects)} />
        <StatCard icon="award" label="Best score" value={`${stats.best}%`} tone="text-success" />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Your Progress" subtitle="Score per assessment" icon={<Icon name="trending-up" size={18} className="text-brand-500" />} />
          <CardBody>
            <BarChart data={progressByAttempt.map((p, i) => ({ label: `${p.label} ${i + 1}`, value: p.value, color: p.value >= 70 ? 'var(--success)' : p.value >= 50 ? 'var(--warning)' : 'var(--danger)' }))} height={200} />
            {progressByAttempt.length === 0 ? <p className="text-center text-sm text-soft">No attempts yet.</p> : null}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Performance by Subject" icon={<Icon name="chart" size={18} className="text-brand-500" />} />
          <CardBody>
            <div className="flex justify-center">
              <DonutChart data={performance.map((p) => ({ label: p.name, value: p.total, color: p.color }))} centerValue={String(performance.length)} centerLabel="subjects" size={140} />
            </div>
            <div className="mt-3">
              <ChartLegend data={performance.map((p) => ({ label: `${p.name} (${p.pct}%)`, color: p.color }))} />
            </div>
          </CardBody>
        </Card>
      </div>

      {recommendations.length > 0 ? (
        <Card className="mt-5">
          <CardHeader title="Recommended Practice" icon={<Icon name="target" size={18} className="text-brand-500" />} />
          <CardBody>
            <ul className="space-y-2">
              {recommendations.map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted">
                  <Icon name="arrow-right" size={15} className="mt-0.5 shrink-0 text-brand-500" />{r}
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      ) : null}

      <Card className="mt-5">
        <CardHeader title="Available for You" icon={<Icon name="quiz" size={18} className="text-brand-500" />} action={<Button variant="ghost" size="xs" onClick={() => navigate('/quizzes')}>All quizzes</Button>} />
        <CardBody className="flex flex-col gap-2">
          {available.map((a) => (
            <div key={a.id} className="flex items-center justify-between rounded-lg border border-border bg-elevated px-3 py-2.5">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-text">{a.title}</p>
                <p className="text-[11px] text-soft">{a.questionIds.length} questions · {subjectById(a.subjectId)?.name}</p>
              </div>
              <Button size="xs" variant="accent" onClick={() => navigate(`/take/${a.id}`)}>Take quiz</Button>
            </div>
          ))}
          {available.length === 0 ? <p className="text-sm text-soft">No available quizzes right now.</p> : null}
        </CardBody>
      </Card>
    </div>
  );
}