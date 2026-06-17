import type { ServiceAddress } from '../types/address';

export function buildFormattedAddress(parts: {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zip: string;
}): string {
  const street = parts.line2?.trim()
    ? `${parts.line1}, ${parts.line2.trim()}`
    : parts.line1;
  return `${street}, ${parts.city}, ${parts.state} ${parts.zip}`;
}

export function withLine2(address: ServiceAddress, line2: string): ServiceAddress {
  const trimmed = line2.trim();
  return {
    ...address,
    line2: trimmed || undefined,
    formatted: buildFormattedAddress({
      line1: address.line1,
      line2: trimmed || undefined,
      city: address.city,
      state: address.state,
      zip: address.zip,
    }),
  };
}

/** Street line only — used for the selected-address summary (no city/state). */
export function formatStreetSummary(address: ServiceAddress): string {
  return address.line2?.trim()
    ? `${address.line1}, ${address.line2.trim()}`
    : address.line1;
}
