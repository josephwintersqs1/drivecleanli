/** GA4 measurement ID — override with PUBLIC_GA_MEASUREMENT_ID in env. */
export const GA_MEASUREMENT_ID =
  import.meta.env.PUBLIC_GA_MEASUREMENT_ID?.trim() || 'G-ZGDPN87L22';

type GtagCommand = 'event' | 'config' | 'js' | 'set';

declare global {
  interface Window {
    gtag?: (...args: [GtagCommand, ...unknown[]]) => void;
  }
}

/** Fire a custom GA4 event (booking funnel, CTAs, etc.). No-op if gtag is unavailable. */
export function trackEvent(
  eventName: string,
  params?: Record<string, string | number | boolean>
): void {
  if (typeof window === 'undefined' || !window.gtag || !GA_MEASUREMENT_ID) return;
  window.gtag('event', eventName, params);
}
