import { buildFormattedAddress } from '../lib/format-address';
import type { ServiceAddress } from '../types/address';

type LegacyComponent = google.maps.GeocoderAddressComponent;

function findLegacy(components: LegacyComponent[], type: string) {
  return components.find((c) => c.types.includes(type));
}

function getLegacyLong(components: LegacyComponent[], type: string): string {
  return findLegacy(components, type)?.long_name ?? '';
}

function getLegacyShort(components: LegacyComponent[], type: string): string {
  return findLegacy(components, type)?.short_name ?? '';
}

function parseAddressParts(
  getLong: (type: string) => string,
  getShort: (type: string) => string
): Omit<ServiceAddress, 'placeId' | 'formatted'> | null {
  const streetNumber = getLong('street_number');
  const route = getLong('route');
  const line1 = [streetNumber, route].filter(Boolean).join(' ').trim();
  const city =
    getLong('locality') ||
    getLong('sublocality') ||
    getLong('administrative_area_level_2');
  const state = getShort('administrative_area_level_1');
  const zip = getLong('postal_code');

  if (!line1 || !city || !state || !zip) return null;

  return { line1, city, state, zip };
}

/** Maps a Google Places result (legacy Autocomplete) to a validated US service address. */
export function placeResultToAddress(
  place: google.maps.places.PlaceResult
): ServiceAddress | null {
  if (!place.place_id || !place.address_components?.length) {
    return null;
  }

  const parts = parseAddressParts(
    (type) => getLegacyLong(place.address_components!, type),
    (type) => getLegacyShort(place.address_components!, type)
  );
  if (!parts) return null;

  const formatted =
    place.formatted_address ??
    buildFormattedAddress(parts);

  return {
    placeId: place.place_id,
    formatted,
    ...parts,
  };
}

/** Maps a Places API (New) Place object after fetchFields(). */
export function placeToAddressFromPlace(
  place: google.maps.places.Place
): ServiceAddress | null {
  const placeId = place.id;
  const components = place.addressComponents;
  if (!placeId || !components?.length) return null;

  const parts = parseAddressParts(
    (type) => components.find((c) => c.types.includes(type))?.longText ?? '',
    (type) => components.find((c) => c.types.includes(type))?.shortText ?? ''
  );
  if (!parts) return null;

  const formatted =
    place.formattedAddress ?? buildFormattedAddress(parts);

  return {
    placeId,
    formatted,
    ...parts,
  };
}
