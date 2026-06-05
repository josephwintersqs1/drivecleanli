import type { APIRoute } from 'astro';
import { createPaymentLink } from '../../lib/square';
import type { BookingPayload } from '../../types/booking';
import type { ServiceAddress } from '../../types/address';
import {
  getServiceById,
  validateBookingSelections,
  type PaymentMode,
} from '../../data/services';
import {
  isValidServiceAddress,
  normalizeUSPhone,
  validateNotes,
  validateUSPhone,
} from '../../lib/validate-contact';

export const prerender = false;

const PAYMENT_MODES: PaymentMode[] = ['full', 'deposit'];

function isServiceAddress(value: unknown): value is ServiceAddress {
  if (!value || typeof value !== 'object') return false;
  const a = value as Record<string, unknown>;
  return (
    typeof a.placeId === 'string' &&
    typeof a.line1 === 'string' &&
    typeof a.city === 'string' &&
    typeof a.state === 'string' &&
    typeof a.zip === 'string' &&
    typeof a.formatted === 'string' &&
    (a.line2 === undefined || typeof a.line2 === 'string')
  );
}

function isValidBooking(body: unknown): body is BookingPayload {
  if (!body || typeof body !== 'object') return false;
  const b = body as Record<string, unknown>;

  if (typeof b.serviceId !== 'string' || !getServiceById(b.serviceId)) {
    return false;
  }

  if (typeof b.vehicleTierId !== 'string') return false;
  if (!Array.isArray(b.addOnIds) || !b.addOnIds.every((id) => typeof id === 'string')) {
    return false;
  }

  if (
    !validateBookingSelections(
      b.serviceId,
      b.vehicleTierId,
      b.addOnIds as string[]
    )
  ) {
    return false;
  }

  if (!isServiceAddress(b.address) || !isValidServiceAddress(b.address)) {
    return false;
  }

  if (typeof b.phone !== 'string' || !validateUSPhone(b.phone)) {
    return false;
  }

  const normalized = normalizeUSPhone(b.phone);
  if (!normalized) return false;

  if (typeof b.notes !== 'string' || !validateNotes(b.notes)) {
    return false;
  }

  return (
    typeof b.paymentMode === 'string' &&
    PAYMENT_MODES.includes(b.paymentMode as PaymentMode) &&
    typeof b.slotStart === 'string' &&
    typeof b.slotEnd === 'string' &&
    typeof b.firstName === 'string' &&
    typeof b.lastName === 'string' &&
    typeof b.tiktokPromo === 'boolean'
  );
}

export const POST: APIRoute = async ({ request }) => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!isValidBooking(body)) {
    return new Response(
      JSON.stringify({
        error:
          'Invalid booking. Check address (select from suggestions), phone, and contact fields.',
      }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  if (
    !body.firstName.trim() ||
    !body.lastName.trim() ||
    !body.phone.trim() ||
    !body.address.formatted.trim()
  ) {
    return new Response(JSON.stringify({ error: 'Contact fields are required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const normalizedPhone = normalizeUSPhone(body.phone);
  if (!normalizedPhone) {
    return new Response(JSON.stringify({ error: 'Invalid US phone number' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const payload: BookingPayload = {
    ...body,
    firstName: body.firstName.trim(),
    lastName: body.lastName.trim(),
    phone: normalizedPhone,
    notes: body.notes.trim(),
  };

  try {
    const url = await createPaymentLink(payload);
    return new Response(JSON.stringify({ url }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Checkout failed';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
