import { redirect } from 'next/navigation';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export default async function SettingsPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">Preferences and account basics.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          <div className="text-[var(--muted-foreground)]">Signed in as</div>
          <div className="mt-1 font-medium">{user.email ?? user.id}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Reminders / notifications</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-[var(--muted-foreground)]">
          MVP stub: reminders will live here (e.g., email or in-app notifications for renewals in 7/30
          days). For v1, the dashboard highlights upcoming renewals.
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-[var(--muted-foreground)]">
          Export all subscriptions as CSV from the dashboard using <span className="font-medium">Export CSV</span>.
        </CardContent>
      </Card>
    </div>
  );
}

