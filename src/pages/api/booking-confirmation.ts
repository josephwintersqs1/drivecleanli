import type { APIRoute } from 'astro';
import { expandSquareOrderMetadata } from '../../adapters/squareOrderMetadata';
import { snapshotFromOrderMetadata } from '../../adapters/bookingConfirmation';
import { getOrderBookingMetadata } from '../../lib/square';

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  const orderId = url.searchParams.get('orderId')?.trim();
  if (!orderId) {
    return new Response(JSON.stringify({ error: 'orderId is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const raw = await getOrderBookingMetadata(orderId);
    if (!raw) {
      return new Response(JSON.stringify({ error: 'Order not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const snapshot = snapshotFromOrderMetadata(expandSquareOrderMetadata(raw));
    if (!snapshot) {
      return new Response(JSON.stringify({ error: 'Order has no booking metadata' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(snapshot), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to load confirmation';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
