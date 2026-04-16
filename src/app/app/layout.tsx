import Link from 'next/link';
import { redirect } from 'next/navigation';

import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { hasSupabaseEnv } from '@/lib/env';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  if (!hasSupabaseEnv()) redirect('/setup');

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  async function signOut() {
    'use server';
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
    redirect('/login');
  }

  return (
    <div className="min-h-dvh bg-background">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-6">
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link href="/app" className="text-sm font-semibold tracking-wide">
              Subscription Control Center
            </Link>
            <nav className="hidden items-center gap-1 sm:flex">
              <Link href="/app" className="rounded-md px-3 py-2 text-sm hover:bg-muted">
                Dashboard
              </Link>
              <Link href="/app/settings" className="rounded-md px-3 py-2 text-sm hover:bg-muted">
                Settings
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <form action={signOut}>
              <Button type="submit" variant="secondary" size="sm">
                Sign out
              </Button>
            </form>
          </div>
        </header>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}

