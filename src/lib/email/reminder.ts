import { formatUsdFromCents } from '@/lib/format';

export type ReminderItem = {
  name: string;
  priceCents: number;
  renewalDate: string; // 'YYYY-MM-DD'
  daysBefore: number; // 0 = today, 1 = tomorrow, etc.
  category: string;
};

function urgencyLabel(days: number) {
  if (days === 0) return 'renews today';
  if (days === 1) return 'renews tomorrow';
  return `renews in ${days} days`;
}

function urgencyColor(days: number) {
  if (days <= 1) return '#dc2626'; // red
  if (days <= 3) return '#d97706'; // amber
  return '#0f766e'; // teal
}

export function renderReminderEmail({
  appUrl,
  items,
  totalUpcomingCents,
}: {
  appUrl: string;
  items: ReminderItem[];
  totalUpcomingCents: number;
}) {
  const subjectCount = items.length;
  const soonest = Math.min(...items.map((i) => i.daysBefore));

  const subject =
    subjectCount === 1
      ? `${items[0].name} ${urgencyLabel(items[0].daysBefore)} — ${formatUsdFromCents(
          items[0].priceCents,
        )}`
      : `${subjectCount} subscriptions renewing soon — ${formatUsdFromCents(totalUpcomingCents)}`;

  const rows = items
    .map((i) => {
      const color = urgencyColor(i.daysBefore);
      return `
      <tr>
        <td style="padding:14px 0;border-bottom:1px solid #e5e7eb;">
          <div style="font-weight:600;color:#0f172a;font-size:15px;">${escapeHtml(i.name)}</div>
          <div style="color:#64748b;font-size:13px;margin-top:2px;">
            ${escapeHtml(i.category)} · ${formatUsdFromCents(i.priceCents)}
          </div>
        </td>
        <td style="padding:14px 0;border-bottom:1px solid #e5e7eb;text-align:right;">
          <div style="color:${color};font-weight:600;font-size:13px;">
            ${urgencyLabel(i.daysBefore)}
          </div>
          <div style="color:#94a3b8;font-size:12px;margin-top:2px;">${i.renewalDate}</div>
        </td>
      </tr>`;
    })
    .join('');

  const html = `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
    <div style="max-width:560px;margin:0 auto;padding:32px 20px;">
      <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;padding:28px;">
        <div style="font-size:13px;color:#64748b;letter-spacing:0.06em;text-transform:uppercase;font-weight:600;">
          Subscription Control Center
        </div>
        <h1 style="margin:8px 0 4px;font-size:22px;color:#0f172a;line-height:1.3;">
          ${
            subjectCount === 1
              ? escapeHtml(items[0].name) + ' ' + urgencyLabel(items[0].daysBefore)
              : `${subjectCount} subscription${subjectCount > 1 ? 's' : ''} renewing soon`
          }
        </h1>
        <p style="margin:0 0 20px;color:#475569;font-size:14px;">
          ${
            subjectCount === 1
              ? `Heads up — this charge is hitting your card ${urgencyLabel(soonest)}.`
              : `Heads up — total of <strong>${formatUsdFromCents(
                  totalUpcomingCents,
                )}</strong> across the next 7 days.`
          }
        </p>

        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 24px;">
          ${rows}
        </table>

        <div style="text-align:center;">
          <a href="${appUrl}/app" style="display:inline-block;background:#0f172a;color:#ffffff;text-decoration:none;padding:11px 22px;border-radius:8px;font-weight:600;font-size:14px;">
            Open dashboard
          </a>
        </div>

        <p style="margin:24px 0 0;color:#94a3b8;font-size:12px;line-height:1.5;text-align:center;">
          You're getting this because you have active subscriptions in Subscription Control Center.<br/>
          <a href="${appUrl}/app/settings" style="color:#94a3b8;">Manage reminders</a>
        </p>
      </div>
    </div>
  </body>
</html>`;

  const textLines = [
    subjectCount === 1
      ? `${items[0].name} ${urgencyLabel(items[0].daysBefore)} (${formatUsdFromCents(items[0].priceCents)})`
      : `${subjectCount} subscriptions renewing soon — ${formatUsdFromCents(totalUpcomingCents)} total`,
    '',
    ...items.map(
      (i) =>
        `• ${i.name} — ${formatUsdFromCents(i.priceCents)} — ${urgencyLabel(i.daysBefore)} (${i.renewalDate})`,
    ),
    '',
    `Open dashboard: ${appUrl}/app`,
    `Manage reminders: ${appUrl}/app/settings`,
  ];

  return { subject, html, text: textLines.join('\n') };
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
