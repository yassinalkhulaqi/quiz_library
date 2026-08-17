import { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Avatar, Card, EmptyState, ProgressBar, SearchInput, Select } from '../../components/ui';
import { topicName } from '../../data/demoData';
import { percentage, performanceBreakdown } from '../../lib/scoring';

export function StudentsPage() {
  const { students, attempts, assessments } = useApp();
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<'pct' | 'attempts' | 'name'>('pct');

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const data = students.map((student) => {
      const stAttempts = attempts.filter((a) => a.status === 'submitted' && a.studentId === student.id);
      const score = stAttempts.reduce((s, a) => s + a.score, 0);
      const max = stAttempts.reduce((s, a) => s + a.maxScore, 0);
      const avg = max ? Math.round((score / max) * 100) : 0;
      const recent = stAttempts.sort((a, b) => (b.submittedAt ?? 0) - (a.submittedAt ?? 0))[0];
      const recentName = recent ? assessments.find((a) => a.id === recent.assessmentId)?.title : null;
      return { student, attempts: stAttempts.length, avg, recentName, recentPct: recent ? percentage(recent.score, recent.maxScore) : null };
    });
    const filtered = q ? data.filter((d) => d.student.name.toLowerCase().includes(q) || d.student.email.toLowerCase().includes(q)) : data;
    filtered.sort((a, b) => (sort === 'pct' ? b.avg - a.avg : sort === 'attempts' ? b.attempts - a.attempts : a.student.name.localeCompare(b.student.name)));
    return filtered;
  }, [students, attempts, assessments, query, sort]);

  return (
    <div className="animate-slide-up">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-text">Students</h1>
          <p className="text-sm text-muted">{students.length} students enrolled (demo data)</p>
        </div>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <SearchInput value={query} onChange={setQuery} placeholder="Search students…" className="flex-1" />
        <Select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className="sm:w-44">
          <option value="pct">By average score</option>
          <option value="attempts">By attempts</option>
          <option value="name">By name</option>
        </Select>
      </div>

      {rows.length === 0 ? (
        <Card><EmptyState icon="users" title="No students found" /></Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {rows.map(({ student, attempts: n, avg, recentName, recentPct }) => (
            <Card key={student.id} className="transition-all hover:shadow-[var(--shadow-md)]">
              <div className="p-5">
                <div className="flex items-center gap-3">
                  <Avatar name={student.name} color={student.avatarColor} size={44} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-text">{student.name}</p>
                    <p className="truncate text-xs text-soft">{student.grade}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${avg >= 70 ? 'bg-success/15 text-success' : avg >= 50 ? 'bg-warning/15 text-warning' : 'bg-danger/15 text-danger'}`}>{avg}%</span>
                </div>
                <div className="mt-4 flex items-center justify-between text-xs text-soft">
                  <span>{n} attempts</span>
                  {recentName ? <span className="truncate pl-2">Last: {recentName}</span> : <span>No submissions</span>}
                </div>
                <div className="mt-2">
                  <ProgressBar value={avg} size="sm" color={avg >= 70 ? 'var(--success)' : avg >= 50 ? 'var(--warning)' : 'var(--danger)'} />
                </div>
                {recentPct !== null ? (
                  <p className="mt-3 text-[11px] text-soft">Recent score: <span className="font-semibold text-text">{recentPct}%</span></p>
                ) : null}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export function StudentDetailPage({ studentId }: { studentId: string }) {
  const { students, attempts, assessments, questions } = useApp();
  const student = students.find((s) => s.id === studentId);

  const stAttempts = attempts.filter((a) => a.status === 'submitted' && a.studentId === studentId);
  const avg = stAttempts.length ? Math.round(stAttempts.reduce((s, a) => s + percentage(a.score, a.maxScore), 0) / stAttempts.length) : 0;

  const breakdown = useMemo(() => {
    const qs: (typeof questions)[number][] = [];
    const answers: (typeof stAttempts)[number]['answers'] = [];
    stAttempts.forEach((a) => {
      const assessment = assessments.find((x) => x.id === a.assessmentId);
      if (!assessment) return;
      assessment.questionIds.forEach((qid) => {
        const q = questions.find((x) => x.id === qid);
        const ans = a.answers.find((x) => x.questionId === qid);
        if (q && ans) {
          qs.push(q);
          answers.push(ans);
        }
      });
    });
    return performanceBreakdown(qs, answers, topicName);
  }, [stAttempts, assessments, questions]);

  if (!student) return <EmptyState icon="user" title="Student not found" />;

  return (
    <div className="animate-slide-up">
      <div className="mb-5 flex items-center gap-4">
        <Avatar name={student.name} color={student.avatarColor} size={52} />
        <div>
          <h1 className="text-xl font-bold text-text">{student.name}</h1>
          <p className="text-sm text-soft">{student.email} · {student.grade}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <div className="p-5 text-center">
            <p className="text-3xl font-bold text-text">{avg}%</p>
            <p className="text-xs uppercase tracking-wide text-soft">Average score</p>
            <p className="mt-2 text-xs text-soft">{stAttempts.length} assessments completed</p>
          </div>
        </Card>
        <Card className="lg:col-span-2">
          <div className="p-5">
            <p className="mb-3 text-sm font-semibold text-text">Topic Performance</p>
            <div className="flex flex-col gap-3">
              {breakdown.byTopic.map((t) => (
                <div key={t.topicId}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="text-text">{t.topicName}</span>
                    <span className="text-soft">{t.correct}/{t.total} · {t.pct}%</span>
                  </div>
                  <ProgressBar value={t.pct} size="sm" color={t.pct >= 70 ? 'var(--success)' : t.pct >= 50 ? 'var(--warning)' : 'var(--danger)'} />
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}