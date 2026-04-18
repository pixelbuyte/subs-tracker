'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';

type Mode = 'login' | 'signup';

export function AuthForm({ mode, oauthError }: { mode: Mode; oauthError?: string | null }) {
  const router = useRouter();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [message, setMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (oauthError) {
      try {
        setError(decodeURIComponent(oauthError));
      } catch {
        setError(oauthError);
      }
    }
  }, [oauthError]);

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

  async function signInWithGoogle() {
    setError(null);
    setMessage(null);
    setIsSubmitting(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/app`,
        },
      });
      if (error) throw error;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Google sign-in failed.';
      setError(msg);
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid gap-4">
      <Button
        type="button"
        variant="secondary"
        className="w-full"
        disabled={isSubmitting}
        onClick={() => void signInWithGoogle()}
      >
        {isSubmitting ? <Spinner className="size-4" /> : null}
        Continue with Google
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-[var(--border)]" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-[var(--muted-foreground)]">or email</span>
        </div>
      </div>

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
    </div>
  );
}

