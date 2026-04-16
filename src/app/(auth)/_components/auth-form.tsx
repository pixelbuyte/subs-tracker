'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';

type Mode = 'login' | 'signup';

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [message, setMessage] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setIsSubmitting(true);

    try {
      const supabase = createSupabaseBrowserClient();
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push('/app');
        router.refresh();
        return;
      }

      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;

      setMessage(
        'Account created. If email confirmation is enabled, check your inbox before logging in.',
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="grid gap-3" onSubmit={onSubmit}>
      <label className="grid gap-1 text-sm">
        <span className="text-[var(--muted-foreground)]">Email</span>
        <Input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
        />
      </label>

      <label className="grid gap-1 text-sm">
        <span className="text-[var(--muted-foreground)]">Password</span>
        <Input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          required
          minLength={8}
          placeholder="At least 8 characters"
        />
      </label>

      {error ? (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      ) : null}

      {message ? (
        <div className="rounded-md border border-[var(--border)] bg-muted p-3 text-sm">{message}</div>
      ) : null}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? <Spinner className="size-4" /> : null}
        {mode === 'login' ? 'Log in' : 'Create account'}
      </Button>

      <div className="text-sm text-[var(--muted-foreground)]">
        {mode === 'login' ? (
          <>
            New here?{' '}
            <Link href="/signup" className="underline underline-offset-2 hover:opacity-80">
              Create an account
            </Link>
          </>
        ) : (
          <>
            Already have an account?{' '}
            <Link href="/login" className="underline underline-offset-2 hover:opacity-80">
              Log in
            </Link>
          </>
        )}
      </div>
    </form>
  );
}

