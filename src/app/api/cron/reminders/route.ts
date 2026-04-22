import { NextResponse } from 'next/server';
import { Resend } from 'resend';

import { renderReminderEmail, type ReminderItem } from '@/lib/email/reminder';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
// Don't cache. Cron must always re-run.
export const dynamic = 'force-dynamic';

// We send reminder emails at these milestones before the renewal date.
const REMINDER_DAYS = [7, 3, 1, 0] as const;

type SubscriptionRow = {
  id: string;
  user_id: string;
  name: string;
  price_cents: number;
  next_renewal_date: string;
  category: string;
  status: string;
};

function todayUtcYmd() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

function ymdPlusDays(ymd: string, days: number) {
  const [y, m, d] = ymd.split('-').map(Number);
  const date = new Date(Date.UTC(y, (m ?? 1) - 1, d ?? 1));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function authorize(req: Request) {
  const expected = process.env.CRON_SECRET;
  if (!expected) return false;
  const auth = req.headers.get('authorization');
  // Vercel Cron sends `Authorization: Bearer <CRON_SECRET>`.
  return auth === `Bearer ${expected}`;
}

export async function GET(req: Request) {
  if (!authorize(req)) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const fromAddress = process.env.EMAIL_FROM;
  if (!apiKey || !fromAddress) {
    return NextResponse.json(
      { ok: false, error: 'RESEND_API_KEY or EMAIL_FROM not configured' },
      { status: 500 },
    );
  }

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : 'http://localhost:3000');

  const supabase = createSupabaseAdminClient();
  const resend = new Resend(apiKey);

  const today = todayUtcYmd();
  // Build list of target renewal dates: today, +1, +3, +7
  const targetDates = REMINDER_DAYS.map((d) => ({ daysBefore: d, date: ymdPlusDays(today, d) }));
  const dateList = targetDates.map((t) => t.date);

  // Pull every active sub renewing on one of those dates, in one query.
  const { data: subs, error: subsErr } = await supabase
    .from('subscriptions')
    .select('id, user_id, name, price_cents, next_renewal_date, category, status')
    .eq('status', 'active')
    .in('next_renewal_date', dateList);

  if (subsErr) {
    return NextResponse.json({ ok: false, error: subsErr.message }, { status: 500 });
  }

  const rawCandidates: { sub: SubscriptionRow; daysBefore: number }[] = (subs ?? []).map((s) => {
    const match = targetDates.find((t) => t.date === s.next_renewal_date);
    return { sub: s as SubscriptionRow, daysBefore: match?.daysBefore ?? 0 };
  });

  if (rawCandidates.length === 0) {
    return NextResponse.json({ ok: true, processed: 0, sent: 0, skipped: 0 });
  }

  // Reminder emails are a Pro feature. Filter candidates down to users who
  // currently have an active 'pro' plan row.
  const candidateUserIds = Array.from(new Set(rawCandidates.map((c) => c.sub.user_id)));
  const { data: proPlans, error: planErr } = await supabase
    .from('user_plans')
    .select('user_id')
    .eq('plan', 'pro')
    .in('user_id', candidateUserIds);

  if (planErr) {
    return NextResponse.json({ ok: false, error: planErr.message }, { status: 500 });
  }

  const proUserSet = new Set((proPlans ?? []).map((p) => p.user_id));
  const candidates = rawCandidates.filter((c) => proUserSet.has(c.sub.user_id));
  const gatedByPlan = rawCandidates.length - candidates.length;

  if (candidates.length === 0) {
    return NextResponse.json({
      ok: true,
      processed: rawCandidates.length,
      sent: 0,
      skipped: 0,
      gatedByPlan,
    });
  }

  // Filter out already-sent (subscription_id, renewal_date, days_before) milestones.
  const { data: alreadySent, error: sentErr } = await supabase
    .from('sent_reminders')
    .select('subscription_id, renewal_date, days_before')
    .in(
      'subscription_id',
      candidates.map((c) => c.sub.id),
    );

  if (sentErr) {
    return NextResponse.json({ ok: false, error: sentErr.message }, { status: 500 });
  }

  const sentKey = (subId: string, date: string, days: number) => `${subId}|${date}|${days}`;
  const sentSet = new Set(
    (alreadySent ?? []).map((r) => sentKey(r.subscription_id, r.renewal_date, r.days_before)),
  );

  const todo = candidates.filter(
    (c) => !sentSet.has(sentKey(c.sub.id, c.sub.next_renewal_date, c.daysBefore)),
  );

  if (todo.length === 0) {
    return NextResponse.json({
      ok: true,
      processed: candidates.length,
      sent: 0,
      skipped: candidates.length,
    });
  }

  // Group remaining items by user.
  const byUser = new Map<string, { sub: SubscriptionRow; daysBefore: number }[]>();
  for (const c of todo) {
    const arr = byUser.get(c.sub.user_id) ?? [];
    arr.push(c);
    byUser.set(c.sub.user_id, arr);
  }

  let sent = 0;
  const failures: { userId: string; error: string }[] = [];

  // Process each user: lookup email, render email, send, write dedupe rows.
  for (const [userId, userItems] of byUser) {
    try {
      const { data: userResp, error: userErr } = await supabase.auth.admin.getUserById(userId);
      if (userErr || !userResp?.user?.email) {
        failures.push({ userId, error: userErr?.message ?? 'no email on user' });
        continue;
      }
      const email = userResp.user.email;

      const items: ReminderItem[] = userItems
        .sort((a, b) => a.daysBefore - b.daysBefore)
        .map((c) => ({
          name: c.sub.name,
          priceCents: c.sub.price_cents,
          renewalDate: c.sub.next_renewal_date,
          daysBefore: c.daysBefore,
          category: c.sub.category,
        }));

      const totalUpcomingCents = items.reduce((acc, i) => acc + i.priceCents, 0);

      const { subject, html, text } = renderReminderEmail({
        appUrl,
        items,
        totalUpcomingCents,
      });

      const { error: sendErr } = await resend.emails.send({
        from: fromAddress,
        to: email,
        subject,
        html,
        text,
      });

      if (sendErr) {
        failures.push({ userId, error: sendErr.message });
        continue;
      }

      // Record dedupe rows so we don't double-send.
      const dedupeRows = userItems.map((c) => ({
        subscription_id: c.sub.id,
        user_id: userId,
        renewal_date: c.sub.next_renewal_date,
        days_before: c.daysBefore,
      }));
      const { error: insErr } = await supabase.from('sent_reminders').insert(dedupeRows);
      if (insErr) {
        // Email already went out — log but keep going.
        failures.push({ userId, error: `email sent but dedupe insert failed: ${insErr.message}` });
      }
      sent += 1;
    } catch (err) {
      failures.push({
        userId,
        error: err instanceof Error ? err.message : 'unknown error',
      });
    }
  }

  return NextResponse.json({
    ok: true,
    processed: rawCandidates.length,
    eligible: candidates.length,
    sent,
    skipped: candidates.length - todo.length,
    gatedByPlan,
    failures,
  });
}
