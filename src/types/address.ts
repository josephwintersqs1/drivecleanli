export interface ServiceAddress {
  placeId: string;
  line1: string;
  /** Apt, suite, unit, floor, etc. */
  line2?: string;
  city: string;
  state: string;
  zip: string;
  formatted: string;
}
