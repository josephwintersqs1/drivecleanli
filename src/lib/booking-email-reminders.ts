import { expandSquareOrderMetadata } from '../adapters/squareOrderMetadata';
import { buildBookingEmailDetails } from '../adapters/bookingEmail';
import {
  getCalendarEventById,
  listCalendarEvents,
  patchCalendarEventExtendedProperties,
} from './google';
import {
  sendOneHourReminderEmail,
  sendTiktokPostVisitEmail,
} from './email';
import { getOrderBookingMetadata } from './square';

const MS_MINUTE = 60 * 1000;

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

function isInWindow(iso: string, minMs: number, maxMs: number, now: number): boolean {
  const target = new Date(iso).getTime();
  return target >= now + minMs && target <= now + maxMs;
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

  const upcoming = await listCalendarEvents(
    new Date(now).toISOString(),
    new Date(now + 2 * 60 * MS_MINUTE).toISOString()
  );

  for (const event of upcoming) {
    const props = event.extendedProperties;
    if (props.reminder1hSent === '1') continue;
    if (!isInWindow(event.start, 50 * MS_MINUTE, 70 * MS_MINUTE, now)) continue;

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
      await sendOneHourReminderEmail(details, event.id);
      await patchCalendarEventExtendedProperties(event.id, { reminder1hSent: '1' });
      remindersSent += 1;
    } catch (err) {
      errors.push(
        `reminder ${event.id}: ${err instanceof Error ? err.message : 'failed'}`
      );
    }
  }

  const recent = await listCalendarEvents(
    new Date(now - 2 * 60 * MS_MINUTE).toISOString(),
    new Date(now).toISOString()
  );

  for (const event of recent) {
    const props = event.extendedProperties;
    if (props.tiktokPromo !== '1') continue;
    if (props.tiktokPostSent === '1') continue;
    if (!isInWindow(event.end, -70 * MS_MINUTE, -50 * MS_MINUTE, now)) continue;

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
