import { services, type ServicePackage } from '../../data/services';
import { BookingServiceMedia } from './BookingServiceMedia';
import {
  bookingCardDefault,
  bookingCardSelected,
  bookingHeadingClass,
  bookingSubtextClass,
} from './booking-styles';

interface ServiceStepProps {
  selectedId: string;
  onSelect: (id: string) => void;
}

export function ServiceStep({ selectedId, onSelect }: ServiceStepProps) {
  return (
    <div>
      <h2 className={bookingHeadingClass}>Choose your service</h2>
      <p className={bookingSubtextClass}>
        Select the detail package that fits your needs.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {services.map((service: ServicePackage) => (
          <button
            key={service.id}
            type="button"
            onClick={() => onSelect(service.id)}
            className={`flex h-full overflow-hidden rounded-2xl border-2 p-0 text-left transition focus:outline-none focus:ring-2 focus:ring-red-600 ${
              selectedId === service.id ? bookingCardSelected : bookingCardDefault
            }`}
            aria-pressed={selectedId === service.id}
          >
            <BookingServiceMedia service={service} variant="row" />
          </button>
        ))}
      </div>
    </div>
  );
}
