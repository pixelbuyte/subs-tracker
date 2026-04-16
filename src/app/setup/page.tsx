import Link from 'next/link';

import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function SetupPage() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto flex max-w-2xl flex-col gap-8 px-6 py-8">
        <header className="flex items-center justify-between">
          <Link href="/" className="text-sm font-semibold tracking-wide">
            Subscription Control Center
          </Link>
          <ThemeToggle />
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Supabase setup required</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 text-sm">
            <p className="text-[var(--muted-foreground)]">
              This app needs Supabase configured before login and the dashboard can work.
            </p>

            <div className="rounded-md border border-[var(--border)] bg-muted p-4">
              <div className="font-medium">Do this:</div>
              <ol className="mt-2 list-decimal space-y-1 pl-5 text-[var(--muted-foreground)]">
                <li>
                  Create a Supabase project, then copy <code>.env.example</code> →{' '}
                  <code>.env.local</code>.
                </li>
                <li>
                  Fill in <code>NEXT_PUBLIC_SUPABASE_URL</code> and{' '}
                  <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>.
                </li>
                <li>
                  Run the SQL in <code>supabase/schema.sql</code> in the Supabase SQL editor.
                </li>
                <li>Enable Email auth provider (email/password) in Supabase Auth settings.</li>
              </ol>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Link href="/">
                <Button variant="secondary">Back to landing</Button>
              </Link>
              <Link href="/login">
                <Button>Go to login</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

