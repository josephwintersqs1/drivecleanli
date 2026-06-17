import type { BookingConfirmationSnapshot } from '../adapters/bookingConfirmation';

export const BOOKING_CONFIRMATION_STORAGE_KEY = 'dc-booking-confirmation';

export function saveBookingConfirmation(snapshot: BookingConfirmationSnapshot): void {
  if (typeof window === 'undefined') return;

  const json = JSON.stringify(snapshot);
  sessionStorage.setItem(BOOKING_CONFIRMATION_STORAGE_KEY, json);
  localStorage.setItem(BOOKING_CONFIRMATION_STORAGE_KEY, json);
}

export function readBookingConfirmation(): BookingConfirmationSnapshot | null {
  if (typeof window === 'undefined') return null;

  const raw =
    sessionStorage.getItem(BOOKING_CONFIRMATION_STORAGE_KEY) ??
    localStorage.getItem(BOOKING_CONFIRMATION_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as BookingConfirmationSnapshot;
    if (!parsed.slotStart || !parsed.firstName) return null;
    return parsed;
  } catch {
    return null;
  }
}
