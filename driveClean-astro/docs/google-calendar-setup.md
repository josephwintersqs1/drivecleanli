# Google Calendar Setup Guide

This guide is for whoever manages the DriveClean booking calendar. You do **not** need to write code or use the Google Cloud console. You only need access to Google Calendar in a web browser.

The booking website reads your calendar to show open appointment times, and adds new jobs to the calendar after a customer pays. A special Google account (a “service account”) acts on behalf of the website. You must invite that account to your calendar so it can see availability and add bookings.

---

## What you need before you start

- A Google account with access to Google Calendar
- Permission to create or manage a calendar for DriveClean bookings
- About 10 minutes

---

## Step 1: Create a calendar for bookings (recommended)

Using a **dedicated calendar** keeps DriveClean jobs separate from personal events and makes availability easier to manage.

1. Open [Google Calendar](https://calendar.google.com).
2. On the left, find **Other calendars** and click the **+** next to it.
3. Choose **Create new calendar**.
4. Name it something clear, for example: **DriveClean Bookings**.
5. Click **Create calendar**.

You may use an existing calendar instead, but a dedicated booking calendar is strongly recommended.

---

## Step 2: Share the calendar with DriveClean (required)

The website cannot read or update your calendar until you add DriveClean’s service account as a person on that calendar.

1. In the left sidebar, find your booking calendar (e.g. **DriveClean Bookings**).
2. Click the **three dots (⋮)** next to the calendar name.
3. Select **Settings and sharing**.
4. Scroll to **Share with specific people**.
5. Click **Add people**.
6. Enter this email address **exactly**:

   **`drivecleanli-calendar-sync@drivecleanli.iam.gserviceaccount.com`**

7. For permissions, choose **Make changes to events** (not “See all event details only” or “See free/busy”).
8. Uncheck **Send email notification** if you prefer—the service account does not read email.
9. Click **Send** or **Save**.

Until this step is done, the booking site cannot show correct availability or add appointments after payment.

---

## Step 3: Copy the Calendar ID for your team

Someone on the technical side needs the **Calendar ID** to connect the website. You can find it on the same settings page:

1. Stay on **Settings and sharing** for your booking calendar.
2. Scroll down to **Integrate calendar**.
3. Copy the **Calendar ID**. It usually looks like one of these:
   - `something@group.calendar.google.com` (for a calendar you created), or
   - `yourname@gmail.com` (if using your primary calendar)

4. Send that Calendar ID securely to whoever deploys or maintains the website. They will add it to the project configuration as `GOOGLE_CALENDAR_ID`.

**Note:** The Calendar ID is **not** the same as:
- A “Book appointment” or booking page link (`calendar.app.google/...`)
- An embed code or iframe URL from Google’s appointment scheduler

If you only see sharing options for a “booking page,” open settings from **My calendars** → **⋮** on the calendar itself, not from the appointment booking page.

---

## Step 4: How your calendar affects the website

### Showing open times

- The site treats **8:00 AM – 6:00 PM** as the window when appointments can be offered (times may display in your local timezone).
- Any event already on this calendar during that window counts as **busy**—customers will not be offered that time.
- To block a day or time (vacation, lunch, another job), add an event on this calendar like you normally would.

### After a customer pays

- A new event is added automatically to this same calendar with the customer’s name, phone, address, service, and vehicle details.
- You do not need to manually create the event if payment and webhooks are configured correctly on the technical side.

---

## Step 5: Day-to-day tips

| Goal | What to do |
|------|------------|
| Block time off | Add an all-day or timed event on the booking calendar |
| Stop bookings on a holiday | Mark the day busy on the booking calendar |
| See only DriveClean jobs | Use the dedicated **DriveClean Bookings** calendar view |
| Change who gets calendar access | **Settings and sharing** → manage people (keep the service account on the list) |

**Important:** Do not remove **`drivecleanli-calendar-sync@drivecleanli.iam.gserviceaccount.com`** from the calendar’s sharing list. If it is removed, the website will stop showing availability and will not add new bookings.

---

## Checklist for handoff

- [ ] Booking calendar created (or existing calendar chosen)
- [ ] **`drivecleanli-calendar-sync@drivecleanli.iam.gserviceaccount.com`** added with **Make changes to events**
- [ ] Calendar ID copied from **Integrate calendar** and given to technical contact
- [ ] Team knows to put blocks and jobs on this calendar, not only on a separate Google “booking page”

---

## If something isn’t working

| Problem | What to check |
|---------|----------------|
| No times show on the website | Service account email is shared on the **correct** calendar with **Make changes to events** |
| Website worked before, then stopped | Service account was removed from sharing, or calendar was deleted |
| Wrong calendar receives bookings | Confirm Calendar ID matches the calendar you shared with the service account |
| Customer paid but no event appeared | Service account likely has **read-only** access. Change permission to **Make changes to events**, then retry (see below) |
| Availability works but bookings never appear | Same as above—free/busy read works without write permission |

### Retry after fixing calendar sharing

1. Fix sharing for **`drivecleanli-calendar-sync@drivecleanli.iam.gserviceaccount.com`** → **Make changes to events**.
2. Verify: open `GET /api/calendar-health` on your site — `writeAccess` should be `true`.
3. Re-sync a paid order: `POST /api/calendar-sync` with JSON `{ "orderId": "<Square order id>" }` (find the order in Square Sandbox Dashboard → Orders).

For Square payments, environment variables, and deployment, refer to the project README or your technical contact.
