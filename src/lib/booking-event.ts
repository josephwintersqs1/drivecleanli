import {
  createCalendarEvent,
  findCalendarEventByPaymentId,
  getCalendarEventById,
  patchCalendarEventExtendedProperties,
} from './google';
import {
  formatPrice,
  getAddOnById,
  getServiceById,
  getVehicleTierLabel,
} from '../data/services';
import {
  buildBookingEmailDetails,
  sendBookingConfirmationEmail,
} from './email';

export function hasBookingMetadata(
  metadata: Record<string, string> | null | undefined
): metadata is Record<string, string> {
  return !!metadata?.slotStart && !!metadata?.slotEnd;
}

export async function createBookingCalendarEvent(
  metadata: Record<string, string>,
  paymentId?: string
): Promise<{ eventId: string }> {
  const service = getServiceById(metadata.serviceId ?? '');
  const vehicleLabel =
    metadata.vehicleLabel ??
    getVehicleTierLabel(
      metadata.serviceId ?? '',
      metadata.vehicleTierId ?? metadata.vehicleType ?? ''
    );
  const addOnNames = (metadata.addOnIds ?? '')
    .split(',')
    .filter(Boolean)
    .map((id) => getAddOnById(id)?.name ?? id);

  const customerName = `${metadata.firstName ?? ''} ${metadata.lastName ?? ''}`.trim();
  const paymentMode = metadata.paymentMode ?? 'full';
  const total = metadata.totalAmount ? formatPrice(Number(metadata.totalAmount)) : null;
  const paidToday = metadata.amountDueToday
    ? formatPrice(Number(metadata.amountDueToday))
    : null;
  const balance = metadata.balanceDue
    ? formatPrice(Number(metadata.balanceDue))
    : null;

  const paymentLine =
    paymentMode === 'deposit' && total && paidToday && balance
      ? `Payment: ${paidToday} deposit paid online · ${balance} due on service day (total ${total})`
      : total
        ? `Payment: ${total} paid in full online`
        : null;

  const street =
    metadata.addressLine1 && metadata.addressLine2
      ? `${metadata.addressLine1}, ${metadata.addressLine2}`
      : metadata.addressLine1;
  const addressLine =
    street && metadata.city
      ? `${street}, ${metadata.city}, ${metadata.state ?? ''} ${metadata.zip ?? ''}`.trim()
      : (metadata.address ?? 'N/A');

  const notes = metadata.notes?.trim();
  const tiktokPromo = metadata.tiktokPromo === 'yes' || metadata.tiktokPromo === '1';

  const description = [
    `Customer: ${customerName}`,
    `Phone: ${metadata.phone ?? 'N/A'}`,
    `Email: ${metadata.email ?? 'N/A'}`,
    `Address: ${addressLine}`,
    tiktokPromo ? 'TikTok promo: 10% off applied' : null,
    notes ? `Notes: ${notes}` : null,
    `Service: ${service?.name ?? metadata.serviceId}`,
    vehicleLabel !== 'Standard' ? `Vehicle: ${vehicleLabel}` : null,
    addOnNames.length ? `Add-ons: ${addOnNames.join(', ')}` : null,
    paymentLine,
    paymentId ? `Payment ID: ${paymentId}` : null,
  ]
    .filter(Boolean)
    .join('\n');

  const eventId = await createCalendarEvent({
    summary: `DriveClean – ${service?.name ?? 'Detail'} (${customerName})`,
    description,
    start: metadata.slotStart,
    end: metadata.slotEnd,
    location: metadata.address ?? addressLine,
    paymentId,
    customerEmail: metadata.email,
    tiktokPromo,
  });

  if (eventId === 'duplicate' && paymentId) {
    const existing = await findCalendarEventByPaymentId(paymentId);
    if (!existing) {
      throw new Error('Duplicate calendar event could not be resolved');
    }
    return { eventId: existing.id };
  }

  return { eventId };
}

/** Sends confirmation email once per booking; updates calendar flag on success. */
export async function sendBookingConfirmationIfNeeded(
  metadata: Record<string, string>,
  eventId: string,
  paymentId?: string
): Promise<{ sent: boolean; skipped?: string; error?: string }> {
  const event = await getCalendarEventById(eventId);
  if (event?.extendedProperties.confirmationSent === '1') {
    return { sent: false, skipped: 'already_sent' };
  }

  if (!buildBookingEmailDetails(metadata)) {
    return { sent: false, skipped: 'no_email' };
  }

  try {
    await sendBookingConfirmationEmail(metadata, paymentId);
    await patchCalendarEventExtendedProperties(eventId, { confirmationSent: '1' });
    return { sent: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Confirmation email failed';
    return { sent: false, error: message };
  }
}
