function extractErrorText(err: unknown): string {
  if (err instanceof Error) {
    const extended = err as Error & { code?: string };
    return [extended.message, extended.code].filter(Boolean).join(' ');
  }
  if (typeof err === 'string') return err;
  if (typeof err === 'object' && err !== null && 'message' in err) {
    return String((err as { message: unknown }).message);
  }
  return '';
}

export const GOOGLE_BILLING_MESSAGE =
  'Billing is not enabled on your Google Cloud project. Places autocomplete requires a linked billing account (most small sites stay within the ~$200/month free Maps credit). Enable billing, wait a few minutes, then hard-refresh.';

export const GOOGLE_REFERRER_MESSAGE =
  'This API key is blocked for localhost. In Google Cloud → Credentials → your key → Application restrictions, add http://localhost:4321/* and http://127.0.0.1:4321/*';

export const GOOGLE_PLACES_SETUP_MESSAGE =
  'Places autocomplete was denied. Confirm billing is enabled, then enable Maps JavaScript API, Places API (New), and legacy Places API on the same project as this key. On the key, allow those APIs (or temporarily set “Don’t restrict key” to test). Restart npm run dev after .env changes.';

/** User-facing message for Google Places / Maps failures. */
export function describeGooglePlacesError(err: unknown): string {
  const raw = extractErrorText(err);

  if (/billing|enable Billing/i.test(raw)) {
    return GOOGLE_BILLING_MESSAGE;
  }

  if (/RefererNotAllowed|referer/i.test(raw)) {
    return GOOGLE_REFERRER_MESSAGE;
  }

  if (
    /REQUEST_DENIED|ApiNotActivated|PERMISSION_DENIED|not authorized|not allowed to use the Place|does not have permission/i.test(
      raw
    )
  ) {
    // Generic denial from a browser-restricted key often means billing or wrong project/key.
    return `${GOOGLE_BILLING_MESSAGE} If billing is already on, ${GOOGLE_PLACES_SETUP_MESSAGE}`;
  }

  if (raw) return raw;
  return GOOGLE_PLACES_SETUP_MESSAGE;
}
