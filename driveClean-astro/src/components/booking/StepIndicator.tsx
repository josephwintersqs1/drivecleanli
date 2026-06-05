interface StepIndicatorProps {
  current: number;
  labels: string[];
}

export function StepIndicator({ current, labels }: StepIndicatorProps) {
  return (
    <nav aria-label="Booking progress" className="mb-8">
      <ol className="flex flex-wrap gap-2 sm:gap-4">
        {labels.map((label, i) => {
          const step = i + 1;
          const active = step === current;
          const done = step < current;
          return (
            <li
              key={label}
              className={`flex items-center gap-2 text-sm ${
                active
                  ? 'font-semibold text-red-500'
                  : done
                    ? 'text-emerald-400'
                    : 'text-white/40'
              }`}
            >
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                  active
                    ? 'bg-red-600 text-white'
                    : done
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-white/10 text-white/50'
                }`}
                aria-current={active ? 'step' : undefined}
              >
                {done ? '✓' : step}
              </span>
              <span className="hidden sm:inline">{label}</span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
