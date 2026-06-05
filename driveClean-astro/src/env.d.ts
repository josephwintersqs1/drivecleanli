/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly SQUARE_ACCESS_TOKEN: string;
  readonly SQUARE_LOCATION_ID: string;
  readonly GOOGLE_SERVICE_ACCOUNT_EMAIL: string;
  readonly GOOGLE_PRIVATE_KEY: string;
  readonly GOOGLE_CALENDAR_ID: string;
  readonly SITE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
