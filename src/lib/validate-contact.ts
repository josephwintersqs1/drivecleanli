import { AsYouType, isValidPhoneNumber, parsePhoneNumber } from 'libphonenumber-js';
import type { ServiceAddress } from '../types/address';

export const NOTES_MAX_LENGTH = 500;

/** Formats digits as the user types, e.g. 7045464456 → (704) 546-4456 */
export function formatUSPhoneAsYouType(input: string): string {
  const digits = input.replace(/\D/g, '');
  if (!digits) return '';
  return new AsYouType('US').input(digits);
}

export function validateUSPhone(phone: string): boolean {
  const trimmed = phone.trim();
  if (!trimmed) return false;
  return isValidPhoneNumber(trimmed, 'US');
}

export function normalizeUSPhone(phone: string): string | null {
  try {
    const parsed = parsePhoneNumber(phone.trim(), 'US');
    if (!parsed?.isValid()) return null;
    return parsed.format('E.164');
  } catch {
    return null;
  }
}

export function formatUSPhoneDisplay(phone: string): string {
  try {
    const parsed = parsePhoneNumber(phone.trim(), 'US');
    if (parsed?.isValid()) return parsed.formatNational();
  } catch {
    /* use raw input */
  }
  return phone;
}

export function isValidServiceAddress(
  address: ServiceAddress | null | undefined
): address is ServiceAddress {
  if (!address) return false;
  return !!(
    address.placeId &&
    address.line1?.trim() &&
    address.city?.trim() &&
    address.state?.trim() &&
    address.zip?.trim()
  );
}

export function validateNotes(notes: string): boolean {
  return notes.length <= NOTES_MAX_LENGTH;
}

export function truncateForMetadata(value: string, max = 255): string {
  return value.length <= max ? value : `${value.slice(0, max - 1)}…`;
}
