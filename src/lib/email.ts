import { Resend } from 'resend';
import {
  buildBookingEmailDetails,
  buildConfirmationEmailContent,
  buildOneHourReminderEmailContent,
  buildTiktokPostVisitEmailContent,
  type BookingEmailDetails,
} from '../adapters/bookingEmail';

const OWNER_BCC = 'services@drivecleanli.com';

function getResend(): Resend {
  const apiKey = import.meta.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not configured');
  }
  return new Resend(apiKey);
}

function getFromAddress(): string {
  return (
    import.meta.env.RESEND_FROM_EMAIL?.trim() ||
    'DriveClean <services@drivecleanli.com>'
  );
}

async function sendEmail(
  details: BookingEmailDetails,
  content: { subject: string; html: string; text: string },
  idempotencyKey?: string
): Promise<void> {
  const resend = getResend();
  const { error } = await resend.emails.send({
    from: getFromAddress(),
    to: details.to,
    bcc: OWNER_BCC,
    subject: content.subject,
    html: content.html,
    text: content.text,
    ...(idempotencyKey ? { headers: { 'Idempotency-Key': idempotencyKey } } : {}),
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function sendBookingConfirmationEmail(
  metadata: Record<string, string>,
  paymentId?: string
): Promise<boolean> {
  const details = buildBookingEmailDetails(metadata);
  if (!details) return false;

  const content = buildConfirmationEmailContent(details);
  const key = paymentId ? `confirm-${paymentId}` : undefined;
  await sendEmail(details, content, key);
  return true;
}

export async function sendOneHourReminderEmail(
  details: BookingEmailDetails,
  eventId: string
): Promise<void> {
  const content = buildOneHourReminderEmailContent(details);
  await sendEmail(details, content, `reminder-1h-${eventId}`);
}

export async function sendTiktokPostVisitEmail(
  details: BookingEmailDetails,
  eventId: string
): Promise<void> {
  const content = buildTiktokPostVisitEmailContent(details);
  await sendEmail(details, content, `tiktok-post-${eventId}`);
}

export { buildBookingEmailDetails };
