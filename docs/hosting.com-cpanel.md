# Deploy on hosting.com (cPanel Node.js)

This site runs as a **Node.js SSR app** on cPanel — not as static HTML uploads.

## 1. Domain in cPanel

1. **Domains → Create a New Domain**
2. Domain: `drivecleanli.com`
3. **Uncheck** “Share document root with…”
4. Document root: e.g. `drivecleanli` (not `public_html` — keeps `.env` private)

Point DNS at hosting.com (A record `@` → server IP, CNAME `www` → your host). Remove Vercel DNS records if you added them.

## 2. Clone the repo

**Files → Git Version Control → Create**

| Field | Value |
|-------|--------|
| Clone URL | `https://github.com/josephwintersqs1/drivecleanli.git` |
| Repository Path | `drivecleanli` (same as document root) |

## 3. Create the Node.js app

**Software → Setup Node.js App → Create Application**

| Field | Value |
|-------|--------|
| Node.js version | **22.22.3** |
| Application mode | **Production** |
| Application root | `drivecleanli` |
| Application URL | `drivecleanli.com` |
| Application startup file | `passenger.mjs` |

Leave the app created but not started until after build (step 4).

## 4. Environment variables

In the Node.js app editor, add every variable from `.env.example`:

| Variable | Example / notes |
|----------|-----------------|
| `SQUARE_ACCESS_TOKEN` | Square dashboard |
| `SQUARE_LOCATION_ID` | Square location ID |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Service account email |
| `GOOGLE_PRIVATE_KEY` | Full PEM key (paste with line breaks) |
| `GOOGLE_CALENDAR_ID` | Calendar ID |
| `SITE_URL` | `https://www.drivecleanli.com` |
| `RESEND_API_KEY` | Resend dashboard |
| `RESEND_FROM_EMAIL` | `DriveClean <services@drivecleanli.com>` |
| `CRON_SECRET` | Random string (`openssl rand -hex 32`) |
| `ASTRO_NODE_AUTOSTART` | `disabled` (required for cPanel Passenger) |
| `PUBLIC_GA_MEASUREMENT_ID` | `G-ZGDPN87L22` |
| `PUBLIC_GOOGLE_MAPS_API_KEY` | Browser Maps/Places key |

Click **Done** on each row, then **Save**.

## 5. Install, build, start

Use **Terminal** or **SSH**. At the top of the Node.js app page, copy the **Enter to the virtual environment** command, then run:

```bash
# paste the source .../nodevenv/.../activate && cd ... command from cPanel

npm install
npm run build
```

Back in cPanel Node.js app → **Restart** (or Start).

Visit `https://drivecleanli.com`.

## 6. Daily email reminder cron

**Advanced → Cron Jobs** → add once daily (e.g. **9:00 AM** server time):

```bash
curl -fsS -H "Authorization: Bearer YOUR_CRON_SECRET" https://www.drivecleanli.com/api/email-reminders
```

Replace `YOUR_CRON_SECRET` with the same value as the env var.

## 7. Square webhook

Square Developer Dashboard → Webhooks:

- URL: `https://www.drivecleanli.com/api/webhook`
- Event: `payment.updated`

## 8. Updates after code changes

```bash
cd ~/drivecleanli   # or your path
git pull
npm install
npm run build
```

Then **Restart** the Node.js app in cPanel.

## Troubleshooting

| Problem | Fix |
|---------|-----|
| 503 / app not running | Startup file must be `passenger.mjs`, env `ASTRO_NODE_AUTOSTART=disabled`, and `dist/` uploaded |
| Payment redirect wrong | `SITE_URL` must match live domain |
| No calendar/email | Square webhook URL + env vars |
| Cron 401 | `CRON_SECRET` in env must match curl header |
