import { expandSquareOrderMetadata } from '../adapters/squareOrderMetadata';
import { buildBookingEmailDetails } from '../adapters/bookingEmail';
import {
  addCalendarDays,
  getDateKeyInTimezone,
} from './format-booking-slot';
import {
  CALENDAR_TIMEZONE,
  listCalendarEvents,
  patchCalendarEventExtendedProperties,
} from './google';
import {
  sendDayBeforeReminderEmail,
  sendTiktokPostVisitEmail,
} from './email';
import { getOrderBookingMetadata } from './square';

const MS_HOUR = 60 * 60 * 1000;
const LOOKBACK_HOURS = 48;

async function resolveMetadataForEvent(
  paymentId: string | undefined,
  customerEmail: string | undefined
): Promise<Record<string, string> | null> {
  if (paymentId) {
    const raw = await getOrderBookingMetadata(paymentId);
    if (raw) return expandSquareOrderMetadata(raw);
  }
  if (customerEmail) {
    return { email: customerEmail, firstName: 'there', slotStart: '', slotEnd: '' };
  }
  return null;
}

function reminderAlreadySent(props: Record<string, string>): boolean {
  return props.reminderDayBeforeSent === '1' || props.reminder1hSent === '1';
}

export async function processScheduledBookingEmails(): Promise<{
  remindersSent: number;
  tiktokSent: number;
  errors: string[];
}> {
  const now = Date.now();
  const errors: string[] = [];
  let remindersSent = 0;
  let tiktokSent = 0;

  const todayKey = getDateKeyInTimezone(new Date(now).toISOString(), CALENDAR_TIMEZONE);
  const tomorrowKey = addCalendarDays(todayKey, 1);
  const yesterdayKey = addCalendarDays(todayKey, -1);

  const upcoming = await listCalendarEvents(
    new Date(now).toISOString(),
    new Date(now + LOOKBACK_HOURS * MS_HOUR).toISOString()
  );

  for (const event of upcoming) {
    const props = event.extendedProperties;
    if (reminderAlreadySent(props)) continue;

    const startDateKey = getDateKeyInTimezone(event.start, CALENDAR_TIMEZONE);
    if (startDateKey !== tomorrowKey) continue;

    const paymentId = props.paymentId?.trim();
    const metadata = await resolveMetadataForEvent(paymentId, props.customerEmail);
    if (!metadata?.email && !props.customerEmail) continue;

    const merged = {
      ...metadata,
      email: metadata?.email ?? props.customerEmail ?? '',
      slotStart: metadata?.slotStart || event.start,
      slotEnd: metadata?.slotEnd || event.end,
    };

    const details = buildBookingEmailDetails(merged);
    if (!details) continue;

    try {
      await sendDayBeforeReminderEmail(details, event.id);
      await patchCalendarEventExtendedProperties(event.id, {
        reminderDayBeforeSent: '1',
      });
      remindersSent += 1;
    } catch (err) {
      errors.push(
        `reminder ${event.id}: ${err instanceof Error ? err.message : 'failed'}`
      );
    }
  }

  const recent = await listCalendarEvents(
    new Date(now - LOOKBACK_HOURS * MS_HOUR).toISOString(),
    new Date(now).toISOString()
  );

  for (const event of recent) {
    const props = event.extendedProperties;
    if (props.tiktokPromo !== '1') continue;
    if (props.tiktokPostSent === '1') continue;

    const endDateKey = getDateKeyInTimezone(event.end, CALENDAR_TIMEZONE);
    if (endDateKey !== yesterdayKey) continue;

    const paymentId = props.paymentId?.trim();
    const metadata = await resolveMetadataForEvent(paymentId, props.customerEmail);
    if (!metadata?.email && !props.customerEmail) continue;

    const merged = {
      ...metadata,
      email: metadata?.email ?? props.customerEmail ?? '',
      slotStart: metadata?.slotStart || event.start,
      slotEnd: metadata?.slotEnd || event.end,
      tiktokPromo: 'yes',
    };

    const details = buildBookingEmailDetails(merged);
    if (!details) continue;

    try {
      await sendTiktokPostVisitEmail(details, event.id);
      await patchCalendarEventExtendedProperties(event.id, { tiktokPostSent: '1' });
      tiktokSent += 1;
    } catch (err) {
      errors.push(
        `tiktok ${event.id}: ${err instanceof Error ? err.message : 'failed'}`
      );
    }
  }

  return { remindersSent, tiktokSent, errors };
}
