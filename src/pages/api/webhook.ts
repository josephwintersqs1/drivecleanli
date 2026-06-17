import type { APIRoute } from 'astro';
import { expandSquareOrderMetadata } from '../../adapters/squareOrderMetadata';
import { createBookingCalendarEvent, hasBookingMetadata } from '../../lib/booking-event';
import { getOrderBookingMetadata } from '../../lib/square';

export const prerender = false;

interface SquareWebhookPayment {
  id?: string;
  status?: string;
  orderId?: string;
  order_id?: string;
}

interface SquareWebhookOrder {
  id?: string;
  state?: string;
  metadata?: Record<string, string | null | undefined>;
}

interface SquareWebhookEvent {
  type: string;
  data?: {
    id?: string;
    object?: {
      payment?: SquareWebhookPayment;
      order?: SquareWebhookOrder;
    };
  };
}

function normalizeMetadata(
  raw: Record<string, string | null | undefined> | null | undefined
): Record<string, string> | null {
  if (!raw) return null;
  const metadata: Record<string, string> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (value != null && value !== '') metadata[key] = value;
  }
  if (Object.keys(metadata).length === 0) return null;
  return expandSquareOrderMetadata(metadata);
}

async function resolveBookingMetadata(
  event: SquareWebhookEvent
): Promise<{ metadata: Record<string, string> | null; paymentId?: string }> {
  const payment = event.data?.object?.payment;
  const order = event.data?.object?.order;
  const paymentId = payment?.id ?? event.data?.id;

  let metadata = normalizeMetadata(order?.metadata);

  if (!hasBookingMetadata(metadata)) {
    const orderId =
      payment?.orderId ??
      payment?.order_id ??
      order?.id;

    if (orderId) {
      metadata = await getOrderBookingMetadata(orderId);
    }
  }

  return { metadata, paymentId };
}

export const POST: APIRoute = async ({ request }) => {
  let event: SquareWebhookEvent;
  try {
    event = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 });
  }

  const payment = event.data?.object?.payment;
  const order = event.data?.object?.order;

  const isPaymentComplete =
    event.type === 'payment.updated' && payment?.status === 'COMPLETED';

  const isOrderComplete =
    event.type === 'order.updated' && order?.state === 'COMPLETED';

  if (!isPaymentComplete && !isOrderComplete) {
    return new Response(JSON.stringify({ received: true }), { status: 200 });
  }

  try {
    const { metadata, paymentId } = await resolveBookingMetadata(event);

    if (!hasBookingMetadata(metadata)) {
      return new Response(
        JSON.stringify({ received: true, skipped: 'no metadata' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    await createBookingCalendarEvent(metadata, paymentId);

    return new Response(JSON.stringify({ received: true, booked: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Webhook processing failed';
    console.error('[webhook]', message);

    const calendarPermission =
      /writer access|forbidden|insufficient/i.test(message);
    const serviceAccount = import.meta.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;

    return new Response(
      JSON.stringify({
        error: message,
        ...(calendarPermission && serviceAccount
          ? {
              hint: `Share GOOGLE_CALENDAR_ID with ${serviceAccount} using "Make changes to events", then POST /api/calendar-sync with the Square orderId to retry.`,
            }
          : {}),
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
