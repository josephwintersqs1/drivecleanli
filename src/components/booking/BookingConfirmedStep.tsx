import { useEffect, useState } from 'react';
import {
  formatPrice,
  getAddOnById,
  getServiceById,
  getVehicleTierLabel,
} from '../../data/services';
import type { BookingConfirmationSnapshot } from '../../adapters/bookingConfirmation';
import { readBookingConfirmation } from '../../lib/booking-confirmation-storage';
import { formatBookingDate, formatBookingTimeRange } from '../../lib/format-booking-slot';
import type { PaymentMode } from '../../data/services';

interface BookingConfirmedStepProps {
  paymentMode: PaymentMode;
  initialSnapshot?: BookingConfirmationSnapshot | null;
  squareOrderId?: string;
}

export function BookingConfirmedStep({
  paymentMode,
  initialSnapshot = null,
  squareOrderId = '',
}: BookingConfirmedStepProps) {
  const [snapshot, setSnapshot] = useState<BookingConfirmationSnapshot | null>(
    initialSnapshot
  );
  const [ready, setReady] = useState(Boolean(initialSnapshot));

  useEffect(() => {
    if (initialSnapshot) {
      requestAnimationFrame(() => setReady(true));
      return;
    }

    const stored = readBookingConfirmation();
    if (stored) {
      setSnapshot(stored);
      requestAnimationFrame(() => setReady(true));
      return;
    }

    const orderId =
      squareOrderId ||
      new URLSearchParams(window.location.search).get('orderId') ||
      '';

    if (!orderId) {
      requestAnimationFrame(() => setReady(true));
      return;
    }

    let cancelled = false;

    void fetch(`/api/booking-confirmation?orderId=${encodeURIComponent(orderId)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: BookingConfirmationSnapshot | null) => {
        if (!cancelled && data?.slotStart) setSnapshot(data);
      })
      .finally(() => {
        if (!cancelled) requestAnimationFrame(() => setReady(true));
      });

    return () => {
      cancelled = true;
    };
  }, [initialSnapshot, squareOrderId]);

  const mode = snapshot?.paymentMode ?? paymentMode;
  const isDeposit = mode === 'deposit';
  const service = snapshot ? getServiceById(snapshot.serviceId) : undefined;
  const vehicleLabel = snapshot
    ? getVehicleTierLabel(snapshot.serviceId, snapshot.vehicleTierId)
    : '';
  const addOnNames =
    snapshot?.addOnIds
      .map((id) => getAddOnById(id)?.name)
      .filter((name): name is string => Boolean(name)) ?? [];

  return (
    <div
      className={`booking-confirmed ${ready ? 'booking-confirmed--ready' : ''}`}
      aria-live="polite"
    >
      <div className="booking-confirmed__hero">
        <div className="booking-confirmed__check" aria-hidden="true">
          <svg viewBox="0 0 52 52" className="booking-confirmed__check-svg">
            <circle className="booking-confirmed__check-circle" cx="26" cy="26" r="25" />
            <path className="booking-confirmed__check-mark" d="M14 27l8 8 16-18" />
          </svg>
        </div>
        <h2 className="booking-confirmed__title">
          {snapshot?.firstName
            ? `You're all set, ${snapshot.firstName}!`
            : 'Booking confirmed!'}
        </h2>
        <p className="booking-confirmed__lead">
          {snapshot
            ? `We've locked in your appointment${isDeposit ? ' with your deposit on file' : ' and received payment in full'}. A confirmation email is on its way — we'll see you then.`
            : isDeposit
              ? 'Your deposit has been received. We will see you on your appointment day.'
              : 'Payment received in full. We will see you on your appointment day.'}
        </p>
      </div>

      {snapshot ? (
        <>
          <dl className="booking-confirmed__summary">
            <SummaryRow
              icon="calendar"
              label="Date"
              value={formatBookingDate(snapshot.slotStart)}
            />
            <SummaryRow
              icon="clock"
              label="Arrival window"
              value={formatBookingTimeRange(snapshot.slotStart, snapshot.slotEnd)}
            />
            <SummaryRow icon="service" label="Service" value={service?.name ?? '—'} />
            {vehicleLabel !== 'Standard' && (
              <SummaryRow icon="vehicle" label="Vehicle" value={vehicleLabel} />
            )}
            {addOnNames.length > 0 && (
              <SummaryRow icon="addon" label="Add-ons" value={addOnNames.join(', ')} />
            )}
            <SummaryRow icon="location" label="Location" value={snapshot.addressFormatted} />
            <SummaryRow
              icon="payment"
              label={isDeposit ? 'Paid today (deposit)' : 'Paid today'}
              value={formatPrice(snapshot.paidAmount)}
              highlight
            />
            {isDeposit && snapshot.balanceDue > 0 && (
              <SummaryRow
                icon="balance"
                label="Due on service day"
                value={formatPrice(snapshot.balanceDue)}
              />
            )}
            {snapshot.tiktokPromo && (
              <SummaryRow
                icon="promo"
                label="TikTok promo"
                value="10% off applied"
                valueClass="text-emerald-400"
              />
            )}
          </dl>

          <section className="booking-confirmed__next" aria-labelledby="confirmed-next-heading">
            <h3 id="confirmed-next-heading" className="booking-confirmed__next-heading">
              What happens next
            </h3>
            <ol className="booking-confirmed__timeline">
              <TimelineStep
                step={1}
                title="You're on the calendar"
                body="Your detail is scheduled. We'll have everything ready for your arrival window."
                active
              />
              <TimelineStep
                step={2}
                title="Reminder before we arrive"
                body="Our system will email you 1 hour before we arrive so you don't forget — no need to watch the clock."
              />
              <TimelineStep
                step={3}
                title="We come to you"
                body={`On ${formatBookingDate(snapshot.slotStart)}, we'll pull up at your location and get to work. Just relax — we've got the rest.`}
              />
            </ol>
          </section>
        </>
      ) : (
        <p className="booking-confirmed__fallback">
          Your payment went through successfully. If you don't receive a confirmation shortly,
          reach out and we'll help you track down your appointment details.
        </p>
      )}

      <a href="/" className="booking-confirmed__home">
        Back to home
      </a>
    </div>
  );
}

function SummaryRow({
  icon,
  label,
  value,
  highlight,
  valueClass = 'text-white',
}: {
  icon: SummaryIconType;
  label: string;
  value: string;
  highlight?: boolean;
  valueClass?: string;
}) {
  return (
    <div className={`booking-confirmed__row ${highlight ? 'booking-confirmed__row--highlight' : ''}`}>
      <dt className="booking-confirmed__row-label">
        <SummaryIcon type={icon} />
        {label}
      </dt>
      <dd className={`booking-confirmed__row-value ${valueClass}`}>{value}</dd>
    </div>
  );
}

type SummaryIconType =
  | 'calendar'
  | 'clock'
  | 'service'
  | 'vehicle'
  | 'addon'
  | 'location'
  | 'payment'
  | 'balance'
  | 'promo';

function SummaryIcon({ type }: { type: SummaryIconType }) {
  const paths: Record<typeof type, string> = {
    calendar:
      'M8 4V2M16 4V2M4 8h16M6 4h12a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2z',
    clock: 'M12 8v4l3 2M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    service: 'M5 13l4 4L19 7',
    vehicle: 'M7 17h10M5 11l2-6h10l2 6M5 11h14',
    addon: 'M12 6v12M6 12h12',
    location: 'M12 11a3 3 0 100-6 3 3 0 000 6zM12 22s8-4.5 8-11a8 8 0 10-16 0c0 6.5 8 11 8 11z',
    payment: 'M3 10h18M7 15h2M17 15h2M6 4h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2z',
    balance: 'M12 8c-2.2 0-4 1.3-4 3s1.8 3 4 3 4 1.3 4 3-1.8 3-4 3',
    promo: 'M9 12l2 2 4-4',
  };

  return (
    <svg
      className="booking-confirmed__row-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[type]} />
    </svg>
  );
}

function TimelineStep({
  step,
  title,
  body,
  active,
}: {
  step: number;
  title: string;
  body: string;
  active?: boolean;
}) {
  return (
    <li className={`booking-confirmed__timeline-step ${active ? 'booking-confirmed__timeline-step--active' : ''}`}>
      <span className="booking-confirmed__timeline-dot" aria-hidden="true">
        {step}
      </span>
      <div>
        <p className="booking-confirmed__timeline-title">{title}</p>
        <p className="booking-confirmed__timeline-body">{body}</p>
      </div>
    </li>
  );
}
