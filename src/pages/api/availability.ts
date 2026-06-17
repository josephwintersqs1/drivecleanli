import type { APIRoute } from 'astro';
import { getAvailableSlots } from '../../lib/google';
import { getServiceById, getTotalDurationHours } from '../../data/services';

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  const date = url.searchParams.get('date');
  const durationParam = url.searchParams.get('duration');
  const serviceId = url.searchParams.get('serviceId');
  const addOnIdsParam = url.searchParams.get('addOnIds');

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return new Response(
      JSON.stringify({ error: 'Valid date query param required (YYYY-MM-DD)' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  let durationHours = durationParam ? parseFloat(durationParam) : NaN;

  if (isNaN(durationHours) && serviceId) {
    const addOnIds = addOnIdsParam
      ? addOnIdsParam.split(',').filter(Boolean)
      : [];
    durationHours = getTotalDurationHours(serviceId, addOnIds);
  }

  if (isNaN(durationHours) || durationHours < 1 || durationHours > 8) {
    return new Response(
      JSON.stringify({ error: 'Duration must be between 1 and 8 hours' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const slots = await getAvailableSlots(date, durationHours);
    return new Response(JSON.stringify({ date, slots }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch availability';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
