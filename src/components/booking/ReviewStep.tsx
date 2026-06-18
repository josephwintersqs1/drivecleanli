import {
  formatPrice,
  getAddOnById,
  getServiceById,
  getVehicleTierLabel,
  type PaymentMode,
} from '../../data/services';
import { getBookingPriceSummary } from '../../lib/tiktok-promo';
import { formatUSPhoneDisplay } from '../../lib/validate-contact';
import type { BookingState } from '../../types/booking';
import { bookingBtnPrimary, bookingHeadingClass, bookingSubtextClass } from './booking-styles';
import { PromoPriceDisplay } from './PromoPriceDisplay';

interface ReviewStepProps {
  state: BookingState;
  loading: boolean;
  error: string;
  onPaymentModeChange: (mode: PaymentMode) => void;
  onSubmit: () => void;
}

export function ReviewStep({
  state,
  loading,
  error,
  onPaymentModeChange,
  onSubmit,
}: ReviewStepProps) {
  const service = getServiceById(state.serviceId);
  const addOnNames = state.addOnIds
    .map((id) => getAddOnById(id)?.name)
    .filter(Boolean);
  const tiktokPromo = state.tiktokPromo === true;
  const { subtotal, total, dueToday, balanceDue } = getBookingPriceSummary(
    state.serviceId,
    state.vehicleTierId,
    state.addOnIds,
    state.paymentMode,
    tiktokPromo
  );
  const vehicleLabel = getVehicleTierLabel(state.serviceId, state.vehicleTierId);

  return (
    <div>
      <h2 className={bookingHeadingClass}>Review & pay</h2>
      <p className={bookingSubtextClass}>Confirm your booking before checkout.</p>

      <dl className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <Row label="Service" value={service?.name ?? '—'} />
        {vehicleLabel !== 'Standard' && <Row label="Vehicle" value={vehicleLabel} />}
        {addOnNames.length > 0 && (
          <Row label="Add-ons" value={addOnNames.join(', ')} alignRight />
        )}
        {tiktokPromo && (
          <Row label="TikTok promo" value="10% off applied" valueClass="text-emerald-400" />
        )}
        <Row
          label="When"
          value={
            state.slotStart
              ? new Date(state.slotStart).toLocaleString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })
              : '—'
          }
          alignRight
        />
        <Row
          label="Where"
          value={state.serviceAddress?.formatted ?? '—'}
          alignRight
        />
        <Row
          label="Contact"
          value={`${state.firstName} ${state.lastName} · ${formatUSPhoneDisplay(state.phone)}`}
          alignRight
        />
        <Row label="Email" value={state.email.trim() || '—'} alignRight />
        {state.notes.trim() && (
          <Row label="Notes" value={state.notes.trim()} alignRight />
        )}
        <div className="border-t border-white/10 pt-3">
          <dt className="mb-2 font-semibold text-white">Total</dt>
          <dd>
            <PromoPriceDisplay subtotal={subtotal} total={total} />
          </dd>
        </div>
      </dl>

      <fieldset className="mt-8">
        <legend className="mb-4 text-base font-medium text-white">Payment option</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          <PaymentOption
            id="pay-full"
            title="Pay in full"
            description={`Charge ${formatPrice(total)} now`}
            selected={state.paymentMode === 'full'}
            onSelect={() => onPaymentModeChange('full')}
          />
          <PaymentOption
            id="pay-deposit"
            title="50% deposit"
            description={`Pay ${formatPrice(dueToday)} now · ${formatPrice(balanceDue)} on service day`}
            selected={state.paymentMode === 'deposit'}
            onSelect={() => onPaymentModeChange('deposit')}
          />
        </div>
      </fieldset>

      <div
        className={`mt-6 rounded-xl border px-5 py-4 ${
          tiktokPromo ? 'border-emerald-500/30 bg-emerald-500/10' : 'border-white/10 bg-white/[0.03]'
        }`}
        aria-live="polite"
      >
        <span className="text-sm text-white/55">Due today at checkout</span>
        <p className={`text-2xl font-bold ${tiktokPromo ? 'text-emerald-400' : 'text-white'}`}>
          {formatPrice(dueToday)}
        </p>
        {state.paymentMode === 'deposit' && balanceDue > 0 && (
          <p className="mt-1 text-sm text-white/50">
            Remaining {formatPrice(balanceDue)} collected on the day of your appointment.
          </p>
        )}
      </div>

      {error && (
        <p className="mt-4 text-red-400" role="alert">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={onSubmit}
        disabled={loading}
        className={`mt-6 w-full py-4 text-base ${bookingBtnPrimary}`}
      >
        {loading
          ? 'Creating checkout…'
          : state.paymentMode === 'deposit'
            ? `Pay ${formatPrice(dueToday)} deposit`
            : `Pay ${formatPrice(dueToday)}`}
      </button>
    </div>
  );
}

function Row({
  label,
  value,
  alignRight,
  valueClass = 'text-white',
}: {
  label: string;
  value: string;
  alignRight?: boolean;
  valueClass?: string;
}) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-white/50">{label}</dt>
      <dd
        className={`font-medium ${valueClass} ${alignRight ? 'text-right' : ''}`}
      >
        {value}
      </dd>
    </div>
  );
}

function PaymentOption({
  id,
  title,
  description,
  selected,
  onSelect,
}: {
  id: string;
  title: string;
  description: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <label
      htmlFor={id}
      className={`flex cursor-pointer flex-col rounded-xl border-2 p-4 transition ${
        selected
          ? 'border-red-600 bg-red-600/10 ring-1 ring-red-600/40'
          : 'border-white/10 bg-white/[0.03] hover:border-white/25'
      }`}
    >
      <span className="flex items-start gap-3">
        <input
          id={id}
          type="radio"
          name="paymentMode"
          checked={selected}
          onChange={onSelect}
          className="mt-1 h-4 w-4 text-red-600 focus:ring-red-600"
        />
        <span>
          <span className="block font-semibold text-white">{title}</span>
          <span className="mt-1 block text-sm text-white/55">{description}</span>
        </span>
      </span>
    </label>
  );
}
