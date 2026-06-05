import { useCallback, useEffect, useState } from 'react';
import {
  formatDurationFromMinutes,
  getServiceById,
  getTotalDurationMinutes,
} from '../../data/services';
import { BookingCalendar } from './BookingCalendar';
import {
  bookingHeadingClass,
  bookingSubtextClass,
  bookingCardDefault,
  bookingCardSelected,
} from './booking-styles';

interface TimeSlot {
  start: string;
  end: string;
  label: string;
}

interface ScheduleStepProps {
  serviceId: string;
  addOnIds: string[];
  slotStart: string;
  slotEnd: string;
  onSelect: (start: string, end: string) => void;
}

const INITIAL_SLOT_COUNT = 5;

export function ScheduleStep({
  serviceId,
  addOnIds,
  slotStart,
  slotEnd,
  onSelect,
}: ScheduleStepProps) {
  const [date, setDate] = useState(() =>
    slotStart ? slotStart.slice(0, 10) : ''
  );
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [showAllSlots, setShowAllSlots] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const service = getServiceById(serviceId);
  const durationMinutes = getTotalDurationMinutes(serviceId, addOnIds);
  const [minDate] = useState(() => new Date().toISOString().split('T')[0]);

  const fetchSlots = useCallback(
    async (selectedDate: string) => {
      if (!selectedDate || !service) return;
      setLoading(true);
      setError('');
      try {
        const params = new URLSearchParams({
          date: selectedDate,
          serviceId,
          addOnIds: addOnIds.join(','),
        });
        const res = await fetch(`/api/availability?${params}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? 'Failed to load slots');
        setSlots(data.slots ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not load availability');
        setSlots([]);
      } finally {
        setLoading(false);
      }
    },
    [serviceId, service, addOnIds]
  );

  useEffect(() => {
    if (date) fetchSlots(date);
  }, [date, fetchSlots]);

  const handleDateSelect = (selectedDate: string) => {
    setDate(selectedDate);
    setShowAllSlots(false);
    onSelect('', '');
  };

  const visibleSlots = showAllSlots ? slots : slots.slice(0, INITIAL_SLOT_COUNT);
  const hasMoreSlots = slots.length > INITIAL_SLOT_COUNT;

  return (
    <div>
      <h2 className={bookingHeadingClass}>Pick date & time</h2>
      <p className={bookingSubtextClass}>
        {service
          ? `${service.name} — about ${formatDurationFromMinutes(durationMinutes)} on site.`
          : 'Select an appointment window.'}
      </p>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-10">
        <div className="rounded-2xl border border-white/10 bg-black p-4 sm:p-6">
          <BookingCalendar
            selectedDate={date}
            minDate={minDate}
            onSelectDate={handleDateSelect}
          />
        </div>

        <div className="flex min-h-[280px] flex-col rounded-2xl border border-white/10 bg-white/[0.02] p-4 sm:p-6">
          {!date && (
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <p className="text-sm font-medium text-white/50">Select a date</p>
              <p className="mt-1 text-xs text-white/35">
                Available times will appear here
              </p>
            </div>
          )}

          {date && loading && (
            <div className="flex flex-1 items-center justify-center">
              <p className="text-sm text-white/50" role="status">
                Loading times…
              </p>
            </div>
          )}

          {date && error && (
            <p className="text-red-400" role="alert">
              {error}
            </p>
          )}

          {date && !loading && !error && slots.length === 0 && (
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <p className="text-sm text-white/60">No open slots this day</p>
              <p className="mt-1 text-xs text-white/40">Try another date</p>
            </div>
          )}

          {date && !loading && slots.length > 0 && (
            <fieldset className="flex flex-1 flex-col">
              <legend className="mb-4 text-sm font-semibold text-white/80">
                {new Date(`${date}T12:00:00`).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
              </legend>
              <div className="flex flex-1 flex-col gap-2 overflow-y-auto pr-1">
                {visibleSlots.map((slot) => (
                  <label
                    key={slot.start}
                    className={`cursor-pointer rounded-lg border-2 px-4 py-3.5 text-sm font-medium transition ${
                      slotStart === slot.start ? bookingCardSelected : bookingCardDefault
                    }`}
                  >
                    <input
                      type="radio"
                      name="slot"
                      className="sr-only"
                      checked={slotStart === slot.start}
                      onChange={() => onSelect(slot.start, slot.end)}
                    />
                    <span className="text-white">{slot.label}</span>
                  </label>
                ))}
                {hasMoreSlots && !showAllSlots && (
                  <button
                    type="button"
                    onClick={() => setShowAllSlots(true)}
                    className="mt-1 rounded-lg border border-white/15 py-2.5 text-sm font-medium text-white/70 transition hover:border-white/30 hover:bg-white/5 hover:text-white"
                  >
                    Show more ({slots.length - INITIAL_SLOT_COUNT} more)
                  </button>
                )}
              </div>
            </fieldset>
          )}
        </div>
      </div>

      {slotStart && slotEnd && (
        <p className="mt-6 text-sm text-emerald-400" aria-live="polite">
          Selected:{' '}
          {new Date(slotStart).toLocaleString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
          })}
        </p>
      )}
    </div>
  );
}
