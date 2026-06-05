import type { ReactNode } from 'react';

interface BookingStepPanelProps {
  step: number;
  phase: 'idle' | 'out' | 'in';
  direction: 'forward' | 'back';
  children: ReactNode;
}

export function BookingStepPanel({
  step,
  phase,
  direction,
  children,
}: BookingStepPanelProps) {
  return (
    <div
      key={step}
      className={[
        'booking-funnel-panel',
        phase === 'out' && `booking-funnel-panel--out-${direction}`,
        phase === 'in' && `booking-funnel-panel--in-${direction}`,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </div>
  );
}
