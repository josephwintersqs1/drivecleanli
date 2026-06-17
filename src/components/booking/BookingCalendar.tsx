import { useMemo, useState } from 'react';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

interface BookingCalendarProps {
  selectedDate: string;
  minDate: string;
  onSelectDate: (date: string) => void;
}

function toDateString(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function parseDateString(iso: string): { year: number; month: number; day: number } {
  const [y, m, d] = iso.split('-').map(Number);
  return { year: y, month: m - 1, day: d };
}

function getMonthCells(year: number, month: number) {
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: Array<{ day: number; date: string } | null> = [];

  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({ day, date: toDateString(year, month, day) });
  }
  return cells;
}

export function BookingCalendar({
  selectedDate,
  minDate,
  onSelectDate,
}: BookingCalendarProps) {
  const initial = selectedDate
    ? parseDateString(selectedDate)
    : parseDateString(minDate);

  const [viewYear, setViewYear] = useState(initial.year);
  const [viewMonth, setViewMonth] = useState(initial.month);

  const cells = useMemo(
    () => getMonthCells(viewYear, viewMonth),
    [viewYear, viewMonth]
  );

  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const shiftMonth = (delta: number) => {
    const next = new Date(viewYear, viewMonth + delta, 1);
    setViewYear(next.getFullYear());
    setViewMonth(next.getMonth());
  };

  const minParts = parseDateString(minDate);
  const viewMonthStart = new Date(viewYear, viewMonth, 1).getTime();
  const minMonthStart = new Date(minParts.year, minParts.month, 1).getTime();
  const canGoPrev = viewMonthStart > minMonthStart;

  return (
    <div className="booking-calendar select-none">
      <div className="mb-6 flex items-center justify-between">
        <button
          type="button"
          onClick={() => shiftMonth(-1)}
          disabled={!canGoPrev}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-white/80 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-25"
          aria-label="Previous month"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M15 6l-6 6 6 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <p className="text-lg font-medium text-white">{monthLabel}</p>
        <button
          type="button"
          onClick={() => shiftMonth(1)}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-white/80 transition hover:bg-white/10"
          aria-label="Next month"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M9 6l6 6-6 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-7 gap-y-1 text-center">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="pb-3 text-xs font-medium tracking-wide text-white/90"
          >
            {day}
          </div>
        ))}

        {cells.map((cell, index) => {
          if (!cell) {
            return <div key={`empty-${index}`} aria-hidden="true" />;
          }

          const isPast = cell.date < minDate;
          const isSelected = cell.date === selectedDate;
          const isSelectable = !isPast;

          return (
            <button
              key={cell.date}
              type="button"
              disabled={isPast}
              onClick={() => onSelectDate(cell.date)}
              aria-label={`${cell.day}, ${monthLabel}`}
              aria-pressed={isSelected}
              className={`relative mx-auto flex h-11 w-11 flex-col items-center justify-center rounded-md text-sm transition ${
                isSelected
                  ? 'bg-neutral-400 font-semibold text-black'
                  : isPast
                    ? 'cursor-not-allowed text-white/20'
                    : 'text-white hover:bg-white/10'
              }`}
            >
              <span>{cell.day}</span>
              {isSelectable && !isSelected && (
                <span
                  className="absolute bottom-1.5 h-1 w-1 rounded-full bg-white"
                  aria-hidden="true"
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
