# DriveClean Astro

Instant booking website for a mobile car detailing service. Built with Astro (SSR), React islands, Tailwind CSS, Square payments, and Google Calendar.

## Stack

- **Astro 6** — SSR mode with `@astrojs/vercel`
- **React** — Multi-step booking wizard at `/book`
- **Tailwind CSS v4**
- **Square** — Payment Links checkout
- **Google Calendar API** — Availability (free/busy) and confirmed bookings

## Setup

```bash
cp .env.example .env
# Fill in env vars (see below)
npm install
npm run dev
```

### Environment variables

| Variable | Description |
|----------|-------------|
| `SQUARE_ACCESS_TOKEN` | Square API access token |
| `SQUARE_LOCATION_ID` | Square location ID for orders |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Service account email |
| `GOOGLE_PRIVATE_KEY` | Service account private key (use `\n` for newlines in .env) |
| `GOOGLE_CALENDAR_ID` | Calendar ID for availability & events |
| `SITE_URL` | Public site URL (Square redirect after payment) |
| `PUBLIC_GA_MEASUREMENT_ID` | GA4 measurement ID (default `G-ZGDPN87L22`; loaded on all pages via Layout) |
| `RESEND_API_KEY` | Resend API key for booking emails |
| `RESEND_FROM_EMAIL` | From address, e.g. `DriveClean <services@drivecleanli.com>` |
| `CRON_SECRET` | Bearer token for `/api/email-reminders` (see cron setup below) |
| `PUBLIC_GOOGLE_MAPS_API_KEY` | Browser key for address autocomplete |

### Google Calendar

1. Create a service account and download credentials.
2. Share your booking calendar with the service account email (Make changes to events).
3. Set `GOOGLE_CALENDAR_ID` to the calendar ID.

### Square webhook

Point Square webhooks to `POST /api/webhook` for `payment.updated` (and optionally `order.updated`). Metadata on the order is used to create the calendar event and send a Resend confirmation email after payment.

### Email reminders (Resend + Vercel Cron)

Set `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, and `CRON_SECRET`. Vercel Cron runs once daily (9:00 AM Eastern, `0 14 * * *` UTC) and calls `GET /api/email-reminders` with `Authorization: Bearer <CRON_SECRET>` to send:

- **Day-before reminder** — appointments scheduled for the next calendar day (America/New_York)
- **TikTok post-visit reminder** — promo bookings whose appointment ended the previous calendar day

Confirmation email on payment still works via webhook and does not depend on cron.

## Scripts

- `npm run dev` — Local dev server
- `npm run build` — Production build (Vercel)
- `npm run preview` — Preview production build

## Routes

| Route | Description |
|-------|-------------|
| `/` | Homepage — hero, services, testimonials |
| `/book` | 5-step booking wizard |
| `GET /api/availability?date=&serviceId=` | Open time slots |
| `POST /api/checkout` | Create Square Payment Link |
| `POST /api/webhook` | Square webhook → Google Calendar event + confirmation email |
| `GET /api/email-reminders` | Cron: day-before reminder + TikTok post-visit emails (Bearer `CRON_SECRET`) |
| `GET /api/calendar-health` | Verify calendar read/write access |
| `POST /api/calendar-sync` | Re-create calendar event from Square `orderId` |

## Deploy

Deploy to Vercel. Set all environment variables in the project settings. The Vercel adapter is preconfigured in `astro.config.mjs`.

For a quick DNS cutover placeholder, use the standalone static page in [`coming-soon/index.html`](coming-soon/index.html) — upload it to any host and rename to `index.html`.
