import { useCallback, useState } from 'react';
import {
  getDefaultVehicleTierId,
  getServiceById,
  serviceHasVehicleTiers,
} from '../../data/services';
import {
  isValidServiceAddress,
  normalizeUSPhone,
  validateNotes,
  validateUSPhone,
} from '../../lib/validate-contact';
import { initialBookingState, type BookingState } from '../../types/booking';
import type { ServiceAddress } from '../../types/address';
import { StepIndicator } from './StepIndicator';
import { ServiceStep } from './ServiceStep';
import { ConfigureStep } from './ConfigureStep';
import { ScheduleStep } from './ScheduleStep';
import { PromoStep } from './PromoStep';
import { ContactStep } from './ContactStep';
import { ReviewStep } from './ReviewStep';
import { BookingStepPanel } from './BookingStepPanel';
import { bookingBtnPrimary, bookingBtnSecondary } from './booking-styles';

const STEP_LABELS = ['Service', 'Configure', 'Offer', 'Schedule', 'Contact', 'Review'];
const STEP_TRANSITION_MS = 340;
const FINAL_STEP = 6;
const PROMO_STEP = 3;
const SCHEDULE_STEP = 4;
const CONTACT_STEP = 5;

interface BookingWizardProps {
  confirmed?: boolean;
  confirmedPaymentMode?: 'full' | 'deposit';
  initialServiceId?: string;
}

function buildInitialState(initialServiceId?: string): BookingState {
  const serviceId = initialServiceId?.trim() ?? '';
  const service = serviceId ? getServiceById(serviceId) : undefined;

  return {
    ...initialBookingState,
    serviceId: service ? serviceId : '',
    vehicleTierId: service ? getDefaultVehicleTierId(serviceId) : '',
    step: service ? 2 : 1,
  };
}

export function BookingWizard({
  confirmed,
  confirmedPaymentMode = 'full',
  initialServiceId,
}: BookingWizardProps) {
  const [state, setState] = useState<BookingState>(() =>
    buildInitialState(initialServiceId)
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [phase, setPhase] = useState<'idle' | 'out' | 'in'>('idle');
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');
  const [contactShowErrors, setContactShowErrors] = useState(false);

  const isTransitioning = phase !== 'idle';

  const update = (patch: Partial<BookingState>) =>
    setState((prev) => ({ ...prev, ...patch }));

  const transitionToStep = useCallback(
    (next: number, dir: 'forward' | 'back', patch?: Partial<BookingState>) => {
      if (phase !== 'idle') return;
      setDirection(dir);
      setPhase('out');
      window.setTimeout(() => {
        setState((prev) => ({ ...prev, ...patch, step: next }));
        setPhase('in');
        window.setTimeout(() => setPhase('idle'), STEP_TRANSITION_MS);
      }, STEP_TRANSITION_MS);
    },
    [phase]
  );

  const canNext = (): boolean => {
    switch (state.step) {
      case 1:
        return !!state.serviceId;
      case 2: {
        if (!state.serviceId) return false;
        if (serviceHasVehicleTiers(state.serviceId)) {
          return !!state.vehicleTierId;
        }
        return true;
      }
      case PROMO_STEP:
        return state.tiktokPromo !== null;
      case SCHEDULE_STEP:
        return !!state.slotStart && !!state.slotEnd;
      case CONTACT_STEP:
        return (
          !!state.firstName.trim() &&
          !!state.lastName.trim() &&
          validateUSPhone(state.phone) &&
          isValidServiceAddress(state.serviceAddress) &&
          validateNotes(state.notes)
        );
      default:
        return true;
    }
  };

  const handleCheckout = async () => {
    const normalizedPhone = normalizeUSPhone(state.phone);
    if (!normalizedPhone || !isValidServiceAddress(state.serviceAddress)) {
      setError('Please complete all contact fields with a valid address and phone.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: state.serviceId,
          vehicleTierId: state.vehicleTierId,
          addOnIds: state.addOnIds,
          paymentMode: state.paymentMode,
          slotStart: state.slotStart,
          slotEnd: state.slotEnd,
          firstName: state.firstName.trim(),
          lastName: state.lastName.trim(),
          phone: normalizedPhone,
          address: state.serviceAddress,
          notes: state.notes.trim(),
          tiktokPromo: state.tiktokPromo === true,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Checkout failed');
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout failed');
      setLoading(false);
    }
  };

  const handleServiceSelect = (id: string) => {
    setContactShowErrors(false);
    setPhase('idle');
    setState((prev) => ({
      ...prev,
      serviceId: id,
      vehicleTierId: getDefaultVehicleTierId(id),
      addOnIds: [],
      tiktokPromo: null,
      step: 2,
    }));
  };

  const renderStep = () => {
    switch (state.step) {
      case 1:
        return (
          <ServiceStep selectedId={state.serviceId} onSelect={handleServiceSelect} />
        );
      case 2:
        return (
          <ConfigureStep
            serviceId={state.serviceId}
            vehicleTierId={state.vehicleTierId}
            addOnIds={state.addOnIds}
            onVehicleChange={(vehicleTierId) => update({ vehicleTierId })}
            onAddOnToggle={(id) =>
              update({
                addOnIds: state.addOnIds.includes(id)
                  ? state.addOnIds.filter((a) => a !== id)
                  : [...state.addOnIds, id],
              })
            }
          />
        );
      case PROMO_STEP:
        return (
          <PromoStep
            serviceId={state.serviceId}
            vehicleTierId={state.vehicleTierId}
            addOnIds={state.addOnIds}
            tiktokPromo={state.tiktokPromo}
            onSelect={(accepted) => update({ tiktokPromo: accepted })}
          />
        );
      case SCHEDULE_STEP:
        return (
          <ScheduleStep
            serviceId={state.serviceId}
            addOnIds={state.addOnIds}
            slotStart={state.slotStart}
            slotEnd={state.slotEnd}
            onSelect={(slotStart, slotEnd) => update({ slotStart, slotEnd })}
          />
        );
      case CONTACT_STEP:
        return (
          <ContactStep
            firstName={state.firstName}
            lastName={state.lastName}
            phone={state.phone}
            serviceAddress={state.serviceAddress}
            notes={state.notes}
            showErrors={contactShowErrors}
            onChange={(field, value) => {
              if (field === 'serviceAddress') {
                update({ serviceAddress: value as ServiceAddress | null });
              } else {
                update({ [field]: value as string });
              }
            }}
          />
        );
      case FINAL_STEP:
        return (
          <ReviewStep
            state={state}
            loading={loading}
            error={error}
            onPaymentModeChange={(paymentMode) => update({ paymentMode })}
            onSubmit={handleCheckout}
          />
        );
      default:
        return null;
    }
  };

  if (confirmed) {
    const isDeposit = confirmedPaymentMode === 'deposit';
    return (
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-8 text-center">
        <h2 className="text-2xl font-bold text-emerald-300">Booking confirmed!</h2>
        <p className="mt-2 text-emerald-200/90">
          {isDeposit
            ? 'Your deposit has been received. We will collect the remaining balance on the day of your appointment.'
            : 'Payment received in full. Your appointment has been scheduled — we will see you soon.'}
        </p>
        <a
          href="/"
          className="mt-6 inline-block font-semibold text-red-500 hover:text-red-400"
        >
          Back to home
        </a>
      </div>
    );
  }

  return (
    <div>
      <StepIndicator current={state.step} labels={STEP_LABELS} />

      <BookingStepPanel step={state.step} phase={phase} direction={direction}>
        {renderStep()}
      </BookingStepPanel>

      {state.step < FINAL_STEP && (
        <div className="mt-8 flex justify-between">
          <button
            type="button"
            onClick={() => transitionToStep(Math.max(1, state.step - 1), 'back')}
            disabled={state.step === 1 || isTransitioning}
            className={bookingBtnSecondary}
          >
            Back
          </button>
          <button
            type="button"
            onClick={() => {
              if (state.step === CONTACT_STEP && !canNext()) {
                setContactShowErrors(true);
                return;
              }
              setContactShowErrors(false);
              transitionToStep(state.step + 1, 'forward');
            }}
            disabled={isTransitioning || (state.step !== CONTACT_STEP && !canNext())}
            className={bookingBtnPrimary}
          >
            Continue
          </button>
        </div>
      )}

      {state.step === FINAL_STEP && (
        <button
          type="button"
          onClick={() => transitionToStep(CONTACT_STEP, 'back')}
          disabled={isTransitioning}
          className="mt-4 text-sm text-white/50 hover:text-white/80 disabled:opacity-40"
        >
          ← Edit contact info
        </button>
      )}
    </div>
  );
}
