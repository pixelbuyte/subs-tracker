import Link from 'next/link';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">{subtitle}</p>
      </CardHeader>
      <CardContent className="grid gap-4">
        {children}
        <div className="pt-2 text-sm text-[var(--muted-foreground)]">
          {footer ? <span className="mr-1">{footer}</span> : null}
          <Link href="/" className="underline underline-offset-2 hover:opacity-80">
            Back to landing
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

