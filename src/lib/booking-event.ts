import { createCalendarEvent } from './google';
import {
  formatPrice,
  getAddOnById,
  getServiceById,
  getVehicleTierLabel,
} from '../data/services';

export function hasBookingMetadata(
  metadata: Record<string, string> | null | undefined
): metadata is Record<string, string> {
  return !!metadata?.slotStart && !!metadata?.slotEnd;
}

export async function createBookingCalendarEvent(
  metadata: Record<string, string>,
  paymentId?: string
): Promise<string> {
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
    `Address: ${addressLine}`,
    tiktokPromo
      ? 'TikTok promo: 10% off — send post-appointment share reminder email'
      : null,
    notes ? `Notes: ${notes}` : null,
    `Service: ${service?.name ?? metadata.serviceId}`,
    vehicleLabel !== 'Standard' ? `Vehicle: ${vehicleLabel}` : null,
    addOnNames.length ? `Add-ons: ${addOnNames.join(', ')}` : null,
    paymentLine,
    paymentId ? `Payment ID: ${paymentId}` : null,
  ]
    .filter(Boolean)
    .join('\n');

  return createCalendarEvent({
    summary: `DriveClean – ${service?.name ?? 'Detail'} (${customerName})`,
    description,
    start: metadata.slotStart,
    end: metadata.slotEnd,
    location: metadata.address ?? addressLine,
    paymentId,
  });
}
