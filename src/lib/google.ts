import { google } from 'googleapis';

const BUSINESS_START_HOUR = 8;
const BUSINESS_END_HOUR = 18;
export const CALENDAR_TIMEZONE = 'America/New_York';

/** Google expects local wall time when timeZone is set — not a UTC string with Z. */
function toCalendarDateTime(iso: string): string {
  const date = new Date(iso);
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: CALENDAR_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(date);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? '00';

  return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}:${get('second')}`;
}

function calendarErrorMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const data = (err as { response?: { data?: { error?: { message?: string } } } })
      .response?.data?.error?.message;
    if (data) return data;
  }
  return err instanceof Error ? err.message : 'Calendar insert failed';
}

function getAuth() {
  const email = import.meta.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = import.meta.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!email || !privateKey) {
    throw new Error('Google service account credentials are not configured');
  }

  return new google.auth.JWT({
    email,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/calendar'],
  });
}

export async function getBusyIntervals(date: string): Promise<{ start: Date; end: Date }[]> {
  const calendarId = import.meta.env.GOOGLE_CALENDAR_ID;
  if (!calendarId) {
    throw new Error('GOOGLE_CALENDAR_ID is not configured');
  }

  const auth = getAuth();
  const calendar = google.calendar({ version: 'v3', auth });

  const dayStart = new Date(`${date}T00:00:00`);
  const dayEnd = new Date(`${date}T23:59:59`);

  const response = await calendar.freebusy.query({
    requestBody: {
      timeMin: dayStart.toISOString(),
      timeMax: dayEnd.toISOString(),
      items: [{ id: calendarId }],
    },
  });

  const busy = response.data.calendars?.[calendarId]?.busy ?? [];
  return busy
    .filter((b) => b.start && b.end)
    .map((b) => ({
      start: new Date(b.start!),
      end: new Date(b.end!),
    }));
}

export interface TimeSlot {
  start: string;
  end: string;
  label: string;
}

export async function getAvailableSlots(
  date: string,
  durationHours: number
): Promise<TimeSlot[]> {
  const busyIntervals = await getBusyIntervals(date);
  const slots: TimeSlot[] = [];
  const durationMs = durationHours * 60 * 60 * 1000;
  const slotStepMs = 30 * 60 * 1000;

  const dayBase = new Date(`${date}T00:00:00`);
  const windowStart = new Date(dayBase);
  windowStart.setHours(BUSINESS_START_HOUR, 0, 0, 0);
  const windowEnd = new Date(dayBase);
  windowEnd.setHours(BUSINESS_END_HOUR, 0, 0, 0);

  const now = new Date();
  const isToday =
    dayBase.toDateString() === now.toDateString();

  for (
    let cursor = windowStart.getTime();
    cursor + durationMs <= windowEnd.getTime();
    cursor += slotStepMs
  ) {
    const slotStart = new Date(cursor);
    const slotEnd = new Date(cursor + durationMs);

    if (isToday && slotStart <= now) continue;

    const overlaps = busyIntervals.some(
      (busy) => slotStart < busy.end && slotEnd > busy.start
    );

    if (!overlaps) {
      slots.push({
        start: slotStart.toISOString(),
        end: slotEnd.toISOString(),
        label: formatSlotLabel(slotStart, slotEnd),
      });
    }
  }

  return slots;
}

function formatSlotLabel(start: Date, end: Date): string {
  const fmt = (d: Date) =>
    d.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  return `${fmt(start)} – ${fmt(end)}`;
}

export interface BookingEventDetails {
  summary: string;
  description: string;
  start: string;
  end: string;
  location: string;
  /** Prevents duplicate events when Square retries the webhook. */
  paymentId?: string;
  customerEmail?: string;
  tiktokPromo?: boolean;
}

export interface CalendarEventRecord {
  id: string;
  start: string;
  end: string;
  extendedProperties: Record<string, string>;
}

export type CalendarEmailFlags = {
  paymentId?: string;
  customerEmail?: string;
  tiktokPromo?: '0' | '1';
  confirmationSent?: '0' | '1';
  reminderDayBeforeSent?: '0' | '1';
  /** Legacy flag from 1-hour reminder cron; treated as already sent. */
  reminder1hSent?: '0' | '1';
  tiktokPostSent?: '0' | '1';
};

function buildExtendedProperties(
  details: BookingEventDetails
): CalendarEmailFlags {
  return {
    paymentId: details.paymentId ?? '',
    customerEmail: details.customerEmail ?? '',
    tiktokPromo: details.tiktokPromo ? '1' : '0',
    confirmationSent: '0',
    reminderDayBeforeSent: '0',
    tiktokPostSent: '0',
  };
}

function parseExtendedProperties(
  raw: Record<string, string> | null | undefined
): Record<string, string> {
  if (!raw) return {};
  return { ...raw };
}

function getCalendarClient() {
  const calendarId = import.meta.env.GOOGLE_CALENDAR_ID;
  if (!calendarId) {
    throw new Error('GOOGLE_CALENDAR_ID is not configured');
  }
  const auth = getAuth();
  return {
    calendarId,
    calendar: google.calendar({ version: 'v3', auth }),
  };
}

export async function getCalendarEventById(
  eventId: string
): Promise<CalendarEventRecord | null> {
  const { calendarId, calendar } = getCalendarClient();

  const response = await calendar.events.get({ calendarId, eventId });
  if (!response.data.start?.dateTime || !response.data.end?.dateTime) return null;

  return {
    id: eventId,
    start: new Date(response.data.start.dateTime).toISOString(),
    end: new Date(response.data.end.dateTime).toISOString(),
    extendedProperties: parseExtendedProperties(response.data.extendedProperties?.private),
  };
}

export async function findCalendarEventByPaymentId(
  paymentId: string
): Promise<CalendarEventRecord | null> {
  const { calendarId, calendar } = getCalendarClient();
  const iCalUID = `driveclean-${paymentId}@drivecleanli.com`;

  const response = await calendar.events.list({
    calendarId,
    iCalUID,
    maxResults: 1,
  });

  const event = response.data.items?.[0];
  if (!event?.id || !event.start?.dateTime || !event.end?.dateTime) return null;

  return {
    id: event.id,
    start: new Date(event.start.dateTime).toISOString(),
    end: new Date(event.end.dateTime).toISOString(),
    extendedProperties: parseExtendedProperties(event.extendedProperties?.private),
  };
}

export async function listCalendarEvents(
  timeMin: string,
  timeMax: string
): Promise<CalendarEventRecord[]> {
  const { calendarId, calendar } = getCalendarClient();

  const response = await calendar.events.list({
    calendarId,
    timeMin,
    timeMax,
    singleEvents: true,
    orderBy: 'startTime',
    maxResults: 100,
  });

  return (response.data.items ?? [])
    .filter((event) => event.id && event.start?.dateTime && event.end?.dateTime)
    .map((event) => ({
      id: event.id!,
      start: new Date(event.start!.dateTime!).toISOString(),
      end: new Date(event.end!.dateTime!).toISOString(),
      extendedProperties: parseExtendedProperties(event.extendedProperties?.private),
    }));
}

export async function patchCalendarEventExtendedProperties(
  eventId: string,
  patch: Partial<CalendarEmailFlags>
): Promise<void> {
  const { calendarId, calendar } = getCalendarClient();

  const existing = await calendar.events.get({ calendarId, eventId });
  const current = parseExtendedProperties(existing.data.extendedProperties?.private);

  await calendar.events.patch({
    calendarId,
    eventId,
    requestBody: {
      extendedProperties: {
        private: {
          ...current,
          ...patch,
        },
      },
    },
  });
}

export async function createCalendarEvent(
  details: BookingEventDetails
): Promise<string> {
  const { calendarId, calendar } = getCalendarClient();

  try {
    const event = await calendar.events.insert({
      calendarId,
      requestBody: {
        summary: details.summary,
        description: details.description,
        location: details.location,
        iCalUID: details.paymentId
          ? `driveclean-${details.paymentId}@drivecleanli.com`
          : undefined,
        extendedProperties: {
          private: buildExtendedProperties(details),
        },
        start: {
          dateTime: toCalendarDateTime(details.start),
          timeZone: CALENDAR_TIMEZONE,
        },
        end: {
          dateTime: toCalendarDateTime(details.end),
          timeZone: CALENDAR_TIMEZONE,
        },
      },
    });

    return event.data.id ?? '';
  } catch (err: unknown) {
    const status =
      err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { status?: number } }).response?.status
        : undefined;

    // Square sends multiple webhooks; treat duplicate insert as success
    if (status === 409) {
      return 'duplicate';
    }

    throw new Error(calendarErrorMessage(err));
  }
}
