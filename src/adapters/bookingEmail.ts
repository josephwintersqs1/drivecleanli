import {
  formatPrice,
  getAddOnById,
  getServiceById,
  getVehicleTierLabel,
} from '../data/services';
import { formatBookingDate, formatBookingTimeRange } from '../lib/format-booking-slot';

export interface BookingEmailDetails {
  to: string;
  firstName: string;
  lastName: string;
  serviceName: string;
  vehicleLabel: string;
  addOnNames: string[];
  slotStart: string;
  slotEnd: string;
  address: string;
  paymentSummary: string;
  tiktokPromo: boolean;
}

export function buildBookingEmailDetails(
  metadata: Record<string, string>
): BookingEmailDetails | null {
  const email = metadata.email?.trim();
  if (!email) return null;

  const service = getServiceById(metadata.serviceId ?? '');
  const vehicleLabel = getVehicleTierLabel(
    metadata.serviceId ?? '',
    metadata.vehicleTierId ?? ''
  );
  const addOnNames = (metadata.addOnIds ?? '')
    .split(',')
    .filter(Boolean)
    .map((id) => getAddOnById(id)?.name ?? id);

  const paymentMode = metadata.paymentMode ?? 'full';
  const total = metadata.totalAmount ? formatPrice(Number(metadata.totalAmount)) : null;
  const paidToday = metadata.amountDueToday
    ? formatPrice(Number(metadata.amountDueToday))
    : null;
  const balance = metadata.balanceDue ? formatPrice(Number(metadata.balanceDue)) : null;

  const paymentSummary =
    paymentMode === 'deposit' && total && paidToday && balance
      ? `${paidToday} deposit paid · ${balance} due on service day (total ${total})`
      : total
        ? `${total} paid in full`
        : paidToday ?? 'Paid online';

  return {
    to: email,
    firstName: metadata.firstName ?? '',
    lastName: metadata.lastName ?? '',
    serviceName: service?.name ?? 'Mobile detail',
    vehicleLabel,
    addOnNames,
    slotStart: metadata.slotStart,
    slotEnd: metadata.slotEnd,
    address: metadata.address ?? 'Your service address',
    paymentSummary,
    tiktokPromo: metadata.tiktokPromo === 'yes' || metadata.tiktokPromo === '1',
  };
}

function emailShell(title: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>${title}</title></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:Inter,Segoe UI,sans-serif;color:#f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:560px;background:#111;border:1px solid #333;border-radius:16px;padding:32px 28px;">
        <tr><td>
          <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.25em;text-transform:uppercase;color:#dc2626;">DriveClean LI</p>
          ${bodyHtml}
          <p style="margin:32px 0 0;font-size:13px;color:#888;line-height:1.6;">
            Questions? Reply to this email or call <a href="tel:+16317645337" style="color:#f87171;">(631) 764-5337</a>.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function detailsBlock(details: BookingEmailDetails): string {
  const lines = [
    `<strong>Date:</strong> ${formatBookingDate(details.slotStart)}`,
    `<strong>Arrival window:</strong> ${formatBookingTimeRange(details.slotStart, details.slotEnd)}`,
    `<strong>Service:</strong> ${details.serviceName}`,
  ];
  if (details.vehicleLabel !== 'Standard') {
    lines.push(`<strong>Vehicle:</strong> ${details.vehicleLabel}`);
  }
  if (details.addOnNames.length) {
    lines.push(`<strong>Add-ons:</strong> ${details.addOnNames.join(', ')}`);
  }
  lines.push(`<strong>Location:</strong> ${details.address}`);
  lines.push(`<strong>Payment:</strong> ${details.paymentSummary}`);

  return `<ul style="margin:16px 0 0;padding-left:20px;line-height:1.7;color:#d4d4d4;">
    ${lines.map((line) => `<li style="margin-bottom:6px;">${line}</li>`).join('')}
  </ul>`;
}

export function buildConfirmationEmailContent(details: BookingEmailDetails): {
  subject: string;
  html: string;
  text: string;
} {
  const name = details.firstName || 'there';
  const subject = `Booking confirmed — ${formatBookingDate(details.slotStart)}`;
  const text = [
    `Hi ${name},`,
    '',
    'Your DriveClean appointment is confirmed. Here are the details:',
    '',
    `Date: ${formatBookingDate(details.slotStart)}`,
    `Arrival window: ${formatBookingTimeRange(details.slotStart, details.slotEnd)}`,
    `Service: ${details.serviceName}`,
    `Location: ${details.address}`,
    `Payment: ${details.paymentSummary}`,
    '',
    'We will email you a reminder 1 hour before we arrive.',
    '',
    '— DriveClean Mobile Detailing',
  ].join('\n');

  const html = emailShell(
    subject,
    `<h1 style="margin:0;font-size:24px;color:#6ee7b7;">You're all set, ${name}!</h1>
     <p style="margin:16px 0 0;line-height:1.6;color:#d4d4d4;">
       Your appointment is confirmed. We will see you then.
     </p>
     ${detailsBlock(details)}
     <p style="margin:20px 0 0;line-height:1.6;color:#a7f3d0;">
       We will send a reminder 1 hour before your arrival window.
     </p>`
  );

  return { subject, html, text };
}

export function buildOneHourReminderEmailContent(details: BookingEmailDetails): {
  subject: string;
  html: string;
  text: string;
} {
  const name = details.firstName || 'there';
  const subject = `Reminder: DriveClean arrives in 1 hour`;
  const window = formatBookingTimeRange(details.slotStart, details.slotEnd);

  const text = [
    `Hi ${name},`,
    '',
    'Friendly reminder — DriveClean will arrive in about 1 hour.',
    '',
    `Arrival window: ${window}`,
    `Location: ${details.address}`,
    '',
    'Please ensure we have access to your vehicle. See you soon!',
    '',
    '— DriveClean Mobile Detailing',
  ].join('\n');

  const html = emailShell(
    subject,
    `<h1 style="margin:0;font-size:24px;color:#fbbf24;">See you in 1 hour, ${name}</h1>
     <p style="margin:16px 0 0;line-height:1.6;color:#d4d4d4;">
       This is your reminder that DriveClean will arrive during your scheduled window today.
     </p>
     <p style="margin:16px 0 0;line-height:1.6;color:#d4d4d4;">
       <strong>Arrival window:</strong> ${window}<br>
       <strong>Location:</strong> ${details.address}
     </p>
     <p style="margin:20px 0 0;line-height:1.6;color:#a7f3d0;">
       Please make sure we can access your vehicle. We are looking forward to it!
     </p>`
  );

  return { subject, html, text };
}

export function buildTiktokPostVisitEmailContent(details: BookingEmailDetails): {
  subject: string;
  html: string;
  text: string;
} {
  const name = details.firstName || 'there';
  const subject = 'Share your detail on TikTok — thanks for riding with DriveClean';
  const text = [
    `Hi ${name},`,
    '',
    'Hope your vehicle is looking great after today\'s detail!',
    '',
    'You opted into our TikTok promo — when you share your experience, tag @drive.clean.li so we can say thanks.',
    '',
    'Thank you for choosing DriveClean!',
    '',
    '— DriveClean Mobile Detailing',
  ].join('\n');

  const html = emailShell(
    subject,
    `<h1 style="margin:0;font-size:24px;color:#6ee7b7;">Thanks for riding with us, ${name}!</h1>
     <p style="margin:16px 0 0;line-height:1.6;color:#d4d4d4;">
       We hope your vehicle is shining after today's detail.
     </p>
     <p style="margin:16px 0 0;line-height:1.6;color:#d4d4d4;">
       You joined our TikTok promo — share your experience and tag
       <strong style="color:#fff;">@drive.clean.li</strong> so we can celebrate with you.
     </p>
     <p style="margin:20px 0 0;line-height:1.6;color:#a7f3d0;">
       Thank you for trusting DriveClean with your ride!
     </p>`
  );

  return { subject, html, text };
}
