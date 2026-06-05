/** Browser key for Maps JavaScript API + Places API (New). Either env var may be set. */
export function getGoogleMapsApiKey(): string | undefined {
  const maps = import.meta.env.PUBLIC_GOOGLE_MAPS_API_KEY;
  const places = import.meta.env.PUBLIC_GOOGLE_PLACES_API_KEY;

  if (typeof maps === 'string' && maps.trim()) return maps.trim();
  if (typeof places === 'string' && places.trim()) return places.trim();
  return undefined;
}
