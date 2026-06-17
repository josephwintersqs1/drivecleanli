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

### Google Calendar

1. Create a service account and download credentials.
2. Share your booking calendar with the service account email (Make changes to events).
3. Set `GOOGLE_CALENDAR_ID` to the calendar ID.

### Square webhook

Point Square webhooks to `POST /api/webhook` for `payment.updated` (and optionally `order.updated`). Metadata on the order is used to create the calendar event after payment.

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
| `POST /api/webhook` | Square webhook → Google Calendar event |
| `GET /api/calendar-health` | Verify calendar read/write access |
| `POST /api/calendar-sync` | Re-create calendar event from Square `orderId` |

## Deploy

Deploy to Vercel. Set all environment variables in the project settings. The Vercel adapter is preconfigured in `astro.config.mjs`.
