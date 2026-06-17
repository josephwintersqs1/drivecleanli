import type { PaymentMode } from '../data/services';
import type { BookingPayload } from '../types/booking';
import { getBookingPriceSummary } from '../lib/tiktok-promo';

export interface BookingConfirmationSnapshot {
  firstName: string;
  lastName: string;
  serviceId: string;
  vehicleTierId: string;
  addOnIds: string[];
  slotStart: string;
  slotEnd: string;
  addressFormatted: string;
  paymentMode: PaymentMode;
  tiktokPromo: boolean;
  paidAmount: number;
  total: number;
  balanceDue: number;
  savedAt: string;
}

export function buildBookingConfirmationSnapshot(
  booking: BookingPayload
): BookingConfirmationSnapshot {
  const { total, dueToday, balanceDue } = getBookingPriceSummary(
    booking.serviceId,
    booking.vehicleTierId,
    booking.addOnIds,
    booking.paymentMode,
    booking.tiktokPromo
  );

  return {
    firstName: booking.firstName,
    lastName: booking.lastName,
    serviceId: booking.serviceId,
    vehicleTierId: booking.vehicleTierId,
    addOnIds: booking.addOnIds,
    slotStart: booking.slotStart,
    slotEnd: booking.slotEnd,
    addressFormatted: booking.address.formatted,
    paymentMode: booking.paymentMode,
    tiktokPromo: booking.tiktokPromo,
    paidAmount: dueToday,
    total,
    balanceDue,
    savedAt: new Date().toISOString(),
  };
}

/** Compact payload embedded in Square redirect URL — survives cross-site checkout. */
export function encodeConfirmationForRedirect(snapshot: BookingConfirmationSnapshot): string {
  return Buffer.from(JSON.stringify(snapshot), 'utf8').toString('base64url');
}

export function decodeConfirmationFromRedirect(
  encoded: string
): BookingConfirmationSnapshot | null {
  if (!encoded.trim()) return null;

  try {
    const json = Buffer.from(encoded, 'base64url').toString('utf8');
    return parseConfirmationSnapshot(json);
  } catch {
    return null;
  }
}

export function snapshotFromOrderMetadata(
  meta: Record<string, string>
): BookingConfirmationSnapshot | null {
  if (!meta.slotStart || !meta.firstName) return null;

  const paymentMode: PaymentMode = meta.paymentMode === 'deposit' ? 'deposit' : 'full';

  return {
    firstName: meta.firstName,
    lastName: meta.lastName ?? '',
    serviceId: meta.serviceId ?? '',
    vehicleTierId: meta.vehicleTierId ?? '',
    addOnIds: meta.addOnIds ? meta.addOnIds.split(',').filter(Boolean) : [],
    slotStart: meta.slotStart,
    slotEnd: meta.slotEnd ?? '',
    addressFormatted: meta.address ?? '',
    paymentMode,
    tiktokPromo: meta.tiktokPromo === 'yes',
    paidAmount: Number(meta.amountDueToday) || 0,
    total: Number(meta.totalAmount) || 0,
    balanceDue: Number(meta.balanceDue) || 0,
    savedAt: new Date().toISOString(),
  };
}

function parseConfirmationSnapshot(json: string): BookingConfirmationSnapshot | null {
  const parsed = JSON.parse(json) as BookingConfirmationSnapshot;
  if (!parsed.slotStart || !parsed.firstName) return null;
  return parsed;
}
