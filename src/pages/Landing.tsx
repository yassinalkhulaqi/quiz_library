import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Button, Card, CardBody, Icon, LogoMark, type IconName } from '../components/ui';

const features: { icon: IconName; title: string; desc: string }[] = [
  { icon: 'sparkles', title: 'AI Question Generation', desc: 'Generate MCQ, multi-select, true/false and essay questions from any topic in seconds.' },
  { icon: 'questions', title: 'Smart Question Bank', desc: 'Search, filter, tag and organize thousands of questions with full versioning.' },
  { icon: 'quiz', title: 'Quiz & Exam Builder', desc: 'Five-step builder with timers, randomization, attempts and passing thresholds.' },
  { icon: 'chart', title: 'Performance Analytics', desc: 'Score distributions, topic weaknesses and question-level success rates.' },
  { icon: 'target', title: 'AI Insights', desc: 'Actionable signals — detect ambiguous questions and struggling topics early.' },
  { icon: 'users', title: 'Students & Progress', desc: 'Role-based views for teachers and students with personal learning dashboards.' },
];

const pillars = ['AI Question Generation', 'Smart Question Bank', 'Quiz Builder', 'Exam Builder', 'Student Assessments', 'Performance Analytics', 'AI Insights', 'Learning Progress'];

export function LandingPage() {
  const navigate = useNavigate();
  const { switchRole } = useApp();

  const enter = (role: 'teacher' | 'student') => {
    switchRole(role);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-bg text-text">
      {/* Nav */}
      <header className="sticky top-0 z-30 border-b border-border bg-surface/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <LogoMark size={28} />
            <span className="text-lg font-extrabold tracking-tight">Quiz<span className="text-brand-500">Mind</span></span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => navigate('/login')}>Sign in</Button>
            <Button onClick={() => navigate('/login')}>Get started</Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="qm-grid-bg">
        <div className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-6 sm:py-28">
          <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-xs font-medium text-brand-500">
            <Icon name="sparkles" size={14} /> AI-Powered Assessment Platform
          </div>
          <h1 className="mx-auto max-w-3xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            Create, manage and analyze assessments{' '}
            <span className="bg-gradient-to-r from-brand-500 to-accent-500 bg-clip-text text-transparent">with AI</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
            QuizMind helps teachers and students generate intelligent questions, build quizzes and exams, and turn every attempt into actionable insight.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button size="lg" icon="sparkles" onClick={() => enter('teacher')}>Try it as a teacher</Button>
            <Button size="lg" variant="outline" icon="graduation" onClick={() => enter('student')}>Try it as a student</Button>
          </div>
          <div className="mx-auto mt-10 flex max-w-2xl flex-wrap items-center justify-center gap-2">
            {pillars.map((p) => (
              <span key={p} className="rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted">{p}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="text-center text-2xl font-bold sm:text-3xl">Everything an assessment team needs</h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-sm text-muted sm:text-base">One platform for the full assessment lifecycle — from first question to final analysis.</p>
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <Card key={f.title} className="transition-all hover:border-brand-500/40 hover:shadow-[var(--shadow-md)]">
                <CardBody className="flex flex-col gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 text-white">
                    <Icon name={f.icon} size={20} />
                  </div>
                  <h3 className="font-semibold text-text">{f.title}</h3>
                  <p className="text-sm leading-relaxed text-muted">{f.desc}</p>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6">
          <h2 className="text-2xl font-bold sm:text-3xl">Ready to build your first quiz?</h2>
          <p className="mx-auto mt-3 max-w-lg text-sm text-muted sm:text-base">It takes less than a minute. Demo data is preloaded so you can explore immediately.</p>
          <div className="mt-6 flex justify-center gap-3">
            <Button size="lg" onClick={() => navigate('/login')}>Start exploring</Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-soft sm:flex-row sm:px-6">
          <div className="flex items-center gap-2">
            <LogoMark size={20} />
            <span>QuizMind — AI-Powered Assessment Platform</span>
          </div>
          <span>© {new Date().getFullYear()} Yassin Alkhulaqi</span>
        </div>
      </footer>
    </div>
  );
}