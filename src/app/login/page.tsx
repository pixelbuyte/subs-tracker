import { AuthCard } from '@/app/(auth)/_components/auth-card';
import { AuthForm } from '@/app/(auth)/_components/auth-form';
import { hasSupabaseEnv } from '@/lib/env';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (!hasSupabaseEnv()) redirect('/setup');

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect('/app');

  const { error: oauthError } = await searchParams;

  return (
    <AuthCard title="Log in" subtitle="Access your dashboard and subscriptions." footer={null}>
      <AuthForm mode="login" oauthError={oauthError} />
    </AuthCard>
  );
}

