import Link from 'next/link';

import { ThemeToggle } from '@/components/theme-toggle';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto flex max-w-md flex-col gap-8 px-6 py-8">
        <header className="flex items-center justify-between">
          <Link href="/" className="text-sm font-semibold tracking-wide">
            Subscription Control Center
          </Link>
          <ThemeToggle />
        </header>
        {children}
      </div>
    </div>
  );
}

