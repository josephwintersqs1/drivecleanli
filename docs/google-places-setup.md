# Google Places (address autocomplete)

Booking uses **Places API (New)** via the `PlaceAutocompleteElement` widget on the contact step.

> **New Google Cloud projects** (with billing added in 2024+) usually **cannot** use the old `Autocomplete` class. You must enable **Places API (New)**.

## Billing — required (even for “free” usage)

**Enabling APIs in the Library is not enough.** Google Maps Platform requires a **billing account linked to the project** before Places autocomplete will work. Without billing, requests return `REQUEST_DENIED` or `PERMISSION_DENIED` even when every API looks enabled.

1. Open [Google Cloud Billing](https://console.cloud.google.com/billing)
2. Link a billing account to the **same project** that owns your browser API key
3. Wait 2–5 minutes, then hard-refresh `/book`

You are not charged on every page load — see below for typical costs.

### Will you be charged every time?

Google requires billing on the project, but that does **not** mean every page view bills you.

| What happens | Typical cost for low volume |
|--------------|----------------------------|
| Loading the Maps JS script | Usually no charge by itself |
| User types and sees suggestions | Billed per **Autocomplete session** (not per keystroke) |
| Selecting one address | Part of that session |

For a small mobile detailing site (dozens of bookings per month):

- Google Maps Platform includes **~$200/month free credit** on eligible SKUs.
- Low traffic often stays **within free credit** (effectively $0).
- Set a **budget alert** in Cloud Console (e.g. $10/month) so you get email if usage spikes.

You are **not** charged “every time someone opens the site” — only when the Places autocomplete API is actually used.

## 1. Enable APIs

In [Google Cloud Console](https://console.cloud.google.com/) → **APIs & Services → Library**, enable **all three**:

1. **Maps JavaScript API**
2. **Places API (New)** ← required for new projects
3. **Places API** (legacy) — [enable here](https://console.cloud.google.com/apis/library/places-backend.googleapis.com)

Google’s autocomplete widget often returns `REQUEST_DENIED` until **legacy Places API** is also enabled on the project, even when Places API (New) is on. This is a Google Cloud quirk reported for new projects.

## 2. Create an API key

1. **APIs & Services → Credentials → Create credentials → API key**
2. Restrict the key:
   - **Application restrictions:** HTTP referrers
     - `http://localhost:4321/*`
     - `https://your-production-domain.com/*`
   - **API restrictions:** allow at least:
     - Maps JavaScript API
     - Places API (New)
     - Places API (legacy)

## 3. Add to `.env`

```env
PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here
```

You can use the **same key** for Maps JavaScript API and Places API (New). Enable both APIs on that key in Cloud Console.

`PUBLIC_GOOGLE_PLACES_API_KEY` still works as a fallback if the Maps variable is empty.

Rules:

- Must start with **`PUBLIC_`** so Astro exposes it to the browser.
- **Restart** `npm run dev` after changing `.env`.
- Do **not** use names without the `PUBLIC_` prefix — they will not load in the browser.

## 4. Test on the booking flow

1. Open http://localhost:4321/book and go to **Your details** (step 4).
2. Type a US street address in the service address field.
3. Pick a row from Google’s dropdown.
4. You should see a confirmation line: street, city, state, ZIP.

## Troubleshooting

| Symptom | Fix |
|--------|-----|
| Yellow box: add `PUBLIC_GOOGLE_MAPS_API_KEY` | Add key to `.env`, restart dev server |
| “Google rejected this API key” | Add `http://localhost:4321/*` to key referrer restrictions; enable billing |
| No dropdown when typing | Enable **Places API (New)** *and* [legacy **Places API**](https://console.cloud.google.com/apis/library/places-backend.googleapis.com); wait a few minutes |
| `REQUEST_DENIED` / “Address search failed” | **Billing not enabled** (most common), or key is from a different project than the enabled APIs |
| APIs enabled but still denied | Enable [billing](https://console.cloud.google.com/billing); temporarily set key to “Don’t restrict key” to rule out restriction issues |
| Works in Console but not locally | Wrong env var name, or dev server not restarted |
| `RefererNotAllowedMapError` in browser console | Referrer restriction missing localhost |

Open browser **DevTools → Console** on the contact step for specific Google errors.

## Behavior

- Users must **select** a suggestion (typing alone is not enough).
- Parsed fields: street, city, state, ZIP (US only).
- Stored on the Square order and Google Calendar event.
