import type { BookingPayload } from '../types/booking';
import { truncateForMetadata } from '../lib/validate-contact';
import { getBookingPriceSummary } from '../lib/tiktok-promo';

const DELIM = '|';

/** Square allows at most 10 order metadata keys (255 chars each). */
export function buildSquareOrderMetadata(
  booking: BookingPayload
): Record<string, string> {
  const { subtotal, total, dueToday, balanceDue } = getBookingPriceSummary(
    booking.serviceId,
    booking.vehicleTierId,
    booking.addOnIds,
    booking.paymentMode,
    booking.tiktokPromo
  );

  const metadata: Record<string, string> = {
    slotStart: booking.slotStart,
    slotEnd: booking.slotEnd,
    customer: [booking.firstName, booking.lastName, booking.phone].join(DELIM),
    address: truncateForMetadata(booking.address.formatted),
    pricing: [
      String(subtotal),
      String(total),
      String(dueToday),
      String(balanceDue),
      booking.paymentMode,
      booking.tiktokPromo ? '1' : '0',
    ].join(DELIM),
    sel: [booking.serviceId, booking.vehicleTierId, booking.addOnIds.join(',')].join(DELIM),
  };

  if (booking.notes.trim()) {
    metadata.notes = truncateForMetadata(booking.notes);
  }

  return metadata;
}

/** Expands packed metadata (and passes through legacy flat keys). */
export function expandSquareOrderMetadata(
  raw: Record<string, string>
): Record<string, string> {
  const out: Record<string, string> = { ...raw };

  if (raw.customer && !raw.firstName) {
    const parts = raw.customer.split(DELIM);
    const phone = parts.pop() ?? '';
    out.firstName = parts[0] ?? '';
    out.lastName = parts.slice(1).join(DELIM);
    out.phone = phone;
  }

  if (raw.pricing && !raw.totalAmount) {
    const parts = raw.pricing.split(DELIM);
    if (parts.length >= 6) {
      out.subtotalAmount = parts[0] ?? '';
      out.totalAmount = parts[1] ?? '';
      out.amountDueToday = parts[2] ?? '';
      out.balanceDue = parts[3] ?? '';
      out.paymentMode = parts[4] ?? 'full';
      out.tiktokPromo = parts[5] === '1' ? 'yes' : 'no';
    } else {
      const [totalAmount, amountDueToday, balanceDue, paymentMode] = parts;
      out.totalAmount = totalAmount ?? '';
      out.amountDueToday = amountDueToday ?? '';
      out.balanceDue = balanceDue ?? '';
      out.paymentMode = paymentMode ?? 'full';
    }
  }

  if (raw.sel && !raw.serviceId) {
    const [serviceId, vehicleTierId, addOnIds] = raw.sel.split(DELIM);
    out.serviceId = serviceId ?? '';
    out.vehicleTierId = vehicleTierId ?? '';
    out.addOnIds = addOnIds ?? '';
  }

  return out;
}
