import {
  formatDurationFromMinutes,
  formatPrice,
  getServiceImage,
  type ServicePackage,
} from '../../data/services';

interface BookingServiceMediaProps {
  service: ServicePackage;
  /** hero = configure step; row = 2-up picker (image left, text right) */
  variant?: 'hero' | 'row';
}

function ServiceImage({
  imageSrc,
  name,
  className,
}: {
  imageSrc: string;
  name: string;
  className?: string;
}) {
  return (
    <div className={`relative overflow-hidden bg-zinc-900 ${className ?? ''}`}>
      <img
        src={imageSrc}
        alt=""
        width={640}
        height={480}
        className="absolute inset-0 h-full w-full object-cover object-center"
        loading="lazy"
      />
      <span className="sr-only">{name}</span>
    </div>
  );
}

export function BookingServiceMedia({
  service,
  variant = 'hero',
}: BookingServiceMediaProps) {
  const imageSrc = getServiceImage(service.id);

  if (variant === 'row') {
    return (
      <div className="flex h-full min-h-[8.5rem] w-full">
        <ServiceImage
          imageSrc={imageSrc}
          name={service.name}
          className="w-[5.75rem] shrink-0 self-stretch sm:w-28"
        />
        <div className="flex min-w-0 flex-1 flex-col justify-center p-4 sm:p-5">
          <h3 className="font-semibold leading-snug text-white">{service.name}</h3>
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-white/55">
            {service.description}
          </p>
          <div className="mt-3 flex items-center justify-between gap-2 text-sm">
            <span className="text-white/50">
              {formatDurationFromMinutes(service.baseDurationMinutes)}+
            </span>
            <span className="shrink-0 font-bold text-red-500">
              From {formatPrice(service.fromPrice)}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8 grid gap-6 border-b border-white/10 pb-8 sm:grid-cols-[minmax(0,240px)_1fr] sm:items-stretch lg:grid-cols-[minmax(0,280px)_1fr]">
      <ServiceImage
        imageSrc={imageSrc}
        name={service.name}
        className="aspect-[4/3] sm:aspect-auto sm:min-h-[12rem]"
      />
      <div className="flex min-w-0 flex-col justify-center sm:py-2">
        <h2 className="text-2xl font-semibold text-white sm:text-3xl">{service.name}</h2>
        <p className="mt-3 text-sm leading-relaxed text-white/60 sm:text-base">
          {service.description}
        </p>
        <div className="mt-4 flex flex-wrap items-baseline gap-x-4 gap-y-1 text-sm">
          <span className="text-white/50">
            {formatDurationFromMinutes(service.baseDurationMinutes)}+
          </span>
          <span className="font-bold text-red-500">
            From {formatPrice(service.fromPrice)}
          </span>
        </div>
      </div>
    </div>
  );
}
