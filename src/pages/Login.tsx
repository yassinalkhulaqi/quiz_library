import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Button, Card, Field, Input, LogoMark } from '../components/ui';
import { cn } from '../lib/utils';
import type { Role } from '../types';

export function LoginPage() {
  const navigate = useNavigate();
  const { switchRole, toast } = useApp();
  const [email, setEmail] = useState('teacher@quizmind.app');
  const [role, setRole] = useState<Role>('teacher');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast('error', 'Email is required');
      return;
    }
    switchRole(role);
    toast('success', `Signed in as ${role}`, 'Demo session started');
    navigate('/dashboard');
  };

  return (
    <div className="qm-grid-bg flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center gap-3">
          <LogoMark size={52} />
          <div className="text-center">
            <h1 className="text-2xl font-extrabold tracking-tight text-text">Quiz<span className="text-brand-500">Mind</span></h1>
            <p className="text-sm text-muted">AI-Powered Assessment Platform</p>
          </div>
        </div>

        <Card className="animate-scale-in">
          <div className="p-6 sm:p-8">
            <h2 className="text-lg font-bold text-text">Welcome back</h2>
            <p className="mt-1 text-sm text-muted">Sign in to your workspace. (Demo — no real authentication.)</p>

            <form onSubmit={submit} className="mt-6 flex flex-col gap-4">
              <Field label="Email address">
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@university.edu" />
              </Field>

              <Field label="Sign in as">
                <div className="grid grid-cols-3 gap-2">
                  {(['teacher', 'student', 'admin'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={cn(
                        'rounded-lg border px-2 py-2.5 text-sm font-medium capitalize transition-colors',
                        role === r ? 'border-brand-500 bg-brand-500/10 text-brand-500' : 'border-border bg-elevated text-muted hover:border-brand-400'
                      )}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </Field>

              <Button type="submit" size="lg" fullWidth>Sign in</Button>
            </form>
          </div>
        </Card>

        <p className="mt-4 text-center text-xs text-soft">Demo data is preloaded — explore freely. Data resets are available in Settings → Data.</p>
      </div>
    </div>
  );
}