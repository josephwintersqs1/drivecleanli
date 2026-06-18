/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly SQUARE_ACCESS_TOKEN: string;
  readonly SQUARE_LOCATION_ID: string;
  readonly GOOGLE_SERVICE_ACCOUNT_EMAIL: string;
  readonly GOOGLE_PRIVATE_KEY: string;
  readonly GOOGLE_CALENDAR_ID: string;
  readonly SITE_URL?: string;
  readonly RESEND_API_KEY?: string;
  readonly RESEND_FROM_EMAIL?: string;
  readonly CRON_SECRET?: string;
  readonly PUBLIC_GA_MEASUREMENT_ID?: string;
  readonly PUBLIC_GOOGLE_MAPS_API_KEY?: string;
  readonly PUBLIC_GOOGLE_PLACES_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
