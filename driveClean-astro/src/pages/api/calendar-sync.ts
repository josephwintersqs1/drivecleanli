import type { APIRoute } from 'astro';
import { createBookingCalendarEvent, hasBookingMetadata } from '../../lib/booking-event';
import { getOrderBookingMetadata } from '../../lib/square';

export const prerender = false;

/**
 * Re-create a calendar event from a Square order (e.g. after fixing calendar sharing).
 * POST { "orderId": "..." }
 */
export const POST: APIRoute = async ({ request }) => {
  let body: { orderId?: string };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 });
  }

  const orderId = body.orderId?.trim();
  if (!orderId) {
    return new Response(JSON.stringify({ error: 'orderId is required' }), { status: 400 });
  }

  try {
    const metadata = await getOrderBookingMetadata(orderId);
    if (!hasBookingMetadata(metadata)) {
      return new Response(
        JSON.stringify({ error: 'Order has no booking metadata (slotStart/slotEnd)' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const eventId = await createBookingCalendarEvent(metadata);
    return new Response(JSON.stringify({ ok: true, eventId, orderId }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Calendar sync failed';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
