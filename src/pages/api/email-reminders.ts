import type { APIRoute } from 'astro';
import { processScheduledBookingEmails } from '../../lib/booking-email-reminders';

export const prerender = false;

function isAuthorized(request: Request): boolean {
  const secret = import.meta.env.CRON_SECRET?.trim();
  if (!secret) return false;

  const auth = request.headers.get('authorization');
  return auth === `Bearer ${secret}`;
}

export const GET: APIRoute = async ({ request }) => {
  if (!isAuthorized(request)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const result = await processScheduledBookingEmails();
    return new Response(JSON.stringify({ ok: true, ...result }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Email reminders failed';
    console.error('[email-reminders]', message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const POST = GET;
