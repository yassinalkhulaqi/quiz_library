import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Button, Card, CardBody, CardHeader, ConfirmDialog, Field, Icon, Input, Select, Toggle } from '../../components/ui';

type Section = 'profile' | 'appearance' | 'notifications' | 'ai' | 'assessment' | 'security' | 'data';

export function SettingsPage() {
  const { settings, updateSettings, profile, setProfile, resetDemo, toast, aiKey, setAiKey } = useApp();
  const [section, setSection] = useState<Section>('profile');
  const [aiKeyInput, setAiKeyInput] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);

  const sections: { id: Section; label: string; icon: 'user' | 'moon' | 'bell' | 'sparkles' | 'target' | 'lock' | 'database' }[] = [
    { id: 'profile', label: 'Profile', icon: 'user' },
    { id: 'appearance', label: 'Appearance', icon: 'moon' },
    { id: 'notifications', label: 'Notifications', icon: 'bell' },
    { id: 'ai', label: 'AI Settings', icon: 'sparkles' },
    { id: 'assessment', label: 'Assessment', icon: 'target' },
    { id: 'security', label: 'Security', icon: 'lock' },
    { id: 'data', label: 'Data', icon: 'database' },
  ];

  return (
    <div className="animate-slide-up">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-text">Settings</h1>
        <p className="text-sm text-muted">Manage your QuizMind experience.</p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-4">
        <div className="flex flex-col gap-1">
          {sections.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSection(s.id)}
              className={`flex items-center gap-3 rounded-xl border px-4 py-2.5 text-left text-sm font-medium transition-colors ${section === s.id ? 'border-brand-500 bg-brand-500/10 text-brand-500' : 'border-transparent text-muted hover:bg-elevated hover:text-text'}`}
            >
              <Icon name={s.icon} size={16} />
              {s.label}
            </button>
          ))}
        </div>

        <div className="lg:col-span-3">
          {section === 'profile' ? (
            <Card>
              <CardHeader title="Profile" subtitle="Your public information" icon={<Icon name="user" size={18} className="text-brand-500" />} />
              <CardBody className="flex flex-col gap-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Name">
                    <Input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
                  </Field>
                  <Field label="Email">
                    <Input type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
                  </Field>
                  <Field label="Organization">
                    <Input value={profile.organization} onChange={(e) => setProfile({ ...profile, organization: e.target.value })} />
                  </Field>
                  <Field label="Role">
                    <Select value={profile.role} onChange={(e) => setProfile({ ...profile, role: e.target.value as typeof profile.role })}>
                      <option value="teacher">Teacher</option>
                      <option value="student">Student</option>
                      <option value="admin">Admin</option>
                    </Select>
                  </Field>
                </div>
                <Button className="self-start" onClick={() => toast('success', 'Profile saved')}>Save profile</Button>
              </CardBody>
            </Card>
          ) : null}

          {section === 'appearance' ? (
            <Card>
              <CardHeader title="Appearance" subtitle="Theme preferences" icon={<Icon name="moon" size={18} className="text-brand-500" />} />
              <CardBody className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => updateSettings({ theme: 'dark' })}
                    className={`flex flex-col items-center gap-2 rounded-xl border p-5 transition-colors ${settings.theme === 'dark' ? 'border-brand-500 bg-brand-500/10' : 'border-border bg-elevated hover:border-brand-400'}`}
                  >
                    <Icon name="moon" size={22} />
                    <span className="text-sm font-medium">Dark</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => updateSettings({ theme: 'light' })}
                    className={`flex flex-col items-center gap-2 rounded-xl border p-5 transition-colors ${settings.theme === 'light' ? 'border-brand-500 bg-brand-500/10' : 'border-border bg-elevated hover:border-brand-400'}`}
                  >
                    <Icon name="sun" size={22} />
                    <span className="text-sm font-medium">Light</span>
                  </button>
                </div>
                <Toggle
                  checked={settings.reduceMotion}
                  onChange={(v) => updateSettings({ reduceMotion: v })}
                  label="Reduce motion"
                  description="Minimize animations throughout the app"
                />
              </CardBody>
            </Card>
          ) : null}

          {section === 'notifications' ? (
            <Card>
              <CardHeader title="Notifications" subtitle="What you want to hear about" icon={<Icon name="bell" size={18} className="text-brand-500" />} />
              <CardBody className="flex flex-col gap-4">
                <Toggle checked={settings.notificationsEnabled} onChange={(v) => updateSettings({ notificationsEnabled: v })} label="Enable notifications" description="Push and in-app notifications" />
              </CardBody>
            </Card>
          ) : null}

          {section === 'ai' ? (
            <Card>
              <CardHeader title="AI Settings" subtitle="Configure the QuizMind AI service" icon={<Icon name="sparkles" size={18} className="text-accent-500" />} />
              <CardBody className="flex flex-col gap-4">
                <div className="rounded-xl border border-border bg-elevated p-4">
                  <p className="mb-1 text-sm font-semibold text-text">Current provider</p>
                  <p className="text-sm text-muted">
                    {settings.aiProvider === 'gemini'
                      ? <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-success" /> Live Gemini · real AI generation</span>
                      : <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-warning" /> Demo mode · mock generator (clearly labeled, never presented as real AI)</span>}
                  </p>
                </div>
                <Field label="Gemini API key" hint="Held in memory only while the tab is open. Never stored on disk or committed to Git.">
                  <Input type="password" value={aiKeyInput} onChange={(e) => setAiKeyInput(e.target.value)} placeholder="Paste your Google Gemini API key…" />
                </Field>
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      if (!aiKeyInput.trim()) {
                        toast('error', 'Enter a key first');
                        return;
                      }
                      setAiKey(aiKeyInput);
                      toast('success', 'AI key configured', 'AI Studio will now use live Gemini generation.');
                    }}
                  >
                    Connect to Gemini
                  </Button>
                  <Button variant="outline" onClick={() => { setAiKeyInput(''); setAiKey(''); toast('info', 'AI key cleared', 'Returned to demo mode.'); }}>
                    Clear key
                  </Button>
                </div>
                {(aiKey || settings.aiProvider === 'gemini') ? (
                  <p className="text-xs text-success">Connected. The key is active for this session only.</p>
                ) : (
                  <p className="text-xs text-soft">Alternatively set <code className="rounded bg-elevated px-1">VITE_GEMINI_API_KEY</code> in your environment before starting the dev server.</p>
                )}
              </CardBody>
            </Card>
          ) : null}

          {section === 'assessment' ? (
            <Card>
              <CardHeader title="Assessment Defaults" subtitle="Defaults for new questions and quizzes" icon={<Icon name="target" size={18} className="text-brand-500" />} />
              <CardBody className="flex flex-col gap-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Default difficulty">
                    <Select value={settings.defaultDifficulty} onChange={(e) => updateSettings({ defaultDifficulty: e.target.value as typeof settings.defaultDifficulty })}>
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </Select>
                  </Field>
                  <Field label="Default question type">
                    <Select value={settings.defaultQuestionType} onChange={(e) => updateSettings({ defaultQuestionType: e.target.value as typeof settings.defaultQuestionType })}>
                      <option value="multiple_choice">Multiple Choice</option>
                      <option value="multiple_select">Multiple Select</option>
                      <option value="true_false">True / False</option>
                      <option value="short_answer">Short Answer</option>
                      <option value="fill_blank">Fill in the Blank</option>
                      <option value="essay">Essay</option>
                    </Select>
                  </Field>
                </div>
                <Toggle checked={settings.showCorrectAnswersImmediately} onChange={(v) => updateSettings({ showCorrectAnswersImmediately: v })} label="Show correct answers immediately" description="After each quiz submission" />
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => toast('success', 'Defaults saved')}>Save defaults</Button>
                  <Button size="sm" variant="outline" icon="refresh" onClick={() => updateSettings({ defaultDifficulty: 'medium', defaultQuestionType: 'multiple_choice', showCorrectAnswersImmediately: false })}>Reset to defaults</Button>
                </div>
              </CardBody>
            </Card>
          ) : null}

          {section === 'security' ? (
            <Card>
              <CardHeader title="Security" subtitle="How QuizMind handles sensitive data" icon={<Icon name="lock" size={18} className="text-brand-500" />} />
              <CardBody className="flex flex-col gap-3 text-sm text-muted">
                <p className="flex items-start gap-2"><Icon name="check" size={15} className="mt-0.5 text-success" /> No API keys are bundled into the client. Keys are used in-memory only.</p>
                <p className="flex items-start gap-2"><Icon name="check" size={15} className="mt-0.5 text-success" /> <code>.env.local</code> and secrets are ignored by Git.</p>
                <p className="flex items-start gap-2"><Icon name="check" size={15} className="mt-0.5 text-success" /> Demo data lives in localStorage on your device only.</p>
                <p className="flex items-start gap-2"><Icon name="info" size={15} className="mt-0.5 text-info" /> This is a frontend demo — production authentication and a real backend are planned (see roadmap).</p>
              </CardBody>
            </Card>
          ) : null}

          {section === 'data' ? (
            <Card>
              <CardHeader title="Data" subtitle="Your demo data" icon={<Icon name="database" size={18} className="text-brand-500" />} />
              <CardBody className="flex flex-col gap-4">
                <p className="text-sm text-muted">All QuizMind demo data is stored locally in your browser. You can reset to the original dataset at any time.</p>
                <Button variant="danger" icon="refresh" className="self-start" onClick={() => setConfirmReset(true)}>Reset demo data</Button>
              </CardBody>
            </Card>
          ) : null}
        </div>
      </div>

      <ConfirmDialog
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        onConfirm={resetDemo}
        title="Reset all demo data?"
        message="This restores the original QuizMind dataset and discards your changes. This cannot be undone."
        confirmLabel="Reset data"
      />
    </div>
  );
}