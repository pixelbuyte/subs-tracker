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
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:gap-6 sm:px-6 sm:py-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-4 sm:gap-6">
            <Link
              href="/app"
              className="truncate text-sm font-semibold tracking-wide"
              title="Subscription Control Center"
            >
              <span className="sm:hidden">Subs Control</span>
              <span className="hidden sm:inline">Subscription Control Center</span>
            </Link>
            <nav className="flex items-center gap-1">
              <Link
                href="/app"
                className="rounded-md px-2 py-1.5 text-sm hover:bg-muted sm:px-3 sm:py-2"
              >
                Dashboard
              </Link>
              <Link
                href="/app/settings"
                className="rounded-md px-2 py-1.5 text-sm hover:bg-muted sm:px-3 sm:py-2"
              >
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

